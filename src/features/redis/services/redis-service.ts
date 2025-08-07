import type { RedisClient } from "@/lib/redis/types";
import type { RedisServiceType } from "../types";
import { createClient, type RedisClientType, type RedisDefaultModules } from "redis";
import { db } from "@/lib/db";
import { env } from "@/env";

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
  private subscriber: RedisClientType<RedisDefaultModules, any, any>;
  private messageHandlers: Map<string, (message: string) => void> = new Map();
  private isConnected: boolean = false;

  /**
   * Creates a new RedisService instance.
   */
  constructor(client: RedisClient) {
    this.client = client;
    this.subscriber = createClient({
      socket: {
        host: env.REDIS_HOST || 'localhost',
        port: parseInt(env.REDIS_PORT || '6379'),
      },
      password: env.REDIS_PASSWORD,
      database: parseInt(env.REDIS_DB || '0'),
    });
  }

  private async ensureConnected() {
    if (this.isConnected) return true;
    
    try {
      await this.client.ping();
      this.isConnected = true;
      return true;
    } catch (error) {
      console.error('Redis connection error:', error);
      this.isConnected = false;
      throw new Error('Failed to connect to Redis');
    }
  }

  async createSubscriber(): Promise<RedisClientType<RedisDefaultModules, any, any>> {
    if (this.subscriber) return this.subscriber;
    
    const redisOptions = {
      host: env.REDIS_HOST || 'localhost',
      port: parseInt(env.REDIS_PORT || '6379'),
      password: env.REDIS_PASSWORD,
      db: parseInt(env.REDIS_DB || '0'),
      retryStrategy: (times: number) => {
        // Reconnect after 5 seconds
        return Math.min(times * 100, 5000);
      },
      reconnectOnError: (err: Error) => {
        const targetError = 'READONLY';
        if (err.message.includes(targetError)) {
          // Only reconnect when the error contains "READONLY"
          return true;
        }
        return false;
      }
    };


    // Connect to Redis
    await this.subscriber.connect();

    // Set up error handling
    this.subscriber.on('error', (error: any) => {
      console.error('Redis Subscriber Error:', error);
      this.isConnected = false;
    });

    // Set up connection handling
    this.subscriber.on('connect', () => {
      console.log('Redis Subscriber connected');
      this.isConnected = true;
    });

    // Wait for connection to be ready
    await new Promise<void>((resolve, reject) => {
      const onReady = () => {
        this.subscriber?.removeListener('error', onError);
        resolve();
      };
      
      const onError = (err: Error) => {
        this.subscriber?.removeListener('ready', onReady);
        reject(err);
      };

      // If already connected resolve immediately
      if (this.subscriber?.isReady) {
        resolve();
      } else {
        this.subscriber?.once('ready', onReady);
        this.subscriber?.once('error', onError);
      }
    });

    return this.subscriber;
  }

  /** Subscribe to a Redis channel */
  async subscribe(channel: string, onMessage: (message: string) => void): Promise<void> {
    console.log('Subscribing to channel:', channel);
    const subscriber = await this.createSubscriber();
    this.messageHandlers.set(channel, onMessage);
    subscriber.subscribe(channel, (error: any, count: any) => {
      if (error) {
        console.error('Error subscribing to channel:', error);
      } else {
        console.log(`Subscribed to channel ${channel}.`);
      }
    });
    subscriber.on('message', (channel: string, message: string) => {
      const handler = this.messageHandlers.get(channel);
      if (handler) {
        handler(message);
      }
    });
  }
  
  /** Unsubscribe from a Redis channel */
  async unsubscribe(channel: string): Promise<void> {
    if (this.subscriber) {
      this.messageHandlers.delete(channel);
      this.subscriber.unsubscribe(channel, (error: any, count: any) => {
        if (error) {
          console.error('Error unsubscribing from channel:', error);
        } else {
          console.log(`Unsubscribed from channel ${channel}.`);
        }
      });
    }
  }

  /** Create a user-specific channel name */
  static async getUserChannel(userId: string): Promise<string> {
    try{
      console.log(`user:${userId}:messages`);
      await db.user.update({
        where: { id: userId },
        data: { channel: `user:${userId}:messages` },
      });
      return `user:${userId}:messages`;
    } catch(err: any) {
      return err;
    }
  }

  static async getSingleUserChannel(userId: string): Promise<string> {
    try{
      console.log(`user:${userId}:messages`);
      const user = await db.user.findUnique({
        where: { id: userId },
      });
      return user?.channel || `user:${userId}:messages`;
    } catch(err: any) {
      return err;
    }
  }

  /** Get the global channel name */
  static getGlobalChannel(): string {
    return 'global:messages';
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
    options?: { [key: string]: string | number },
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
    try {
      await this.ensureConnected();
      const result = await this.client.publish(channel, message);
      return result;
    } catch (error) {
      console.error('Redis publish error:', error);
      throw error;
    }
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
