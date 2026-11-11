/* global kakao */
"use strict";
(() => {
  const $ = (id) => document.getElementById(id);
  const state = { books: [], regions: [], districts: [], rows: [], candidateQuery: "", busy: false,
    finding: false, districtRequest: 0, usage: null, selected: null, mapSequence: 0,
    resultBook: null, mapExpanded: false, viewBeforeExpansion: "list" };
  const base = String(window.APP_CONFIG && window.APP_CONFIG.API_BASE || "").replace(/\/$/, "");
  let map, geocoder, mapInfo, mapResizeObserver, mapLayoutFrame, fitAfterLayout = false, revealAfterLayout = false, infoOpen = false,
    overlays = [], points = new Map(), addressCache = new Map(), midnightTimer;
  const fmt = new Intl.NumberFormat("ko-KR");
  function node(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text != null) el.textContent = text;
    return el;
  }
  function message(text = "") { $("formMessage").textContent = text; $("formMessage").hidden = !text; }
  function safeUrl(value) {
    const raw = String(value || "").trim();
    if (!raw) return "";
    try { const url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
      return ["https:", "http:"].includes(url.protocol) ? url.href : ""; } catch { return ""; }
  }
  function link(text, href) {
    const el = node("a", "", text); el.href = href; el.target = "_blank"; el.rel = "noopener noreferrer"; return el;
  }
  function showUsage(usage) {
    if (!usage || !usage.available || !Number.isSafeInteger(usage.total)) {
      $("usageDisplay").textContent = "집계 확인 불가";
      $("usageUpdated").textContent = "집계 연결을 확인하지 못했습니다. 새로고침 버튼으로 다시 확인해 주세요.";
      return;
    }
    if (state.usage && usage.dateKey < state.usage.dateKey) return;
    if (state.usage && usage.dateKey === state.usage.dateKey) usage = { ...usage, total: Math.max(usage.total, state.usage.total) };
    state.usage = usage;
    $("usageDisplay").textContent = `${fmt.format(usage.total)} / ${fmt.format(usage.limit)}`;
    $("usageUpdated").textContent = `${usage.dateKey} · 한국시간 ${new Date().toLocaleTimeString("ko-KR", { timeZone: "Asia/Seoul", hour: "2-digit", minute: "2-digit" })} 확인`;
    clearTimeout(midnightTimer);
    const delay = Date.parse(usage.resetAt) - Date.now() + 100;
    if (delay > 0 && delay < 86401000) midnightTimer = setTimeout(() => {
      state.usage = null; $("usageDisplay").textContent = "확인 중"; refreshUsage();
    }, delay);
  }
  async function request(path, body) {
    const options = { method: body ? "POST" : "GET", cache: "no-store", signal: AbortSignal.timeout(90000) };
    if (body) { options.body = JSON.stringify(body); options.headers = { "Content-Type": "application/json" }; }
    let res;
    try { res = await fetch(base + path, options); }
    catch { throw new Error("서버에 연결하지 못했습니다. 인터넷 연결을 확인하고 다시 시도해 주세요."); }
    let data;
    try { data = await res.json(); } catch { throw new Error("서버 응답을 읽지 못했습니다. 잠시 후 다시 시도해 주세요."); }
    if (data.usage) showUsage(data.usage);
    if (!res.ok) throw new Error(data.error || "요청을 처리하지 못했습니다. 다시 시도해 주세요.");
    return data;
  }
  async function refreshUsage() {
    $("refreshUsage").disabled = true;
    try { await request("/api/usage"); }
    catch { showUsage(null); }
    finally { $("refreshUsage").disabled = false; }
  }
  function options(select, rows, placeholder, label) {
    select.replaceChildren(new Option(placeholder, ""));
    rows.forEach((row, i) => select.add(new Option(label(row), String(i))));
  }
  const chosen = (rows, id) => $(id).value === "" ? null : rows[Number($(id).value)] || null;
  const mode = () => document.querySelector('input[name="searchMode"]:checked').value;
  function updateBook() {
    const book = chosen(state.books, "bookSelect");
    $("selectedBook").replaceChildren(); $("selectedBook").hidden = !book || mode() === "isbn";
    if (book) $("selectedBook").append(node("strong", "", book.bookname), node("small", "", `${[book.authors, book.publisher, book.publication_year].filter(Boolean).join(" · ")} · ISBN ${book.isbn13 || "정보 없음"}`));
  }
  function initBookTools() {
    ["resultBookTools", "mapBookTools"].forEach((id) => {
      const host = $(id), actions = node("div", "copy-actions");
      if (id === "mapBookTools") host.append(node("p", "copy-book-title"));
      [["bookname", "책 제목 복사"], ["isbn13", "ISBN 복사"]].forEach(([kind, label]) => {
        const button = node("button", "tool-button", label); button.type = "button"; button.dataset.copy = kind;
        button.onclick = () => copyBook(kind, host, button); actions.append(button);
      });
      const status = node("p", "copy-status"); status.setAttribute("role", "status"); status.setAttribute("aria-live", "polite");
      const fallback = node("div", "copy-fallback"); fallback.hidden = true;
      host.append(actions, status, fallback);
    });
  }
  function updateBookTools() {
    ["resultBookTools", "mapBookTools"].forEach((id) => {
      const host = $(id), book = state.resultBook; host.hidden = !book;
      if (!book) return;
      const title = host.querySelector(".copy-book-title");
      if (title) { title.textContent = book.bookname || `ISBN ${book.isbn13}`; title.title = title.textContent; }
      host.querySelectorAll("[data-copy]").forEach((button) => {
        button.disabled = !book[button.dataset.copy];
        button.title = button.disabled ? (book.titlePending ? "책 제목을 확인하고 있습니다." : "책 제목 정보가 없습니다.") : "";
      });
      host.querySelector(".copy-status").textContent = book.titlePending ? "책 제목을 확인하고 있습니다." : (!book.bookname ? "제목 정보가 없어 ISBN만 복사할 수 있습니다." : "");
      host.querySelector(".copy-fallback").hidden = true;
    });
  }
  async function completeBookTitle(book) {
    try {
      const data = await request("/api/books/candidates", { query: book.isbn13 });
      if (state.resultBook !== book) return;
      const match = (data.rows || []).find((row) => row.isbn13 === book.isbn13);
      if (match) book.bookname = match.bookname || "";
    } catch { /* ISBN copying remains available when bibliographic lookup fails. */ }
    finally { if (state.resultBook === book) { book.titlePending = false; updateBookTools(); } }
  }
  async function copyBook(kind, host, button) {
    const value = state.resultBook && state.resultBook[kind]; if (!value) return;
    const status = host.querySelector(".copy-status"), fallback = host.querySelector(".copy-fallback");
    button.disabled = true; fallback.hidden = true;
    try {
      await navigator.clipboard.writeText(value);
      status.textContent = kind === "bookname" ? "책 제목을 복사했습니다." : "ISBN을 복사했습니다.";
    } catch {
      status.textContent = "자동 복사를 완료하지 못했습니다. 선택된 텍스트를 직접 복사해 주세요.";
      const field = node("textarea", "manual-copy"); field.value = value; field.readOnly = true; field.rows = 2;
      field.setAttribute("aria-label", kind === "bookname" ? "직접 복사할 책 제목" : "직접 복사할 ISBN");
      fallback.replaceChildren(field); fallback.hidden = false; field.focus(); field.select();
    } finally { button.disabled = !state.resultBook || !state.resultBook[kind]; }
  }
  function readiness() {
    const region = chosen(state.regions, "region"), district = chosen(state.districts, "dtl");
    let reason = "";
    if (mode() === "keyword") {
      const book = chosen(state.books, "bookSelect");
      if (!book) reason = "도서 후보를 조회하고 한 권을 선택해 주세요.";
      else if (!book.isbn13) reason = "이 책의 ISBN 정보가 없습니다. ISBN으로 검색하거나 다른 책을 선택해 주세요.";
    } else if (!/^(?:\d{13}|\d{9}[\dXx])$/.test($("isbnInput").value.replace(/[\s-]/g, ""))) reason = "10자리 또는 13자리 ISBN을 입력해 주세요.";
    if (!reason && !region) reason = "시·도를 선택해 주세요.";
    if (!reason && region.code !== "11" && !district) reason = "시·군·구를 선택해 주세요.";
    $("searchBtn").disabled = !!reason || state.busy || state.finding;
    $("searchHint").textContent = state.busy ? "검색 중입니다. 잠시만 기다려 주세요." : reason;
    $("findBtn").disabled = state.finding || state.busy || !$("keywordInput").value.trim();
    return !reason;
  }
  function switchMode() {
    const isbn = mode() === "isbn";
    $("searchForm").dataset.mode = isbn ? "isbn" : "keyword";
    $("keywordFlow").hidden = isbn; $("isbnFlow").hidden = !isbn;
    $("keywordInput").disabled = isbn; $("isbnInput").disabled = !isbn;
    updateBook(); message(); readiness();
  }
  async function candidates() {
    if (state.finding || state.busy) return;
    const query = $("keywordInput").value.trim(); if (!query) return;
    state.finding = true; state.books = []; state.candidateQuery = ""; updateBook(); message(); readiness();
    $("findBtn").textContent = "조회 중"; $("bookSelect").disabled = true;
    options($("bookSelect"), [], "후보 도서를 찾고 있습니다", (b) => b.bookname);
    try {
      const data = await request("/api/books/candidates", { query });
      if (query !== $("keywordInput").value.trim() || mode() !== "keyword") return;
      state.books = data.rows || []; state.candidateQuery = query;
      options($("bookSelect"), state.books, state.books.length ? "빌릴 책을 선택하세요" : "조회된 후보가 없습니다", (b) => `${b.bookname} · ${b.publication_year || "발행연도 없음"} · ${b.isbn13 || "ISBN 없음"}`);
      $("bookSelect").disabled = !state.books.length;
      const limit = Number.isSafeInteger(data.limit) ? data.limit : 30;
      $("candidateHint").textContent = state.books.length ? `${state.books.length}개 후보 · 최대 ${limit}개 조회` : "다른 도서명이나 저자로 다시 조회해 주세요.";
    } catch (error) { message(error.message); options($("bookSelect"), [], "다시 조회해 주세요", () => ""); }
    finally { state.finding = false; $("findBtn").textContent = "후보 조회"; readiness(); }
  }
  async function changeRegion() {
    const ticket = ++state.districtRequest, region = chosen(state.regions, "region");
    state.districts = []; $("dtl").disabled = true;
    options($("dtl"), [], region ? "불러오는 중" : "시·도 먼저 선택", (r) => r.name); readiness();
    if (!region) return;
    try {
      const data = await request("/api/dtls?regionName=" + encodeURIComponent(region.name));
      if (ticket !== state.districtRequest) return;
      state.districts = data.rows || [];
      options($("dtl"), state.districts, region.code === "11" ? "서울 전체" : "시·군·구 선택", (r) => r.name);
      $("dtl").disabled = !state.districts.length;
      $("regionHint").textContent = region.code === "11" ? "서울 전체 또는 원하는 구를 선택하세요." : "해당 지역의 시·군·구를 선택하세요.";
    } catch (error) { if (ticket === state.districtRequest) { message(error.message); options($("dtl"), [], "지역을 다시 선택하세요", () => ""); } }
    finally { readiness(); }
  }
  function busy(value) {
    state.busy = value; $("results").setAttribute("aria-busy", String(value));
    $("searchBtn").querySelector("span").textContent = value ? "도서관 확인 중" : "도서관 찾기";
    document.querySelectorAll('#searchForm input, #searchForm select').forEach((el) => { el.disabled = value; });
    if (!value) { switchMode(); $("bookSelect").disabled = !state.books.length; $("dtl").disabled = !state.districts.length; }
    $("loadingState").hidden = !value; readiness();
  }
  async function search(event) {
    event.preventDefault(); if (state.busy || !readiness()) return;
    const region = chosen(state.regions, "region"), district = chosen(state.districts, "dtl");
    const target = mode() === "keyword" ? { ...chosen(state.books, "bookSelect") } : { isbn13: $("isbnInput").value.trim(), bookname: "" };
    state.rows = []; $("availableOnly").checked = false; state.selected = null; state.resultBook = null; updateBookTools(); message();
    setMapExpanded(false, { scroll: false });
    setView("list");
    $("libraryList").replaceChildren(); $("emptyState").hidden = true; $("resultMessage").hidden = true;
    $("resultToolbar").hidden = true; $("availableFilter").hidden = true; $("resultControls").hidden = true; $("resultCount").hidden = true; clearMap(); busy(true);
    $("resultsHeading").textContent = "소장 도서관을 확인하고 있어요";
    $("resultsSummary").textContent = `${region.name} ${district ? district.name : "전체"} · 소장 정보와 대출 상태를 조회하고 있습니다.`;
    try {
      if (mode() === "isbn") {
        const resolved = await request("/api/books/resolve-isbn", { queryOrIsbn: target.isbn13 });
        if (!resolved.isbn13) throw new Error("ISBN을 찾지 못했습니다. 번호를 확인하거나 도서명으로 조회해 주세요.");
        Object.assign(target, resolved);
      }
      const data = await request("/api/search", { isbn13: target.isbn13, query: target.bookname,
        regionCode: region.code, regionName: region.name, dtlCode: district ? district.code : "", dtlName: district ? district.name : "" });
      state.rows = (data.rows || []).map((r, i) => ({ ...r, number: i + 1 }));
      state.resultBook = { bookname: target.bookname || "", isbn13: target.isbn13, titlePending: !target.bookname };
      updateBookTools(); if (state.resultBook.titlePending) completeBookTitle(state.resultBook);
      $("resultsHeading").textContent = "찾은 도서관";
      $("resultsSummary").textContent = `${region.name} ${district ? district.name : "전체"} · ${target.bookname || `ISBN ${target.isbn13}`}`;
      $("mapRegion").textContent = `${region.name} ${district ? district.name : "전체"}`;
      $("resultToolbar").hidden = false; $("availableFilter").hidden = false; $("resultControls").hidden = false; renderResults();
      if (window.matchMedia("(max-width:720px)").matches) { $("results").scrollIntoView({ block: "start", behavior: "instant" }); $("results").focus({ preventScroll: true }); }
    } catch (error) {
      $("resultsHeading").textContent = "검색을 완료하지 못했어요";
      $("resultsSummary").textContent = "입력한 조건은 유지됩니다. 잠시 후 다시 검색해 주세요.";
      $("resultMessage").textContent = error.message; $("resultMessage").hidden = false;
      $("mapStatus").textContent = "검색을 완료한 후 위치를 표시합니다.";
    } finally { busy(false); refreshUsage(); }
  }
  function availability(row) { return row.loanAvailable === "Y" ? ["대출가능", ""] : row.loanAvailable === "N" ? ["대출중", "unavailable"] : ["상태 미확인", "unknown"]; }
  function visibleRows() { return state.rows.filter((r) => !$("availableOnly").checked || r.loanAvailable === "Y"); }
  function renderResults() {
    const rows = visibleRows(); $("libraryList").replaceChildren(); $("resultCount").hidden = false;
    $("resultCount").textContent = `${rows.length}곳`;
    $("resultMessage").hidden = !!rows.length;
    $("resultMessage").textContent = state.rows.length ? "대출가능으로 확인된 도서관이 없습니다. 필터를 해제해 전체 결과를 확인하세요." : "이 지역에서 소장 도서관을 찾지 못했습니다. 다른 지역이나 책으로 검색해 주세요.";
    rows.forEach((row) => {
      const li = node("li", "library-item"); li.dataset.number = row.number;
      const title = node("div", "library-title"), button = node("button", "location-button", row.number);
      button.type = "button"; button.setAttribute("aria-label", `${row.number}번 ${row.libName} 지도에서 보기`);
      button.onclick = () => selectLibrary(row.number, true);
      const head = node("div", ""); const [label, status] = availability(row);
      head.append(node("h3", "", row.libName || "도서관명 없음"), node("span", `status-badge ${status}`, label)); title.append(button, head);
      const detail = node("div", "library-details"); detail.append(node("p", "", row.address || "주소 정보 없음"));
      const links = node("div", "library-links"), homepage = safeUrl(row.homepage);
      if (homepage) links.append(link("홈페이지", homepage));
      if (row.tel) { const phone = node("a", "", row.tel); phone.href = `tel:${String(row.tel).replace(/[^\d+]/g, "")}`; links.append(phone); }
      detail.append(links, node("p", "library-code", `도서관 코드 ${row.libCode || "미확인"}`)); li.append(title, detail); $("libraryList").append(li);
    });
    renderMap(rows);
  }
  function updateViewControls(view) {
    $("resultLayout").dataset.view = view;
    ["list", "map"].forEach((name) => { $(name + "View").classList.toggle("active", view === name); $(name + "View").setAttribute("aria-pressed", String(view === name)); });
  }
  function setView(view) {
    if (view === "list") setMapExpanded(false, { scroll: false, restoreView: false });
    updateViewControls(view);
    if (mapInfo) mapInfo.close(); infoOpen = false;
    if (view === "map") layoutMap(!state.selected, true);
  }
  function updateMapSizeButton() { $("toggleMapSize").disabled = !state.mapExpanded && !points.size; }
  function setMapExpanded(value, { scroll = true, restoreView = true } = {}) {
    const expanded = !!value; if (state.mapExpanded === expanded) return;
    if (expanded) state.viewBeforeExpansion = $("resultLayout").dataset.view;
    state.mapExpanded = expanded; $("resultLayout").dataset.mapExpanded = String(expanded);
    $("toggleMapSize").setAttribute("aria-expanded", String(expanded));
    $("toggleMapSize").textContent = expanded ? "원래 크기로" : "지도 크게 보기";
    if (expanded) updateViewControls("map");
    else if (restoreView) updateViewControls(window.matchMedia("(max-width:720px)").matches ? "map" : state.viewBeforeExpansion);
    updateMapSizeButton(); layoutMap();
    if (scroll) {
      $("toggleMapSize").focus({ preventScroll: true });
      requestAnimationFrame(() => document.querySelector(".map-pane").scrollIntoView({ block: "start", behavior: "instant" }));
    }
  }
  function selectLibrary(number, openMap, focusInfo = false) {
    state.selected = number;
    if (openMap) setView("map");
    document.querySelectorAll(".library-item,.map-pin").forEach((el) => el.classList.toggle("selected", Number(el.dataset.number) === number));
    const row = state.rows.find((r) => r.number === number), point = points.get(number);
    if (!row) return;
    if (point && map) {
      fitAfterLayout = false;
      map.relayout(); if (!map.getBounds().contain(point)) map.setCenter(point);
      showMapInfo(row, point, focusInfo);
    }
    else $("mapStatus").textContent = "이 도서관의 좌표를 아직 확인하지 못했습니다. 주소와 홈페이지를 참고해 주세요.";
    const box = $("mapSelection"); box.hidden = false; box.replaceChildren();
    const url = safeUrl(row.homepage); box.append(url ? link(`${number}. ${row.libName}`, url) : node("strong", "", `${number}. ${row.libName}`), node("p", "", row.address));
    box.tabIndex = -1;
    box.setAttribute("role", "region");
    box.setAttribute("aria-label", `선택한 도서관: ${row.libName}`);
    if (openMap && window.matchMedia("(max-width:720px)").matches) {
      box.focus({ preventScroll: true });
      box.scrollIntoView({ block: "nearest", behavior: "instant" });
    }
  }
  function showMapInfo(row, point, focusInfo) {
    if (!mapInfo) return;
    const content = node("div", "map-info"), header = node("div", "map-info-header");
    content.setAttribute("role", "region"); content.setAttribute("aria-label", `${row.libName} 도서관 정보`);
    const url = safeUrl(row.homepage), name = url ? link(row.libName, url) : node("strong", "", row.libName);
    name.className = "map-info-name";
    if (url) name.setAttribute("aria-label", `${row.libName} 홈페이지 새 창에서 열기`);
    const close = node("button", "map-info-close"); close.type = "button"; close.setAttribute("aria-label", "도서관 정보 닫기");
    close.innerHTML = '<svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m5 5 10 10M15 5 5 15" stroke="currentColor" stroke-width="1.5"/></svg>';
    const dismiss = () => { mapInfo.close(); infoOpen = false; document.querySelector(`.map-pin[data-number="${row.number}"]`)?.focus({ preventScroll: true }); };
    close.onclick = dismiss;
    content.onkeydown = (event) => { if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); dismiss(); } };
    const [label, status] = availability(row);
    header.append(name, close); content.append(header, node("span", `status-badge ${status}`, label), node("p", "", row.address || "주소 정보 없음"));
    if (!url) content.append(node("p", "", "등록된 홈페이지가 없습니다."));
    mapInfo.close(); mapInfo.setPosition(point); mapInfo.setContent(content); infoOpen = true; mapInfo.open(map);
    if (focusInfo) (url ? name : close).focus({ preventScroll: true });
  }
  function layoutMap(fit = false, reveal = false) {
    fitAfterLayout = fitAfterLayout || fit;
    revealAfterLayout = revealAfterLayout || reveal;
    cancelAnimationFrame(mapLayoutFrame);
    mapLayoutFrame = requestAnimationFrame(() => {
      const size = $("map").getBoundingClientRect();
      if (!map || !size.width || !size.height) return;
      const shouldFit = fitAfterLayout, shouldReveal = revealAfterLayout; fitAfterLayout = false; revealAfterLayout = false;
      const center = map.getCenter(); map.relayout(); map.setCenter(center);
      if (shouldFit) fitMap();
      else if (shouldReveal && !infoOpen && points.has(state.selected)) map.setCenter(points.get(state.selected));
      if (infoOpen) mapInfo.open(map);
    });
  }
  function clearMap() { state.mapSequence += 1; if (mapInfo) mapInfo.close(); infoOpen = false; fitAfterLayout = false; revealAfterLayout = false; cancelAnimationFrame(mapLayoutFrame); overlays.forEach((o) => o.setMap(null)); overlays = []; points.clear(); updateMapSizeButton(); $("mapSelection").hidden = true; }
  function fitMap() { if (!map || !points.size) return; const bounds = new kakao.maps.LatLngBounds(); points.forEach((p) => bounds.extend(p)); map.setBounds(bounds); }
  function coordinates(address) {
    if (addressCache.has(address)) return Promise.resolve(addressCache.get(address));
    return new Promise((resolve) => {
      if (!address || !geocoder) return resolve(null);
      const locate = (attempt = 0) => geocoder.addressSearch(address, (rows, status) => {
        if (status === kakao.maps.services.Status.ERROR && attempt === 0) { setTimeout(() => locate(1), 350); return; }
        const value = status === kakao.maps.services.Status.OK && rows.length ? new kakao.maps.LatLng(Number(rows[0].y), Number(rows[0].x)) : null;
        if (value) addressCache.set(address, value); resolve(value);
      });
      locate();
    });
  }
  async function renderMap(rows) {
    clearMap(); if (!map) return;
    const seq = state.mapSequence;
    if (!rows.length) { $("mapStatus").textContent = "검색 결과가 있으면 지도에 위치를 표시합니다."; return; }
    $("mapStatus").textContent = "도서관 주소의 위치를 확인하고 있습니다.";
    const located = new Array(rows.length); let cursor = 0;
    await Promise.all(Array.from({ length: Math.min(4, rows.length) }, async () => {
      while (cursor < rows.length && seq === state.mapSequence) {
        const index = cursor++, row = rows[index]; located[index] = { row, point: await coordinates(row.address) };
      }
    }));
    if (seq !== state.mapSequence) return;
    located.forEach(({ row, point }) => {
      if (!point) return;
      points.set(row.number, point);
      const button = node("button", `map-pin ${availability(row)[1]}`, row.number); button.type = "button"; button.dataset.number = row.number;
      button.append(node("span", "map-pin-label", row.libName));
      button.setAttribute("aria-label", `${row.number}번 ${row.libName} 이름과 홈페이지 보기`);
      button.onclick = (event) => selectLibrary(row.number, false, event.detail === 0);
      const overlay = new kakao.maps.CustomOverlay({ map, position: point, content: button, clickable: true, yAnchor: 1.2, zIndex: 10 });
      button.onmouseenter = button.onfocus = () => overlay.setZIndex(200);
      button.onmouseleave = button.onblur = () => overlay.setZIndex(10);
      overlays.push(overlay);
    });
    layoutMap(true); $("mapStatus").textContent = `${rows.length}곳 중 ${points.size}곳의 위치를 표시했습니다.${points.size < rows.length ? " 일부 주소는 좌표를 확인하지 못했습니다." : ""} 핀을 눌러 이름과 홈페이지를 확인하세요.`;
    updateMapSizeButton();
  }
  async function initMap() {
    try {
      const cfg = await request("/api/client-config");
      if (!cfg.kakaoJsKey) throw new Error("지도를 연결하지 못했습니다. 검색 결과 목록은 이용할 수 있습니다.");
      const script = document.createElement("script"); script.async = true;
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?autoload=false&libraries=services&appkey=${encodeURIComponent(cfg.kakaoJsKey)}`;
      script.onerror = () => { $("mapStatus").textContent = "지도를 불러오지 못했습니다. 결과 목록에서 주소를 확인해 주세요."; };
      script.onload = () => {
        if (!window.kakao || !kakao.maps) return script.onerror();
        kakao.maps.load(() => {
          $("map").replaceChildren();
          map = new kakao.maps.Map($("map"), { center: new kakao.maps.LatLng(37.5665, 126.978), level: 7 });
          mapInfo = new kakao.maps.InfoWindow({ zIndex: 1000, disableAutoPan: false });
          mapResizeObserver = new ResizeObserver(() => layoutMap()); mapResizeObserver.observe($("map"));
          geocoder = new kakao.maps.services.Geocoder(); $("mapStatus").textContent = "지도 핀에서 도서관 이름과 홈페이지를 확인할 수 있습니다.";
          renderMap(visibleRows());
        });
      }; document.head.append(script);
    } catch (error) { $("mapStatus").textContent = error.message; }
  }
  async function init() {
    initBookTools();
    $("searchForm").onsubmit = search; $("findBtn").onclick = candidates;
    document.querySelectorAll('[name="searchMode"]').forEach((el) => el.addEventListener("change", switchMode));
    $("keywordInput").oninput = () => { if ($("keywordInput").value.trim() !== state.candidateQuery) { state.books = []; options($("bookSelect"), [], "도서 후보를 다시 조회하세요", () => ""); $("bookSelect").disabled = true; $("candidateHint").textContent = "후보는 한 번에 최대 30개까지 조회합니다."; updateBook(); } readiness(); };
    $("keywordInput").onkeydown = (e) => { if (e.key === "Enter") { e.preventDefault(); candidates(); } };
    $("isbnInput").oninput = readiness; $("bookSelect").onchange = () => { updateBook(); readiness(); };
    $("region").onchange = changeRegion; $("dtl").onchange = readiness;
    $("availableOnly").onchange = () => { state.selected = null; renderResults(); }; $("listView").onclick = () => setView("list"); $("mapView").onclick = () => setView("map");
    $("refreshUsage").onclick = refreshUsage;
    $("toggleMapSize").onclick = () => setMapExpanded(!state.mapExpanded);
    document.addEventListener("keydown", (event) => { if (event.key === "Escape" && !event.defaultPrevented && state.mapExpanded) { event.preventDefault(); setMapExpanded(false); } });
    document.querySelector('.text-link').onclick = () => { $("help").open = true; };
    document.addEventListener("visibilitychange", () => { if (!document.hidden) refreshUsage(); });
    setInterval(() => { if (!document.hidden) refreshUsage(); }, 60000);
    switchMode(); refreshUsage(); initMap();
    try { const data = await request("/api/regions"); state.regions = data.rows || []; options($("region"), state.regions, "시·도 선택", (r) => r.name); }
    catch (error) { message(error.message); options($("region"), [], "새로고침해 주세요", () => ""); }
    readiness();
  }
  init();
})();
