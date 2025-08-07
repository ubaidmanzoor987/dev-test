// Local sliding-window rate limiter using Redis (ioredis) or in-memory fallback
import type { RedisClient } from "@/lib/redis/types";
import type { RateLimiter } from "./types";


// In-memory store used if Redis is unavailable (dev/test only)
const memoryStore: Map<string, { count: number; resetAt: number }> = new Map();
let rateLimiter: RateLimiter | null = null;

export async function getRateLimiter(
  redis: RedisClient,
  opts: { limit: number; windowSec: number },
): Promise<RateLimiter> {
  // If we already have a rate limiter instance, return it
  if (rateLimiter) {
    return rateLimiter;
  }

  // Build Redis-backed limiter using INCR + EXPIRE.
  rateLimiter = {
    async limit(key: string) {
      try {
        // Use a namespaced key
        const redisKey = `ratelimit:${key}`;
        // @ts-ignore allow dynamic command
        const current = (await (redis as any).incr(redisKey)) as number;
        if (current === 1) {
          // First hit – set expiry window
          // @ts-ignore
          await (redis as any).expire(redisKey, opts.windowSec);
        }
        // @ts-ignore
        const ttl: number = await (redis as any).ttl(redisKey);
        const remaining = Math.max(opts.limit - current, 0);
        const success = current <= opts.limit;
        return {
          success,
          limit: opts.limit,
          remaining,
          reset: Math.floor(Date.now() / 1000) + (ttl > 0 ? ttl : opts.windowSec),
        };
      } catch (err) {
        // Redis unavailable – fall back to in-memory store
        const now = Math.floor(Date.now() / 1000);
        const windowSize = opts.windowSec;
        const rec = memoryStore.get(key);
        if (!rec || rec.resetAt <= now) {
          memoryStore.set(key, { count: 1, resetAt: now + windowSize });
          return { success: true, limit: opts.limit, remaining: opts.limit - 1, reset: now + windowSize };
        }
        if (rec.count < opts.limit) {
          rec.count += 1;
          memoryStore.set(key, rec);
          return { success: true, limit: opts.limit, remaining: opts.limit - rec.count, reset: rec.resetAt };
        }
        return { success: false, limit: opts.limit, remaining: 0, reset: rec.resetAt };
      }
    },
  };

  return rateLimiter;
}
