export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number; // UNIX epoch seconds
}

export interface RateLimiter {
  limit(key: string): Promise<RateLimitResult>;
}
