import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  MeiliSearchError,
  type EnqueuedTask,
  type Index,
  type Task,
} from "meilisearch";
import { ensureIndexAndAddDocuments } from "../workflows";
import { melisearchClient } from "../client";
import type { AttributeKeysMap, IndexDataMap } from "../types";

// Mock client
vi.mock("../client", () => ({
  melisearchClient: {
    getIndex: vi.fn(),
    createIndex: vi.fn(),
    updateAttributes: vi.fn(),
    addDocuments: vi.fn(),
  },
}));

const mockMelisearchClient = vi.mocked(melisearchClient);

describe("ensureIndexAndAddDocuments", () => {
  const indexUid = "users";
  const documents: IndexDataMap["users"][] = [
    {
      id: "1",
      username: "test",
      displayName: "Test User",
      avatar_url: "http://example.com/avatar.png",
    },
  ];

  const getEnqueuedTask = (taskType: Task["type"]): EnqueuedTask => ({
    taskUid: 1,
    indexUid: indexUid,
    status: "enqueued",
    type: taskType,
    enqueuedAt: "2024-01-01T00:00:00.000Z",
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses existing index and adds documents", async () => {
    mockMelisearchClient.getIndex.mockResolvedValue({
      uid: indexUid,
    } as unknown as Index);
    mockMelisearchClient.addDocuments.mockResolvedValue(
      getEnqueuedTask("documentAdditionOrUpdate"),
    );

    const result = await ensureIndexAndAddDocuments(indexUid, documents);

    expect(mockMelisearchClient.getIndex).toHaveBeenCalledWith(indexUid);
    expect(mockMelisearchClient.createIndex).not.toHaveBeenCalled();
    expect(mockMelisearchClient.addDocuments).toHaveBeenCalledWith(
      indexUid,
      documents,
    );
    expect(result).toEqual(getEnqueuedTask("documentAdditionOrUpdate"));
  });

  it("creates index and configures attributes if index does not exist", async () => {
    const attr: AttributeKeysMap["users"][] = ["username", "displayName"];
    const attributes = {
      searchable: attr,
      filterable: attr,
      sortable: attr,
    };
    const options = { primaryKey: "id" };

    mockMelisearchClient.getIndex.mockRejectedValue({
      code: "index_not_found",
      message: "Index not found",
    });

    mockMelisearchClient.createIndex.mockResolvedValue(
      getEnqueuedTask("indexCreation"),
    );
    mockMelisearchClient.updateAttributes.mockResolvedValue(
      getEnqueuedTask("indexUpdate"),
    );
    mockMelisearchClient.addDocuments.mockResolvedValue(
      getEnqueuedTask("documentAdditionOrUpdate"),
    );

    const result = await ensureIndexAndAddDocuments(
      indexUid,
      documents,
      attributes,
      options,
    );

    expect(mockMelisearchClient.createIndex).toHaveBeenCalledWith(
      indexUid,
      options,
    );
    expect(mockMelisearchClient.updateAttributes).toHaveBeenCalledWith(
      indexUid,
      "searchable",
      attr,
    );
    expect(mockMelisearchClient.updateAttributes).toHaveBeenCalledWith(
      indexUid,
      "filterable",
      attr,
    );
    expect(mockMelisearchClient.updateAttributes).toHaveBeenCalledWith(
      indexUid,
      "sortable",
      attr,
    );
    expect(mockMelisearchClient.addDocuments).toHaveBeenCalledWith(
      indexUid,
      documents,
    );
    expect(result).toEqual(getEnqueuedTask("documentAdditionOrUpdate"));
  });

  it("creates index without attributes if attributes are undefined", async () => {
    mockMelisearchClient.getIndex.mockRejectedValue({
      code: "index_not_found",
      message: "Index not found",
    });

    mockMelisearchClient.createIndex.mockResolvedValue(
      getEnqueuedTask("indexCreation"),
    );
    mockMelisearchClient.addDocuments.mockResolvedValue(
      getEnqueuedTask("documentAdditionOrUpdate"),
    );

    await ensureIndexAndAddDocuments(indexUid, documents);

    expect(mockMelisearchClient.createIndex).toHaveBeenCalledWith(
      indexUid,
      undefined,
    );
    expect(mockMelisearchClient.updateAttributes).not.toHaveBeenCalled();
  });

  it("only updates specified attribute types", async () => {
    const attributes = {
      searchable: ["username"] as AttributeKeysMap["users"][],
    };

    mockMelisearchClient.getIndex.mockRejectedValue({
      code: "index_not_found",
      message: "Index not found",
    });

    mockMelisearchClient.createIndex.mockResolvedValue(
      getEnqueuedTask("indexCreation"),
    );
    mockMelisearchClient.updateAttributes.mockResolvedValue(
      getEnqueuedTask("indexUpdate"),
    );
    mockMelisearchClient.addDocuments.mockResolvedValue(
      getEnqueuedTask("documentAdditionOrUpdate"),
    );

    await ensureIndexAndAddDocuments(indexUid, documents, attributes);

    expect(mockMelisearchClient.updateAttributes).toHaveBeenCalledWith(
      indexUid,
      "searchable",
      attributes.searchable,
    );
    expect(mockMelisearchClient.updateAttributes).toHaveBeenCalledTimes(1);
  });

  it("throws error if getIndex fails with unexpected error", async () => {
    const error = new MeiliSearchError("API key invalid");
    mockMelisearchClient.getIndex.mockRejectedValue(error);

    await expect(
      ensureIndexAndAddDocuments(indexUid, documents),
    ).rejects.toThrow(error);
  });

  it("throws error if addDocuments fails", async () => {
    const error = new Error("Add documents failed");

    mockMelisearchClient.getIndex.mockResolvedValue({
      uid: indexUid,
    } as unknown as Index);
    mockMelisearchClient.addDocuments.mockRejectedValue(error);

    await expect(
      ensureIndexAndAddDocuments(indexUid, documents),
    ).rejects.toThrow(error);
  });

  it("throws error if createIndex fails", async () => {
    const error = new MeiliSearchError("Create index failed");

    mockMelisearchClient.getIndex.mockRejectedValue({
      code: "index_not_found",
      message: "Index not found",
    });

    mockMelisearchClient.createIndex.mockRejectedValue(error);

    await expect(
      ensureIndexAndAddDocuments(indexUid, documents),
    ).rejects.toThrow(error);
  });
});
