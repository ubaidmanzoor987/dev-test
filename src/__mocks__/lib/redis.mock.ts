import { vi } from "vitest";
import type { RedisClient } from "@/lib/redis/types";

const redisBase: Partial<RedisClient> = {
  get: vi.fn().mockResolvedValue(null),
  set: vi.fn().mockResolvedValue("OK"),
  del: vi.fn().mockResolvedValue(1),
  publish: vi.fn().mockResolvedValue(1),
  scan: vi.fn().mockResolvedValue({
    cursor: "0",
    keys: ["mocked-key1", "mocked-key2"],
  }),
  hget: vi.fn().mockResolvedValue(null),
  hset: vi.fn().mockResolvedValue(1),
  hdel: vi.fn().mockResolvedValue(1),
  hgetall: vi.fn().mockResolvedValue({}),
  hexists: vi.fn().mockResolvedValue(0),
};

// Create individual mock implementations for each environment
const mockIORedisClient = {
  ...redisBase,
  get: vi
    .fn()
    .mockImplementation((key) => Promise.resolve(`mocked-ioredis-${key}`)),
  scan: vi.fn().mockResolvedValue({
    cursor: "0",
    keys: ["mocked-ioredis-key1", "mocked-ioredis-key2"],
  }),
} as RedisClient;

const mockUpstashRedisClient = {
  ...redisBase,
  get: vi
    .fn()
    .mockImplementation((key) => Promise.resolve(`mocked-upstash-${key}`)),
  scan: vi.fn().mockResolvedValue({
    cursor: "0",
    keys: ["mocked-upstash-key1", "mocked-upstash-key2"],
  }),
} as RedisClient;

// Mock the entire Redis module
vi.mock("@/lib/redis", async () => {
  // We'll return different implementations based on NODE_ENV
  return {
    getRedis: vi.fn().mockImplementation(async () => {
      if (process.env.NODE_ENV === "production") {
        return mockUpstashRedisClient;
      }
      return mockIORedisClient;
    }),
    createUpstashRedisClient: vi.fn().mockResolvedValue(mockUpstashRedisClient),
    createLocalRedisClient: vi.fn().mockResolvedValue(mockIORedisClient),
  };
});
