import { MeiliSearch, type IndexOptions } from "meilisearch";
import { clientOptions } from "@/config/melisearch";
import type {
  AttributeKeysMap,
  IndexDataMap,
  IndexUids,
  SearchOptions,
} from "./types";
import { createServiceContext } from "@/utils/service-utils";

// Create service-specific handlers
const { log, handleError } = createServiceContext("MeilisearchClient");

/**
 * A wrapper client for MeiliSearch that provides type-safe operations for search indices.
 */
export class MeilisearchClient {
  /**
   * The underlying MeiliSearch client instance.
   * @private
   */
  private client: MeiliSearch;

  /**
   * Creates a new MeilisearchClient instance.
   * Initializes the underlying MeiliSearch client with predefined options.
   */
  constructor() {
    this.client = new MeiliSearch(clientOptions);
  }

  /**
   * Returns the underlying MeiliSearch client instance for advanced operations.
   * Use this method when you need direct access to MeiliSearch client features
   * that are not exposed through this wrapper.
   *
   * @returns The underlying MeiliSearch client instance
   */
  getClient = (): MeiliSearch => {
    return this.client;
  };

  /**
   * Creates a new search index with the specified UID and optional configuration.
   *
   * @template T - The index UID type that extends IndexUids
   * @param indexUid - The unique identifier for the index
   * @param options - Optional index configuration settings
   * @returns A promise that resolves to the created index task
   * @throws {Error} When index creation fails
   */
  createIndex = async <T extends IndexUids>(
    indexUid: T,
    options?: IndexOptions,
  ) => {
    try {
      log.info(`Creating index: ${indexUid}`, { options });
      return await this.client.createIndex(indexUid, options);
    } catch (error) {
      handleError("creating index", error);
    }
  };

  /**
   * Retrieves an existing index by its UID.
   *
   * @template T - The index UID type that extends IndexUids
   * @param indexUid - The unique identifier of the index to retrieve
   * @returns A promise that resolves to the index instance
   * @throws {Error} When index retrieval fails or index doesn't exist
   */
  getIndex = async <T extends IndexUids>(indexUid: T) => {
    try {
      log.info(`Retrieving index: ${indexUid}`);
      return await this.client.getIndex(indexUid);
    } catch (error) {
      handleError("retrieving index", error);
    }
  };

  /**
   * Adds or updates documents in the specified index.
   * If a document with the same primary key already exists, it will be updated.
   *
   * @template T - The index UID type that extends IndexUids
   * @param indexUid - The unique identifier of the target index
   * @param documents - An array of documents to add or update
   * @returns A promise that resolves to the document addition task
   * @throws {Error} When document addition fails
   */
  addDocuments = async <T extends IndexUids>(
    indexUid: T,
    documents: IndexDataMap[T][],
  ) => {
    try {
      log.info(`Adding documents to index: ${indexUid}`, {
        documentCount: documents.length,
      });
      return await this.client.index(indexUid).addDocuments(documents);
    } catch (error) {
      handleError("adding documents", error);
    }
  };

  /**
   * Deletes one or more documents from the specified index by their IDs.
   *
   * @template T - The index UID type that extends IndexUids
   * @param indexUid - The unique identifier of the target index
   * @param ids - A single document ID or an array of document IDs to delete
   * @returns A promise that resolves to the document deletion task
   * @throws {Error} When document deletion fails
   */
  deleteDocuments = async <T extends IndexUids>(
    indexUid: T,
    ids: string | string[],
  ) => {
    try {
      log.info(`Deleting documents from index: ${indexUid}`, {
        ids: Array.isArray(ids) ? ids.length : 1,
      });
      const index = this.client.index(indexUid);
      return Array.isArray(ids)
        ? await index.deleteDocuments(ids)
        : await index.deleteDocument(ids);
    } catch (error) {
      handleError("deleting documents", error);
    }
  };

  /**
   * Performs a search query on the specified index with optional filtering and pagination.
   *
   * @param options - The search configuration object
   * @param options.indexUid - The unique identifier of the index to search
   * @param options.query - The search query string
   * @param options.limit - Maximum number of results to return
   * @param options.filter - Filter expression to apply to the search
   * @param options.offset - Number of results to skip for pagination
   * @returns A promise that resolves to the search results
   * @throws {Error} When search operation fails
   */
  search = async <T extends IndexUids>(
    options: SearchOptions & { indexUid: T },
  ) => {
    const { indexUid, query, limit, filter, offset } = options;
    try {
      log.info(`Searching in index: ${indexUid}`, {
        query,
        limit,
        offset,
        filter,
      });
      return await this.client
        .index(indexUid)
        .search<IndexDataMap[T]>(query, { limit, offset, filter });
    } catch (error) {
      handleError("searching index", error, {
        customMessage: `Failed to search in index ${indexUid}`,
        includeStack: true,
      });
    }
  };

  /**
   * Updates the searchable, filterable, or sortable attributes configuration for an index.
   *
   * @template T - The index UID type that extends IndexUids
   * @template Attr - The attribute keys type for the specified index
   * @param indexUid - The unique identifier of the target index
   * @param type - The type of attributes to update ('searchable', 'filterable', or 'sortable')
   * @param attributes - An array of attribute names to configure
   * @returns A promise that resolves to the attribute update task
   * @throws {Error} When attribute update fails
   */
  updateAttributes = async <
    T extends IndexUids,
    Attr extends AttributeKeysMap[T],
  >(
    indexUid: T,
    type: "searchable" | "filterable" | "sortable",
    attributes: Attr[],
  ) => {
    try {
      log.info(`Updating ${type} attributes for index: ${indexUid}`, {
        attributes,
      });
      const index = this.client.index(indexUid);
      const updaterMap = {
        searchable: (attrs: Attr[]) => index.updateSearchableAttributes(attrs),
        filterable: (attrs: Attr[]) => index.updateFilterableAttributes(attrs),
        sortable: (attrs: Attr[]) => index.updateSortableAttributes(attrs),
      };
      return await updaterMap[type](attributes);
    } catch (error) {
      handleError(`updating ${type} attributes`, error);
    }
  };
}

export const melisearchClient = new MeilisearchClient();
