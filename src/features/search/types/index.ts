import { z } from "zod";

const SEARCH_LIMIT = 10;

export const SearchUsersInputSchema = z.object({
  term: z.string().optional(),
  offset: z.number().int().min(0).default(0),
  limit: z.number().int().min(1).max(30).default(SEARCH_LIMIT),
});

export type SearchUsersInput = z.infer<typeof SearchUsersInputSchema>;
