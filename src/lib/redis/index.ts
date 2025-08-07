import type { RedisClient } from "./types";
import { env } from "@/env";
import { createClient } from "redis";

/**
 * Singleton pattern for Redis client
 * This prevents creating multiple connections in serverless environments
 * where function instances might be reused across invocations
 */
let redisClient: RedisClient | null = null;

/**
 * Get the Redis client based on the environment.
 * In production, it uses Upstash Redis; in development/testing, it uses IORedis.
 * This function caches the client to avoid creating multiple connections.
 * @returns {Promise<RedisClient>} The Redis client instance
 */
export async function getRedis(): Promise<RedisClient> {
  // Return existing client if already initialized
  if (redisClient) return redisClient;

  redisClient = await createLocalRedisClient();

  return redisClient;
}

/**
 * Create a Redis client for Upstash Redis.
 * Note: This should not be imported directly. Use the `getRedis`
 * function to retrieve the cached client instead.
 * @returns {RedisClient} Redis client for Upstash Redis
 */
export async function createLocalRedisClient(): Promise<RedisClient> {
    // Create a Redis client using node-redis for local/dev
  const redisRaw = createClient({
    socket: {
      host: env.REDIS_HOST || "localhost",
      port: parseInt(env.REDIS_PORT || "6379"),
    },
    password: env.REDIS_PASSWORD,
    database: parseInt(env.REDIS_DB || "0"),
  });
  // Ensure connection is established
  if (!redisRaw.isOpen) {
    await redisRaw.connect();
  }

  const client: RedisClient = {
    // Standard commands
    get: (key) => redisRaw.get(key),
    // Health check
    ping: () => redisRaw.ping(),
    set: (key, value, options) => redisRaw.set(key, value.toString(), options as any),
    del: (key) => redisRaw.del(key),
    publish: (channel, message) => redisRaw.publish(channel, message),
    scan: async (cursor, options) => {
      // node-redis SCAN returns [cursor, keys[]]
      // @ts-ignore – types currently inaccurate
      const [nextCursor, keys] = await redisRaw.scan(cursor.toString(), {
        MATCH: options?.match,
        COUNT: options?.count,
      });
      return { cursor: nextCursor, keys };
    },
    hget: (key, field) => redisRaw.hGet(key, field),
    hset: (key, field, value) => redisRaw.hSet(key, field, value.toString()),
    hdel: (key, field) => redisRaw.hDel(key, field),
    hgetall: async (key) => {
      const res = await redisRaw.hGetAll(key);
      return Object.keys(res).length ? (res as any) : null;
    },
    hexists: (key, field) => redisRaw.hExists(key, field).then((exists) => exists ? 1 : 0),
  };

  return client;
}
