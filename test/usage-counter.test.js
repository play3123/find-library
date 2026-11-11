"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { createUsageCounter, usageDay } = require("../render-api/src/usage-counter");

function memoryRedis() {
  const hashes = new Map(), events = new Set();
  let loseFirstResponse = false;
  return { loseNextResponse() { loseFirstResponse = true; }, async fetch(url, options) {
    const [command, ...args] = JSON.parse(options.body);
    let values;
    if (command === "HMGET") values = hashes.get(args[0]) || [null, null];
    else {
      const [, numKeys, key, event, expiry, now] = args;
      assert.equal(numKeys, 2); assert.ok(expiry > 0);
      if (!events.has(event)) {
        events.add(event); const old = hashes.get(key) || [0, now]; hashes.set(key, [Number(old[0]) + 1, old[1]]);
      }
      values = hashes.get(key);
      if (loseFirstResponse) { loseFirstResponse = false; throw new Error("Lost response after commit"); }
    }
    return { ok: true, json: async () => ({ result: values }) };
  } };
}
function counter(store, extra = {}) { return createUsageCounter({ url: "https://redis.test", token: "test", fetch: store.fetch, now: () => new Date("2026-11-11T03:00:00Z"), ...extra }); }

test("different server instances share 100 concurrent increments and survive re-creation", async () => {
  const store = memoryRedis(), a = counter(store), b = counter(store);
  await Promise.all(Array.from({ length: 100 }, (_, i) => (i % 2 ? a : b).increment(`event-${i}`)));
  assert.equal((await counter(store).read()).total, 100);
});
test("retries after an ambiguous response count the same event exactly once", async () => {
  const store = memoryRedis(), a = counter(store); store.loseNextResponse();
  assert.equal((await a.increment("one-call")).total, 1);
  assert.equal((await a.increment("one-call")).total, 1);
});
test("Korean midnight creates a fresh date without deleting yesterday", async () => {
  const store = memoryRedis(); let now = new Date("2026-11-11T14:59:59.999Z");
  const a = counter(store, { now: () => now }); await a.increment("before");
  now = new Date("2026-11-11T15:00:00Z");
  assert.equal((await a.read()).dateKey, "2026-11-12"); assert.equal((await a.read()).total, 0);
  assert.equal((await a.increment("after")).total, 1);
  assert.equal(usageDay("2026-11-11T14:59:59.999Z").resetAt, "2026-11-11T15:00:00.000Z");
});
test("preview and production counters stay isolated", async () => {
  const store = memoryRedis(); await counter(store).increment("production");
  const preview = counter(store, { env: { VERCEL_ENV: "preview", VERCEL_GIT_COMMIT_REF: "feature" } });
  assert.equal((await preview.read()).total, 0);
});
test("missing or failing storage never invents zero or falls back to memory", async () => {
  const a = createUsageCounter({ env: {} }); await assert.rejects(a.increment(), { code: "USAGE_UNAVAILABLE" });
  assert.equal(a.unavailable().total, null);
  await assert.rejects(counter({ fetch: async () => { throw new Error("offline"); } }).read(), { code: "USAGE_UNAVAILABLE" });
});
module.exports = { memoryRedis };
