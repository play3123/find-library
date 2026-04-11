"use strict";

const { AsyncLocalStorage } = require("node:async_hooks");
const express = require("express");
const cors = require("cors");
const { XMLParser } = require("fast-xml-parser");
const { REGIONS, DTL_ROWS } = require("./src/codes");

const app = express();
const usageStore = new AsyncLocalStorage();
const DATA4LIBRARY_DAILY_LIMIT = 500;

const LIBCFG = {
  API_BASE: "https://www.data4library.kr/api",
  NLK_SEARCH_API: "https://www.nl.go.kr/NL/search/openApi/search.do",
  PAGE_SIZE: 100,
  BOOK_EXIST_BATCH_SIZE: 20,
  BOOK_EXIST_CACHE_TTL_SEC: 21600,
  REQUEST_TIMEOUT_MS: 20000,
  MAX_LIB_SEARCH_PAGES: 50
};
const SEOUL_REGION_CODE = "11";

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  trimValues: true,
  parseTagValue: false
});

const bookExistCache = new Map();

setInterval(() => {
  const now = Date.now();
  for (const [key, value] of bookExistCache.entries()) {
    if (!value || value.expireAt <= now) {
      bookExistCache.delete(key);
    }
  }
}, 10 * 60 * 1000).unref();

app.use(express.json({ limit: "1mb" }));
app.use((req, res, next) => {
  usageStore.run({ data4libraryCalls: 0 }, next);
});

const allowOrigin = String(process.env.ALLOWED_ORIGIN || "").trim();
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || !allowOrigin || allowOrigin === "*") return callback(null, true);
      return callback(null, origin === allowOrigin);
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"]
  })
);

