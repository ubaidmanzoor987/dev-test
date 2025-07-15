import { describe, it, expect, vi } from "vitest";

import "@/__mocks__/lib/redis.mock";

import { getRedis } from "@/lib/redis";

vi.mock("@upstash/redis", () => ({
  Redis: vi.fn().mockImplementation(() => ({
    get: vi
      .fn()
      .mockImplementation((key) => Promise.resolve(`mocked-upstash-${key}`)),
    set: vi.fn().mockImplementation(() => Promise.resolve("OK")),
    del: vi.fn().mockImplementation(() => Promise.resolve(1)),
    publish: vi.fn().mockImplementation(() => Promise.resolve(1)),
  })),
}));

// Mock the external Redis libraries
vi.mock("ioredis", () => ({
  default: vi.fn().mockImplementation(() => ({
    get: vi
      .fn()
      .mockImplementation((key) => Promise.resolve(`mocked-ioredis-${key}`)),
    set: vi.fn().mockImplementation(() => Promise.resolve("OK")),
    del: vi.fn().mockImplementation(() => Promise.resolve(1)),
    publish: vi.fn().mockImplementation(() => Promise.resolve(1)),
  })),
}));

describe("Redis Client", () => {
  describe("getRedis function", () => {
    it("should return IORedis client in non-prod environments", async () => {
      // Tests use env.test which is not production
      const client = await getRedis();

      // Test a method works
      await client.set("test-key", "test-value");
      const result = await client.get("test-key"); // set in ioredis mock

      // Should use mocked IORedis implementation
      expect(result).toBe("mocked-ioredis-test-key");
    });

    it("should return Upstash client in production environment", async () => {
      vi.stubEnv("NODE_ENV", "production");

      const client = await getRedis();

      // Test a method works
      await client.set("test-key", "test-value");
      const result = await client.get("test-key"); // set in ioredis mock

      // Should use mocked Upstash implementation
      expect(result).toBe("mocked-upstash-test-key");

      // Reset NODE_ENV to original value
      vi.unstubAllEnvs();
    });

    it("should return the same instance on multiple calls", async () => {
      // First call - creates instance
      const client1 = await getRedis();

      // Mock that the client makes some changes
      await client1.set("client1-key", "client1-value");

      // Second call - should reuse instance
      const client2 = await getRedis();

      // Both clients should be the same instance
      expect(client2).toBe(client1);
    });
  });
});
