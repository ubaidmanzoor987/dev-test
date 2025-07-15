import type { Filter } from "meilisearch";

export interface UserDocument {
  id: string;
  username: string;
  displayName: string;
  avatar_url: string;
}

export type IndexDataMap = {
  users: UserDocument;
};

export type IndexUids = keyof IndexDataMap;

export type AttributeKeysMap = {
  [K in keyof IndexDataMap]: keyof IndexDataMap[K] & string;
};

export interface SearchOptions {
  indexUid: IndexUids;
  query?: string;
  offset: number;
  limit: number;
  filter?: Filter;
}
