import { createTRPCRouter, publicProcedure } from "@/lib/trpc";
import { searchUsersHandler } from "./handlers/searchUsers";
import { SearchUsersInputSchema } from "../types";

export const searchRouter = createTRPCRouter({
  users: publicProcedure
    .input(SearchUsersInputSchema)
    .query(searchUsersHandler),
});