app.get("/health", (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

app.get("/api/regions", (req, res) => {
  sendJson(res, { rows: REGIONS });
});

app.get("/api/dtls", (req, res) => {
  const regionName = String(req.query.regionName || "").trim();
  if (!regionName) return sendJson(res, { rows: [] });

  const rows = DTL_ROWS
    .filter((row) => row.parentRegionName === regionName)
    .map((row) => ({ name: row.name, code: row.code }));

  sendJson(res, { rows });
});

app.post("/api/books/candidates", async (req, res) => {
  try {
    const query = String(req.body && req.body.query || "").trim();
    if (!query) return res.status(400).json({ error: "query is required" });

    const books = await searchNlkBooks(query, 30);
    const rows = books
      .map((b) => ({
        isbn13: b.isbn13 || isbn13FromAny(b.isbn || ""),
        bookname: b.bookname || "",
        authors: b.authors || "",
        publisher: b.publisher || "",
        publication_year: b.publication_year || ""
      }))
      .filter((b) => b.bookname || b.isbn13);

    sendJson(res, { rows });
  } catch (error) {
    sendError(res, error);
  }
});

app.post("/api/books/resolve-isbn", async (req, res) => {
  try {
    const queryOrIsbn = String(req.body && req.body.queryOrIsbn || "").trim();
    if (!queryOrIsbn) return res.status(400).json({ error: "queryOrIsbn is required" });

    const isbn13 = await resolveIsbn13(queryOrIsbn);
    if (!isbn13) return sendJson(res, { isbn13: "", bookname: "" });

    let bookname = "";
    const digits = queryOrIsbn.replace(/[^0-9Xx]/g, "");
    if (!/^\d{13}$/.test(digits)) {
      const first = await srchBooksFirst(queryOrIsbn);
      bookname = first && first.bookname ? first.bookname : "";
    }

    sendJson(res, { isbn13, bookname });
  } catch (error) {
    sendError(res, error);
  }
});

app.post("/api/search", async (req, res) => {
  try {
    const payload = req.body || {};
    const query = String(payload.query || "").trim();
    const isbn13 = String(payload.isbn13 || "").trim();
    const regionCode = String(payload.regionCode || "").trim();
    const dtlCode = String(payload.dtlCode || "").trim();
    const regionName = String(payload.regionName || "").trim();
    const dtlName = String(payload.dtlName || "").trim();

    if (!isbn13) return res.status(400).json({ error: "isbn13 is required" });
    if (!regionCode) return res.status(400).json({ error: "regionCode is required" });
    if (regionCode !== SEOUL_REGION_CODE && !dtlCode) {
      return res.status(400).json({ error: "dtlCode is required for non-Seoul regions" });
    }

    const libs = await fetchAllLibrariesByBook(isbn13, regionCode, dtlCode);
    const enriched = await enrichLibrariesWithAvailability(libs, isbn13);

    sendJson(res, {
      query,
      isbn13,
      regionName,
      regionCode,
      dtlName,
      dtlCode,
      count: enriched.length,
      rows: enriched.map((l) => ({
        libName: l.libName || "",
        loanAvailable: l.loanAvailable || "",
        address: l.address || "",
        tel: l.tel || "",
        homepage: l.homepage || "",
        libCode: l.libCode || ""
      }))
    });
  } catch (error) {
    sendError(res, error);
  }
});

app.get("/api/client-config", (req, res) => {
  sendJson(res, {
    kakaoJsKey: String(process.env.KAKAO_JS_KEY || "").trim()
  });
});

app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

if (require.main === module) {
  const port = Number(process.env.PORT || 10000);
  app.listen(port, () => {
    console.log(`[library-info] API server listening on ${port}`);
  });
}

function getAuthKey() {
  const key = String(process.env.DATA4LIBRARY_AUTHKEY || "").trim();
  if (!key) throw new Error("DATA4LIBRARY_AUTHKEY is not set");
  return key;
}

function getNlkKey() {
  const key = String(process.env.NLK_KEY || "").trim();
  if (!key) throw new Error("NLK_KEY is not set");
  return key;
}

async function resolveIsbn13(queryOrIsbn) {
  const digits = String(queryOrIsbn || "").replace(/[^0-9Xx]/g, "");
  if (/^\d{13}$/.test(digits)) return digits;

  const first = await srchBooksFirst(queryOrIsbn);
  return first && first.isbn13 ? first.isbn13 : "";
}

async function srchBooksFirst(keyword) {
  const books = await srchBooksList(keyword, 10);
  if (!books.length) return null;
  return books[0];
}

async function srchBooksList(keyword, pageSize) {
  const authKey = getAuthKey();
  const url = buildUrl("/srchBooks", {
    authKey,
    keyword,
    pageNo: 1,
    pageSize: pageSize || 20
  });

  const xmlText = await fetchText(url);
  const parsed = parseXml(xmlText);

  const bookEls = findAllElements(parsed, "book");
  const docEls = findAllElements(parsed, "doc");
  const srcEls = bookEls.length > 0 ? bookEls : docEls;

  if (!srcEls.length) return [];

  return srcEls.map((el) => {
    const isbn13Raw = childText(el, "isbn13");
    const isbnRaw = childText(el, "isbn");
    return {
      isbn13: isbn13Raw || isbn13FromAny(isbnRaw),
      isbn: isbnRaw || "",
      bookname: childText(el, "bookname") || childText(el, "title"),
      authors: childText(el, "authors") || childText(el, "author"),
      publisher: childText(el, "publisher"),
      publication_year: childText(el, "publication_year") || childText(el, "pubYear")
    };
  });
}

async function fetchAllLibrariesByBook(isbn13, regionCode, dtlCode) {
  const authKey = getAuthKey();
  const all = [];
  const seen = new Set();

  let pageNo = 1;
  while (true) {
    const url = buildUrl("/libSrchByBook", {
      authKey,
      isbn: isbn13,
      region: regionCode,
      dtl_region: dtlCode,
      pageNo,
      pageSize: LIBCFG.PAGE_SIZE
    });

    const xmlText = await fetchText(url);
    const parsed = parseXml(xmlText);
    const libs = extractLibs(parsed);

    if (!libs.length) break;

    for (const lib of libs) {
      const key = lib.libCode || `${lib.libName}|${lib.address}`;
      if (seen.has(key)) continue;
      seen.add(key);
      all.push(lib);
    }

    if (libs.length < LIBCFG.PAGE_SIZE) break;
    pageNo += 1;
    if (pageNo > LIBCFG.MAX_LIB_SEARCH_PAGES) break;
  }

  return all;
}

function extractLibs(xmlObj) {
  const libEls = findAllElements(xmlObj, "lib");
  if (!libEls.length) return [];

  return libEls.map((el) => ({
    libName: childText(el, "libName"),
    address: childText(el, "address"),
    tel: childText(el, "tel"),
    homepage: childText(el, "homepage"),
    libCode: childText(el, "libCode")
  }));
}

async function enrichLibrariesWithAvailability(libs, isbn13) {
  if (!libs || !libs.length) return [];

  const authKey = getAuthKey();
  const enriched = libs.map((l) => ({ ...l, hasBook: "", loanAvailable: "" }));
  const pending = [];

  for (let i = 0; i < libs.length; i += 1) {
    const libCode = String(libs[i].libCode || "").trim();
    if (!libCode || !isbn13) continue;

    const cacheKey = bookExistCacheKey(libCode, isbn13);
    const cached = bookExistCacheGet(cacheKey);
    if (cached) {
      enriched[i].hasBook = normalizeYn(cached.hasBook);
      enriched[i].loanAvailable = normalizeYn(cached.loanAvailable);
      continue;
    }

    const url = buildUrl("/bookExist", {
      authKey,
      libCode,
      isbn13
    });

    pending.push({ index: i, cacheKey, url });
  }

  const batchSize = Math.max(1, Number(LIBCFG.BOOK_EXIST_BATCH_SIZE || 20));
  for (let start = 0; start < pending.length; start += batchSize) {
    const chunk = pending.slice(start, start + batchSize);
    const responses = await Promise.all(
      chunk.map(async (item) => {
        try {
          const xmlText = await fetchText(item.url);
          const info = parseBookExistFromXmlText(xmlText);
          return { item, info };
        } catch (error) {
          return { item, info: { hasBook: "", loanAvailable: "" } };
        }
      })
    );

    for (const row of responses) {
      const idx = row.item.index;
      const info = row.info || { hasBook: "", loanAvailable: "" };
      enriched[idx].hasBook = normalizeYn(info.hasBook);
      enriched[idx].loanAvailable = normalizeYn(info.loanAvailable);
      bookExistCacheSet(row.item.cacheKey, info);
    }
  }

  return enriched.filter((l) => l.hasBook === "Y");
}

function parseBookExistFromXmlText(xmlText) {
  const parsed = parseXml(xmlText);

  const resultEls = findAllElements(parsed, "result");
  const result = resultEls.length > 0 ? resultEls[0] : parsed;

  let hasBook = childText(result, "hasBook");
  let loanAvailable = childText(result, "loanAvailable");

  if (!hasBook) {
    const els = findAllElements(parsed, "hasBook");
    hasBook = els.length ? scalarText(els[0]) : "";
  }
  if (!loanAvailable) {
    const els = findAllElements(parsed, "loanAvailable");
    loanAvailable = els.length ? scalarText(els[0]) : "";
  }

  return { hasBook, loanAvailable };
}

function normalizeYn(value) {
  const v = String(value || "").trim().toUpperCase();
  if (v === "Y") return "Y";
  if (v === "N") return "N";
  return "";
}

async function searchNlkBooks(keyword, pageSize) {
  const key = getNlkKey();
  const url = buildUrlByBase(LIBCFG.NLK_SEARCH_API, {
    key,
    apiType: "json",
    srchTarget: "total",
    kwd: keyword,
    category: "도서",
    pageNum: 1,
    pageSize: pageSize || 30
  });

  const raw = await fetchText(url);
  const cleanRaw = String(raw || "").replace(/^\uFEFF/, "");

  let parsed;
  try {
    parsed = JSON.parse(cleanRaw);
  } catch (error) {
    throw new Error("국립중앙도서관 API 응답(JSON) 파싱 실패");
  }

  const rawRows = parsed && (
    parsed.result ||
    parsed.RESULT ||
    parsed.results ||
    parsed.items ||
    (parsed.response && (parsed.response.result || parsed.response.items)) ||
    (parsed.data && (parsed.data.result || parsed.data.items))
  );

  const resultRows = toArray(rawRows && (rawRows.item || rawRows.items || rawRows));
  if (!resultRows.length) {
    const errCode = pickFirstNonEmpty(parsed, ["errorCode", "error_code", "code"]);
    const errMsg = pickFirstNonEmpty(parsed, ["errorMsg", "error_msg", "message", "msg"]);
    if (errCode && String(errCode) !== "000") {
      throw new Error(`국립중앙도서관 API 오류(${errCode}): ${errMsg || "요청 실패"}`);
    }
    return [];
  }

  return resultRows
    .map(mapNlkBookRow)
    .filter((b) => b.bookname || b.isbn13);
}

function mapNlkBookRow(row) {
  const r = row || {};
  const isbnRaw = stripMarkupText(pickFirstNonEmpty(r, ["isbn", "ISBN", "isbnInfo", "isbn_info"]));

  return {
    isbn13: extractIsbn13FromText(isbnRaw),
    isbn: isbnRaw || "",
    bookname: stripMarkupText(pickFirstNonEmpty(r, ["titleInfo", "title_info", "bookname", "title"])) || "",
    authors: stripMarkupText(pickFirstNonEmpty(r, ["authorInfo", "author_info", "authors", "author"])) || "",
    publisher: stripMarkupText(pickFirstNonEmpty(r, ["pubInfo", "pub_info", "publisher"])) || "",
    publication_year: stripMarkupText(pickFirstNonEmpty(r, ["pubYearInfo", "pub_year_info", "publication_year", "pubYear"])) || ""
  };
}

function bookExistCacheKey(libCode, isbn13) {
  return `bookExist:${String(isbn13 || "").trim()}:${String(libCode || "").trim()}`;
}

function bookExistCacheGet(key) {
  if (!key) return null;
  const row = bookExistCache.get(key);
  if (!row) return null;
  if (row.expireAt <= Date.now()) {
    bookExistCache.delete(key);
    return null;
  }
  return row.info || null;
}

function bookExistCacheSet(key, info) {
  if (!key || !info) return;
  bookExistCache.set(key, {
    expireAt: Date.now() + Number(LIBCFG.BOOK_EXIST_CACHE_TTL_SEC || 21600) * 1000,
    info: {
      hasBook: String(info.hasBook || ""),
      loanAvailable: String(info.loanAvailable || "")
    }
  });
}

function buildUrl(path, params) {
  return buildUrlByBase(`${LIBCFG.API_BASE}${path}`, params);
}

function buildUrlByBase(baseUrl, params) {
  const qs = Object.keys(params || {})
    .filter((k) => params[k] !== undefined && params[k] !== null && String(params[k]).trim() !== "")
    .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(String(params[k]))}`)
    .join("&");

  return `${baseUrl}?${qs}`;
}

async function fetchText(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), LIBCFG.REQUEST_TIMEOUT_MS);

  let response;
  try {
    response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal
    });
  } finally {
    clearTimeout(timer);
  }

  const body = await response.text();
  if (!response.ok) {
    throw new Error(`API 호출 실패 (HTTP ${response.status}). URL=${url}\n응답(일부): ${body.slice(0, 300)}`);
  }
  trackData4LibraryCall(url);
  return body;
}

function parseXml(xmlText) {
  try {
    return xmlParser.parse(xmlText);
  } catch (error) {
    throw new Error(`XML 파싱 실패. 응답(일부): ${String(xmlText || "").slice(0, 300)}`);
  }
}

function findAllElements(value, keyName, out) {
  const acc = out || [];
  if (value == null) return acc;

  if (Array.isArray(value)) {
    for (const item of value) findAllElements(item, keyName, acc);
    return acc;
  }

  if (typeof value !== "object") return acc;

  for (const [k, v] of Object.entries(value)) {
    if (k === keyName) {
      if (Array.isArray(v)) acc.push(...v);
      else acc.push(v);
    }
    findAllElements(v, keyName, acc);
  }

  return acc;
}

function childText(node, childName) {
  if (!node || typeof node !== "object") return "";
  return scalarText(node[childName]);
}

function scalarText(value) {
  if (value === undefined || value === null) return "";
  if (Array.isArray(value)) return scalarText(value[0]);
  if (typeof value === "object") {
    if (value["#text"] !== undefined && value["#text"] !== null) {
      return String(value["#text"]).trim();
    }
    return "";
  }
  return String(value).trim();
}

function isbn13FromAny(isbn) {
  const digits = String(isbn || "").replace(/[^0-9Xx]/g, "").toUpperCase();
  if (/^\d{13}$/.test(digits)) return digits;
  if (!/^\d{9}[\dX]$/.test(digits)) return "";

  const body12 = `978${digits.slice(0, 9)}`;
  let sum = 0;
  for (let i = 0; i < body12.length; i += 1) {
    const n = Number(body12.charAt(i));
    sum += i % 2 === 0 ? n : n * 3;
  }
  const check = (10 - (sum % 10)) % 10;
  return `${body12}${String(check)}`;
}

function extractIsbn13FromText(value) {
  const src = stripMarkupText(value);
  if (!src) return "";

  const tokens13 = extractIsbnTokens(src, 13);
  const picked13 = pickPreferredIsbnToken(src, tokens13);
  if (picked13) return picked13;

  const tokens10 = extractIsbnTokens(src, 10);
  const picked10 = pickPreferredIsbnToken(src, tokens10);
  if (picked10) {
    const converted = isbn13FromAny(picked10);
    if (converted) return converted;
  }

  const fallback = src
    .replace(/[^0-9Xx]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((x) => x.toUpperCase());

  for (const token of fallback) {
    if (/^\d{13}$/.test(token)) return token;
  }

  for (const token of fallback) {
    if (/^\d{9}[\dX]$/.test(token)) {
      const converted = isbn13FromAny(token);
      if (converted) return converted;
    }
  }

  return isbn13FromAny(src);
}

function extractIsbnTokens(text, len) {
  const src = String(text || "");
  if (!src) return [];

  const re = len === 13 ? /\d{13}/g : /\d{9}[\dXx]/g;
  const out = [];
  let m;
  while ((m = re.exec(src)) !== null) {
    const value = String(m[0] || "").toUpperCase();
    const start = m.index;
    const end = start + value.length;
    const prev = start > 0 ? src.charAt(start - 1) : "";
    const next = end < src.length ? src.charAt(end) : "";
    if (/[0-9Xx]/.test(prev) || /[0-9Xx]/.test(next)) continue;
    out.push({ value, start, end });
  }
  return out;
}

function pickPreferredIsbnToken(text, tokens) {
  if (!tokens || !tokens.length) return "";
  const nonSet = tokens.filter((t) => !isSetIsbnContext(text, t.start, t.end));
  const picked = nonSet.length > 0 ? nonSet[nonSet.length - 1] : tokens[tokens.length - 1];
  return picked && picked.value ? picked.value : "";
}

function isSetIsbnContext(text, start, end) {
  const src = String(text || "");
  const left = Math.max(0, start - 16);
  const right = Math.min(src.length, end + 16);
  const context = src.slice(left, right);
  return /세트|set/i.test(context);
}

function stripMarkupText(value) {
  let text = String(value == null ? "" : value);
  if (!text) return "";

  text = text
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&nbsp;/gi, " ");

  text = text.replace(/<[^>]*>/g, " ");

  text = text
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, "\"")
    .replace(/&#39;/gi, "'");

  return text.replace(/\s+/g, " ").trim();
}

function pickFirstNonEmpty(obj, keys) {
  if (!obj || !keys || !keys.length) return "";
  for (const key of keys) {
    const v = obj[key];
    if (v !== undefined && v !== null && String(v).trim() !== "") {
      return String(v).trim();
    }
  }
  return "";
}

function toArray(value) {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  if (typeof value === "object") return [value];
  return [];
}

function sendError(res, error) {
  const message = error && error.message ? error.message : String(error);
  res.status(500).json({ error: message });
}

function sendJson(res, payload) {
  res.json(withUsage(payload));
}

function withUsage(payload) {
  const base = payload && typeof payload === "object" && !Array.isArray(payload) ? payload : { value: payload };
  return Object.assign({}, base, {
    usage: {
      delta: getCurrentUsageDelta(),
      limit: DATA4LIBRARY_DAILY_LIMIT,
      dateKey: getUsageDateKey()
    }
  });
}

function getCurrentUsageDelta() {
  const store = usageStore.getStore();
  return store && Number.isFinite(store.data4libraryCalls) ? store.data4libraryCalls : 0;
}

function trackData4LibraryCall(url) {
  if (!String(url || "").startsWith(LIBCFG.API_BASE)) return;
  const store = usageStore.getStore();
  if (!store) return;
  store.data4libraryCalls += 1;
}

function getUsageDateKey() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());
}

module.exports = app;
