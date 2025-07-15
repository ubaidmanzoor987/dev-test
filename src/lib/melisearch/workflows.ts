import { melisearchClient } from "./client";
import { type IndexOptions } from "meilisearch";
import type { AttributeKeysMap, IndexDataMap, IndexUids } from "./types";

/**
 * Ensures a Meilisearch index exists and adds documents to it.
 *
 * This function first attempts to retrieve an existing index. If the index doesn't exist
 * (index_not_found error), it creates a new one with the specified options and configures
 * the searchable, filterable, and sortable attributes if provided.
 *
 * @template T - The index UID type that extends IndexUids
 * @param indexUid - The unique identifier for the Meilisearch index
 * @param documents - Array of documents to add to the index
 * @param attributes - Optional configuration for index attributes
 * @param attributes.searchable - Fields that can be searched
 * @param attributes.filterable - Fields that can be used for filtering
 * @param attributes.sortable - Fields that can be used for sorting
 * @param options - Optional index creation options
 * @returns Promise that resolves to the result of adding documents to the index
 * @throws Will throw an error if the workflow fails for any reason other than index not found
 *
 * @see {@link https://www.meilisearch.com/docs/reference/errors/error_codes#index-not-found | Meilisearch index_not_found error}
 */
export async function ensureIndexAndAddDocuments<T extends IndexUids>(
  indexUid: T,
  documents: IndexDataMap[T][],
  attributes?: {
    searchable?: AttributeKeysMap[T][];
    filterable?: AttributeKeysMap[T][];
    sortable?: AttributeKeysMap[T][];
  },
  options?: IndexOptions,
) {
  try {
    try {
      await melisearchClient.getIndex(indexUid);
    } catch (error) {
      if ((error as { code: string }).code === "index_not_found") {
        await melisearchClient.createIndex(indexUid, options);
        if (attributes?.searchable?.length) {
          await melisearchClient.updateAttributes(
            indexUid,
            "searchable",
            attributes.searchable,
          );
        }
        if (attributes?.filterable?.length) {
          await melisearchClient.updateAttributes(
            indexUid,
            "filterable",
            attributes.filterable,
          );
        }
        if (attributes?.sortable?.length) {
          await melisearchClient.updateAttributes(
            indexUid,
            "sortable",
            attributes.sortable,
          );
        }
      } else {
        throw error;
      }
    }

    return await melisearchClient.addDocuments(indexUid, documents);
  } catch (error) {
    console.error(`Workflow failed for index ${indexUid}:`, error);
    throw error;
  }
}
