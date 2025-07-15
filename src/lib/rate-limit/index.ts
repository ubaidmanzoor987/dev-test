import { Ratelimit as UpstashRatelimit } from "@upstash/ratelimit";
import { Redis as UpstashRedis } from "@upstash/redis";
import type { RedisClient } from "@/lib/redis/types";
import type { RateLimiter } from "./types";
import { env } from "@/env";

let upstash: UpstashRedis | null = null;
let rateLimiter: RateLimiter | null = null;

export async function getRateLimiter(
  redis: RedisClient,
  opts: { limit: number; windowSec: number },
): Promise<RateLimiter> {
  // If we already have a rate limiter instance, return it
  if (rateLimiter) {
    return rateLimiter;
  }

  // If we already have an Upstash Redis instance, use it
  upstash =
    upstash ??
    new UpstashRedis({
      url: env.UPSTASH_REDIS_REST_URL,
      token: env.UPSTASH_REDIS_REST_TOKEN,
    });

  // Otherwise, create a new rate limiter instance,
  // cache and return it
  rateLimiter = new UpstashRatelimit({
    redis: upstash,
    limiter: UpstashRatelimit.slidingWindow(opts.limit, `${opts.windowSec}s`),
    analytics: true,
    prefix: "ratelimit",
  });

  return rateLimiter;
}
