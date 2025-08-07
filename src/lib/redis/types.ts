export interface RedisClient {
  get(key: string): Promise<string | null>;
  /**
   * Ping the Redis server
   * @returns 'PONG' if successful
   */
  ping(): Promise<string>;

  /**
   * Set key to hold the string value
   * @param key The key to set
   * @param value The value to set
   * @param options Optional settings like TTL
   */
  set(
    key: string,
    value: string | number,
    options?: {
      /** Expiration time in seconds */
      ex?: number;
      /** Expiration time in milliseconds */
      px?: number;
      /** Set if key does not exist */
      nx?: boolean;
      /** Set if key exists */
      xx?: boolean;
      /** Set if key is about to expire in less than N seconds */
      lt?: number;
      /** Set if key will expire after N seconds */
      gt?: number;
      [key: string]: string | number | boolean | undefined;
    },
  ): Promise<string | number | null>;

  /**
   * Incrementally iterate the set of keys in the current database
   * @param cursor The cursor returned by the previous call or '0' to start a new iteration
   * @param options Scan options
   */
  scan(
    cursor: string | number,
    options?: {
      /** Pattern to match keys against */
      match?: string;
      /** Number of keys to return per iteration */
      count?: number;
      /** Type of keys to return */
      type?: string;
    },
  ): Promise<{ cursor: string; keys: string[] }>;
  del(key: string): Promise<number>;

  /**
   * Publish a message to a channel
   * @param channel The channel to publish to
   * @param message The message to publish
   * @returns Number of clients that received the message
   */
  publish(channel: string, message: string): Promise<number>;

  // Hashing methods
  
  /**
   * Get the value of a hash field
   * @param key The hash key
   * @param field The field name
   */
  hget(key: string, field: string): Promise<string | null>;
  
  /**
   * Set the string value of a hash field
   * @param key The hash key
   * @param field The field name
   * @param value The value to set
   */
  hset(key: string, field: string, value: string | number): Promise<number>;
  
  /**
   * Delete one or more hash fields
   * @param key The hash key
   * @param field The field to delete
   */
  hdel(key: string, field: string): Promise<number>;
  
  /**
   * Get all fields and values in a hash
   * @param key The hash key
   */
  hgetall(key: string): Promise<Record<string, string> | null>;
  
  /**
   * Determine if a hash field exists
   * @param key The hash key
   * @param field The field to check
   */
  hexists(key: string, field: string): Promise<number>;
}
