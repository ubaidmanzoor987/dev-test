import type { ScanCommandOptions, SetCommandOptions } from "@upstash/redis";

export interface RedisClient {
  get(key: string): Promise<string | null>;
  set(
    key: string,
    value: string | number,
    options?: SetCommandOptions,
  ): Promise<string | number | null>;
  scan(
    cursor: string,
    options: ScanCommandOptions,
  ): Promise<{ cursor: string; keys: string[] }>;
  del(key: string): Promise<number>;

  // Upstash redis does not have a `subscribe` method,
  // so we don't include it in the interface.
  publish(channel: string, message: string): Promise<number>;

  // Hashing methods
  hget(key: string, field: string): Promise<string | null>;
  hset(key: string, field: string, value: string | number): Promise<number>;
  hdel(key: string, field: string): Promise<number>;
  hgetall(key: string): Promise<Record<string, string> | null>;
  hexists(key: string, field: string): Promise<number>;
}
