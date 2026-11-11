"use strict";

const { randomUUID } = require("node:crypto");
const DAY_MS = 86400000;
const KST_MS = 9 * 3600000;
const INCREMENT_SCRIPT = `
if redis.call('SET', KEYS[2], '1', 'NX', 'EX', 172800) then
  redis.call('HSETNX', KEYS[1], 'startedAt', ARGV[2])
  redis.call('HINCRBY', KEYS[1], 'total', 1)
  redis.call('EXPIREAT', KEYS[1], ARGV[1])
end
return redis.call('HMGET', KEYS[1], 'total', 'startedAt')
`;

class UsageUnavailableError extends Error {
  constructor() {
    super("전체 사용량 집계에 연결하지 못했습니다. 잠시 후 다시 검색해 주세요.");
    this.code = "USAGE_UNAVAILABLE";
  }
}

function usageDay(now = new Date()) {
  const time = new Date(now).getTime();
  const dateKey = new Date(time + KST_MS).toISOString().slice(0, 10);
  const nextMidnight = Date.parse(`${dateKey}T00:00:00+09:00`) + DAY_MS;
  return { dateKey, resetAt: new Date(nextMidnight).toISOString(), expiresAt: Math.floor((nextMidnight + 7 * DAY_MS) / 1000) };
}

function createUsageCounter(options = {}) {
  const env = options.env || process.env;
  const url = options.url || env.UPSTASH_REDIS_REST_URL || env.KV_REST_API_URL || "";
  const token = options.token || env.UPSTASH_REDIS_REST_TOKEN || env.KV_REST_API_TOKEN || "";
  const fetchImpl = options.fetch || globalThis.fetch;
  const clock = options.now || (() => new Date());
  const configuredLimit = Number(options.limit || env.DATA4LIBRARY_DAILY_LIMIT || 500);
  const limit = Number.isInteger(configuredLimit) && configuredLimit > 0 ? configuredLimit : 500;
  const namespace = options.namespace || env.USAGE_COUNTER_NAMESPACE ||
    (env.VERCEL_ENV === "preview" ? `find-library:preview:${env.VERCEL_GIT_COMMIT_REF || "preview"}` : "find-library:production");

  async function command(args) {
    if (!url || !token) throw new UsageUnavailableError();
    // Retrying the same event ID is safe even if Redis committed before a timeout.
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        const response = await fetchImpl(url, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify(args),
          signal: AbortSignal.timeout(4000)
        });
        if (!response.ok) throw new Error("Storage unavailable");
        const result = await response.json();
        if (result.error || !Array.isArray(result.result)) throw new Error("Invalid storage response");
        return result.result;
      } catch (error) {
        if (attempt === 1) throw new UsageUnavailableError();
      }
    }
  }

  function snapshot(values, day) {
    const total = values[0] == null ? 0 : Number(values[0]);
    if (!Number.isSafeInteger(total) || total < 0) throw new UsageUnavailableError();
    return { available: true, total, limit, dateKey: day.dateKey, resetAt: day.resetAt,
      scope: "service", startedAt: values[1] || null };
  }

  return {
    async read() {
      const day = usageDay(clock());
      return snapshot(await command(["HMGET", `${namespace}:${day.dateKey}`, "total", "startedAt"]), day);
    },
    async increment(eventId = randomUUID()) {
      const now = clock();
      const day = usageDay(now);
      const key = `${namespace}:${day.dateKey}`;
      return snapshot(await command(["EVAL", INCREMENT_SCRIPT, 2, key, `${key}:event:${eventId}`,
        day.expiresAt, new Date(now).toISOString()]), day);
    },
    unavailable() {
      return { available: false, total: null, limit, scope: "service", ...usageDay(clock()) };
    }
  };
}

module.exports = { createUsageCounter, usageDay, UsageUnavailableError, INCREMENT_SCRIPT };
