import { createServiceContext } from "@/utils/service-utils";
import { TRPCError } from "@trpc/server";
import { searchService } from "../../services/search-service";
import type { SearchUsersInput } from "../../types";

const { log } = createServiceContext("searchUsersHandler");

export const searchUsersHandler = async ({
  input,
}: {
  input: SearchUsersInput;
}) => {
  log.info("searching users", input);

  try {
    const { users, hasMore, offset } = await searchService.searchUsers({
      term: input.term,
      offset: input.offset,
      limit: input.limit,
    });

    return { users, hasMore, offset };
  } catch (error) {
    // Don't user `handleError` here, as we want to throw a TRPCError
    log.error("searching users", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to search users",
    });
  }
};
