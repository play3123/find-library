"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { once } = require("node:events");
const originalFetch = globalThis.fetch;
process.env.KV_REST_API_URL = "https://redis.test";
process.env.KV_REST_API_TOKEN = "test-token";
process.env.DATA4LIBRARY_AUTHKEY = "NEVER-EXPOSE-THIS-KEY";
process.env.NLK_KEY = "test-nlk";
const counts = new Map(), events = new Set();
let upstreamFails = false;
let candidateRequest;
globalThis.fetch = async (url, options) => {
  if (String(url).includes("nl.go.kr")) {
    candidateRequest = new URL(url);
    return { ok: true, text: async () => JSON.stringify({ result: Array.from({ length: 30 }, (_, i) => ({ titleInfo: `검색 후보 ${i + 1}`, isbn: "9788936433598" })) }) };
  }
  if (url === "https://redis.test") {
    const [cmd, ...a] = JSON.parse(options.body); let result;
    if (cmd === "HMGET") result = counts.get(a[0]) || [null, null];
    else { const key = a[2], event = a[3]; if (!events.has(event)) { events.add(event); const previous = counts.get(key) || [0, a[5]]; counts.set(key, [previous[0] + 1, previous[1]]); } result = counts.get(key); }
    return { ok: true, json: async () => ({ result }) };
  }
  if (String(url).includes("data4library")) {
    if (upstreamFails) return { ok: false, status: 500, text: async () => "private upstream message" };
    const text = String(url).includes("libSrchByBook") ? '<response><libs><lib><libName>테스트 도서관</libName><libCode>111020</libCode><address>서울 종로구</address></lib></libs></response>' : '<response><result><hasBook>Y</hasBook><loanAvailable>Y</loanAvailable></result></response>';
    return { ok: true, text: async () => text };
  }
  throw new Error("Unexpected upstream");
};
const app = require("../render-api/server");
test("API counts upstream attempts including failures and redacts credentials", async () => {
  const server = app.listen(0, "127.0.0.1"); await once(server, "listening");
  const base = `http://127.0.0.1:${server.address().port}`;
  const post = () => originalFetch(base + "/api/search", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isbn13: "9788936433598", regionCode: "11", dtlCode: "11010" }) });
  try {
    assert.equal((await originalFetch(base + "/api/health")).status, 200);
    const candidates = await (await originalFetch(base + "/api/books/candidates", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query: "한강" }) })).json();
    assert.equal(candidates.limit, 30); assert.equal(candidates.rows.length, 30);
    assert.equal(candidateRequest.searchParams.get("pageNum"), "1"); assert.equal(candidateRequest.searchParams.get("pageSize"), "30");
    const first = await (await post()).json(); assert.equal(first.count, 1, JSON.stringify(first)); assert.equal(first.usage.total, 2);
    const cached = await (await post()).json(); assert.equal(cached.usage.total, 3);
    upstreamFails = true; const failed = await post(); assert.equal(failed.status, 502);
    const text = await failed.text(); assert.ok(!text.includes("NEVER-EXPOSE")); assert.ok(!text.includes("authKey"));
    const snapshot = await (await originalFetch(base + "/api/usage")).json(); assert.equal(snapshot.usage.total, 4);
  } finally { server.close(); globalThis.fetch = originalFetch; }
});
