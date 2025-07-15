import { describe, it, expect, vi, beforeEach } from "vitest";
import { TRPCError } from "@trpc/server";
import { searchUsersHandler } from "./searchUsers";
import { melisearchClient } from "@/lib/melisearch/client";
import type { UserDocument } from "@/lib/melisearch/types";

vi.mock("@/lib/melisearch/client", () => ({
  melisearchClient: {
    search: vi.fn(),
  },
}));

const createMockSearchResponse = (noOfDocuments: number) => {
  const user: UserDocument = {
    id: "1",
    username: "User",
    displayName: "User",
    avatar_url: "avatar.png",
  };
  const mockHits = Array(noOfDocuments).fill(user);
  return {
    hits: mockHits,
    processingTimeMs: 10,
    query: "test",
    facetDistribution: {},
    facetStats: {},
    estimatedTotalHits: noOfDocuments,
    offset: 0,
    limit: 10,
  };
};

describe("searchUsersHandler", () => {
  const mockSearch = vi.mocked(melisearchClient.search);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return users and hasMore=true when search results are equal to limit", async () => {
    const input = { term: "test", offset: 0, limit: 10 };
    const mockSearchResp = createMockSearchResponse(10);

    mockSearch.mockResolvedValue(mockSearchResp);

    const result = await searchUsersHandler({ input });

    expect(mockSearch).toHaveBeenCalledWith({
      indexUid: "users",
      query: "test",
      offset: 0,
      limit: 10,
    });
    expect(result.users).toEqual(mockSearchResp.hits);
    expect(result.hasMore).toBe(true);
  });

  it("should return users and hasMore=false when search results are not equal to limit", async () => {
    const input = { term: "test", offset: 0, limit: 10 };
    const mockSearchResp = createMockSearchResponse(5);

    mockSearch.mockResolvedValue(mockSearchResp);

    const result = await searchUsersHandler({ input });

    expect(result.users).toEqual(mockSearchResp.hits);
    expect(result.hasMore).toBe(false);
  });

  it("should handle empty search results", async () => {
    const input = { term: "test", offset: 0, limit: 10 };

    mockSearch.mockResolvedValue(createMockSearchResponse(0));

    const result = await searchUsersHandler({ input });

    expect(result.users).toEqual([]);
    expect(result.hasMore).toBe(false);
  });

  it("should throw TRPCError when melisearch fails", async () => {
    const input = { term: "test", offset: 0, limit: 10 };

    mockSearch.mockRejectedValue(new Error("Search failed"));

    await expect(searchUsersHandler({ input })).rejects.toThrow(TRPCError);
    await expect(searchUsersHandler({ input })).rejects.toThrow(
      "Failed to search users",
    );
  });

  it("should pass correct offset parameter", async () => {
    const input = { term: "test", offset: 20, limit: 10 };

    mockSearch.mockResolvedValue(createMockSearchResponse(10));

    await searchUsersHandler({ input });

    expect(mockSearch).toHaveBeenCalledWith({
      indexUid: "users",
      query: "test",
      offset: 20,
      limit: 10,
    });
  });
});
