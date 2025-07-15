export type RedisServiceType = {
  getValue(key: string): Promise<string | null>;
  setValue(
    key: string,
    value: string | number,
  ): Promise<string | number | null>;
  deleteKey(key: string): Promise<number>;
  hGet(key: string, field: string): Promise<string | null>;
  hSet(key: string, field: string, value: string | number): Promise<number>;
  hDel(key: string, field: string): Promise<number>;
  hGetAll(key: string): Promise<Record<string, string> | null>;
  hExists(key: string, field: string): Promise<boolean>;
  publish(channel: string, message: string): Promise<number>;
  scanKeys(pattern: string, batchSize?: number): Promise<string[]>;
};
