import type { RedisClient } from "@/lib/redis/types";
import type { SetCommandOptions } from "@upstash/redis";
import type { RedisServiceType } from "../types";

/**
 * Redis service wrapper providing common Redis operations.
 *
 * @example
 * ```typescript
 * const redisService = new RedisService(redisClient);
 * await redisService.setValue('user:123', 'john_doe');
 * const user = await redisService.getValue('user:123');
 * ```
 */
export class RedisService implements RedisServiceType {
  private client: RedisClient;

  /**
   * Creates a new RedisService instance.
   */
  constructor(client: RedisClient) {
    this.client = client;
  }

  // --------------------
  // String / KV commands
  // --------------------

  /**
   * Get value for a key, or null if not exists.
   */
  async getValue(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  /**
   * Set a key with optional expiration and conditions.
   *
   * @param options - Expiration (ex, px) and conditions (nx, xx)
   */
  async setValue(
    key: string,
    value: string | number,
    options?: SetCommandOptions,
  ): Promise<string | number | null> {
    return this.client.set(key, value, options);
  }

  /**
   * Delete a key, returns number of keys deleted (0 or 1).
   */
  async deleteKey(key: string): Promise<number> {
    return this.client.del(key);
  }

  // --------------------
  // Hash commands
  // --------------------

  /** Get a field value in a hash. */
  async hGet(key: string, field: string): Promise<string | null> {
    return this.client.hget(key, field);
  }

  /** Set a field value in a hash. */
  async hSet(
    key: string,
    field: string,
    value: string | number,
  ): Promise<number> {
    return this.client.hset(key, field, value);
  }

  /** Delete a field from a hash. */
  async hDel(key: string, field: string): Promise<number> {
    return this.client.hdel(key, field);
  }

  /** Get all fields and values of a hash. */
  async hGetAll(key: string): Promise<Record<string, string> | null> {
    return this.client.hgetall(key);
  }

  /** Check if a field exists in a hash. */
  async hExists(key: string, field: string): Promise<boolean> {
    const result = await this.client.hexists(key, field);
    return result === 1;
  }

  // --------------------
  // Pub/Sub commands
  // --------------------

  /** Publish a message to a Redis channel. */
  async publish(channel: string, message: string): Promise<number> {
    return this.client.publish(channel, message);
  }

  // --------------------
  // Scan command with pagination
  // --------------------

  /**
   * Scan Redis keys matching a pattern using cursor-based pagination.
   * Uses SCAN internally to avoid blocking Redis on large datasets.
   *
   * @param pattern - Redis key pattern (supports wildcards like '*' and '?')
   * @param batchSize - Keys to fetch per SCAN iteration (default: 100)
   */
  async scanKeys(pattern: string, batchSize = 100): Promise<string[]> {
    let cursor = "0";
    const allKeys: string[] = [];

    do {
      const { cursor: nextCursor, keys } = await this.client.scan(cursor, {
        match: pattern,
        count: batchSize,
      });
      cursor = nextCursor;
      allKeys.push(...keys);
    } while (cursor !== "0");

    return allKeys;
  }
}
