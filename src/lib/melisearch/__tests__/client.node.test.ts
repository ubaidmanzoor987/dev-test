import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";

// Import mocks before importing the actual modules
import "@/__mocks__/lib/meilisearch.mock";
import "@/__mocks__/utils/error-handlers.mock";
import { MockedMeiliSearch } from "@/__mocks__/lib/meilisearch.mock";

// Import the actual models under test
import { MeiliSearch } from "meilisearch";
import { MeilisearchClient } from "../client";
import { clientOptions } from "@/config/melisearch";
import type { AttributeKeysMap, IndexDataMap } from "../types";

describe("MeilisearchClient", () => {
  let client: MeilisearchClient;
  let mockMeiliSearchInstance: {
    createIndex: Mock;
    getIndex: Mock;
    index: Mock;
  };
  let mockIndex: {
    addDocuments: Mock;
    deleteDocuments: Mock;
    deleteDocument: Mock;
    search: Mock;
    updateSearchableAttributes: Mock;
    updateFilterableAttributes: Mock;
    updateSortableAttributes: Mock;
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockIndex = {
      addDocuments: vi.fn(),
      deleteDocuments: vi.fn(),
      deleteDocument: vi.fn(),
      search: vi.fn(),
      updateSearchableAttributes: vi.fn(),
      updateFilterableAttributes: vi.fn(),
      updateSortableAttributes: vi.fn(),
    };

    mockMeiliSearchInstance = {
      createIndex: vi.fn(),
      getIndex: vi.fn(),
      index: vi.fn().mockReturnValue(mockIndex),
    };

    (MeiliSearch as unknown as Mock).mockImplementation(
      () => mockMeiliSearchInstance,
    );
    client = new MeilisearchClient();
  });

  describe("constructor", () => {
    it("should create MeiliSearch instance with client options", () => {
      expect(MockedMeiliSearch).toHaveBeenCalledWith(clientOptions);
    });
  });

  describe("createIndex", () => {
    it("should create index successfully", async () => {
      const mockResult = { taskUid: 1 };
      mockMeiliSearchInstance.createIndex.mockResolvedValue(mockResult);

      const result = await client.createIndex("users");

      expect(mockMeiliSearchInstance.createIndex).toHaveBeenCalledWith(
        "users",
        undefined,
      );
      expect(result).toBe(mockResult);
    });

    it("should create index with options", async () => {
      const options = { primaryKey: "id" };
      const mockResult = { taskUid: 1 };
      mockMeiliSearchInstance.createIndex.mockResolvedValue(mockResult);

      const result = await client.createIndex("users", options);

      expect(mockMeiliSearchInstance.createIndex).toHaveBeenCalledWith(
        "users",
        options,
      );
      expect(result).toBe(mockResult);
    });

    it("should handle errors when creating index", async () => {
      const error = new Error("Failed to create");
      mockMeiliSearchInstance.createIndex.mockRejectedValue(error);

      await expect(client.createIndex("users")).rejects.toThrow(
        "Failed to creating index: Failed to create",
      );
    });
  });

  describe("getIndex", () => {
    it("should retrieve index successfully", async () => {
      const mockResult = { uid: "users" };
      mockMeiliSearchInstance.getIndex.mockResolvedValue(mockResult);

      const result = await client.getIndex("users");

      expect(mockMeiliSearchInstance.getIndex).toHaveBeenCalledWith("users");
      expect(result).toBe(mockResult);
    });

    // it("should handle errors and rethrow", async () => {
    //   const error = new Error("Index not found");
    //   mockMeiliSearchInstance.getIndex.mockRejectedValue(error);

    //   await expect(client.getIndex("users")).rejects.toThrow("Index not found");
    // });
  });

  describe("addDocuments", () => {
    it("should add documents successfully", async () => {
      const documents: IndexDataMap["users"][] = [
        {
          id: "1",
          username: "test",
          displayName: "Test User",
          avatar_url: "test.jpg",
        },
      ];
      const mockResult = { taskUid: 1 };
      mockIndex.addDocuments.mockResolvedValue(mockResult);

      const result = await client.addDocuments("users", documents);

      expect(mockMeiliSearchInstance.index).toHaveBeenCalledWith("users");
      expect(mockIndex.addDocuments).toHaveBeenCalledWith(documents);
      expect(result).toBe(mockResult);
    });

    // it("should handle errors and rethrow", async () => {
    //   const documents: IndexDataMap["users"][] = [
    //     {
    //       id: "1",
    //       username: "test",
    //       displayName: "Test User",
    //       avatar_url: "test.jpg",
    //     },
    //   ];
    //   const error = new Error("Failed to add documents");
    //   mockIndex.addDocuments.mockRejectedValue(error);

    //   await expect(client.addDocuments("users", documents)).rejects.toThrow(
    //     "Failed to add documents",
    //   );
    // });
  });

  describe("deleteDocuments", () => {
    it("should delete multiple documents by IDs", async () => {
      const ids = ["1", "2", "3"];
      const mockResult = { taskUid: 1 };
      mockIndex.deleteDocuments.mockResolvedValue(mockResult);

      const result = await client.deleteDocuments("users", ids);

      expect(mockMeiliSearchInstance.index).toHaveBeenCalledWith("users");
      expect(mockIndex.deleteDocuments).toHaveBeenCalledWith(ids);
      expect(result).toBe(mockResult);
    });

    it("should delete single document by ID", async () => {
      const id = "1";
      const mockResult = { taskUid: 1 };
      mockIndex.deleteDocument.mockResolvedValue(mockResult);

      const result = await client.deleteDocuments("users", id);

      expect(mockMeiliSearchInstance.index).toHaveBeenCalledWith("users");
      expect(mockIndex.deleteDocument).toHaveBeenCalledWith(id);
      expect(result).toBe(mockResult);
    });

    // it("should handle errors and rethrow", async () => {
    //   const error = new Error("Failed to delete");
    //   mockIndex.deleteDocument.mockRejectedValue(error);

    //   await expect(client.deleteDocuments("users", "1")).rejects.toThrow(
    //     "Failed to delete",
    //   );
    // });
  });

  describe("search", () => {
    it("should search documents successfully", async () => {
      const options = {
        indexUid: "users",
        query: "test query",
        limit: 10,
        offset: 0,
        filter: 'category = "test"',
      } as const;
      const mockResult = { hits: [], totalHits: 0 };
      mockIndex.search.mockResolvedValue(mockResult);

      const result = await client.search(options);

      expect(mockMeiliSearchInstance.index).toHaveBeenCalledWith("users");
      expect(mockIndex.search).toHaveBeenCalledWith("test query", {
        limit: 10,
        offset: 0,
        filter: 'category = "test"',
      });
      expect(result).toBe(mockResult);
    });

    // it("should handle errors and rethrow", async () => {
    //   const options = {
    //     indexUid: "users",
    //     query: "test query",
    //     limit: 10,
    //     offset: 0,
    //   } as const;
    //   const error = new Error("Search failed");
    //   mockIndex.search.mockRejectedValue(error);

    //   await expect(client.search(options)).rejects.toThrow("Search failed");
    // });
  });

  describe("updateAttributes", () => {
    it("should update searchable attributes", async () => {
      const attributes: AttributeKeysMap["users"][] = [
        "username",
        "displayName",
      ];
      const mockResult = { taskUid: 1 };
      mockIndex.updateSearchableAttributes.mockResolvedValue(mockResult);

      const result = await client.updateAttributes(
        "users",
        "searchable",
        attributes,
      );

      expect(mockMeiliSearchInstance.index).toHaveBeenCalledWith("users");
      expect(mockIndex.updateSearchableAttributes).toHaveBeenCalledWith(
        attributes,
      );
      expect(result).toBe(mockResult);
    });

    it("should update filterable attributes", async () => {
      const attributes: AttributeKeysMap["users"][] = [
        "username",
        "displayName",
      ];
      const mockResult = { taskUid: 1 };
      mockIndex.updateFilterableAttributes.mockResolvedValue(mockResult);

      const result = await client.updateAttributes(
        "users",
        "filterable",
        attributes,
      );

      expect(mockIndex.updateFilterableAttributes).toHaveBeenCalledWith(
        attributes,
      );
      expect(result).toBe(mockResult);
    });

    it("should update sortable attributes", async () => {
      const attributes: AttributeKeysMap["users"][] = [
        "username",
        "displayName",
      ];
      const mockResult = { taskUid: 1 };
      mockIndex.updateSortableAttributes.mockResolvedValue(mockResult);

      const result = await client.updateAttributes(
        "users",
        "sortable",
        attributes,
      );

      expect(mockIndex.updateSortableAttributes).toHaveBeenCalledWith(
        attributes,
      );
      expect(result).toBe(mockResult);
    });

    // it("should handle errors and rethrow", async () => {
    //   const error = new Error("Failed to update attributes");
    //   mockIndex.updateSearchableAttributes.mockRejectedValue(error);

    //   await expect(
    //     client.updateAttributes("users", "searchable", ["username"]),
    //   ).rejects.toThrow("Failed to update attributes");
    // });
  });

  describe("getClient", () => {
    it("should return the underlying MeiliSearch client", () => {
      const result = client.getClient();
      expect(result).toBe(mockMeiliSearchInstance);
    });
  });

  // it('should log operations correctly', async () => {
  //   const documents: IndexDataMap["users"][] = [
  //     {
  //       id: "1",
  //       username: "test",
  //       displayName: "Test User",
  //       avatar_url: "test.jpg",
  //     },
  //   ];
  //   const mockResult = { taskUid: 1 };
  //   mockIndex.addDocuments.mockResolvedValue(mockResult);

  //   await client.addDocuments("users", documents);

  //   expect(mockError).toHaveBeenCalledWith(expect.stringMatching(/^MeilisearchClient/));
  // });
});
