import { melisearchClient } from "@/lib/melisearch/client";
import { createServiceContext } from "@/utils/service-utils";
import { SearchUsersInputSchema, type SearchUsersInput } from "../types";

const { log, handleError } = createServiceContext("search-service");

export const searchService = {
  searchUsers: async (input: SearchUsersInput) => {
    log.info("searching users", "Searching creators with input:", input);

    try {
      const params = SearchUsersInputSchema.parse(input);

      const searchResult = await melisearchClient.search({
        indexUid: "users",
        query: params.term,
        offset: params.offset,
        limit: params.limit,
      });

      const users = searchResult?.hits ?? [];
      const hasMore = users.length === params.limit;

      return { users, hasMore, offset: params.offset + users.length };
    } catch (error) {
      return handleError("searching users", error);
    }
  },
};
