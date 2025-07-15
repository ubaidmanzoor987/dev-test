import { authMiddleware } from "../middlewares/auth-middleware";
import { i18nMiddleware } from "../middlewares/i18n-middleware";
import { loggingMiddleware } from "../middlewares/logging-middleware";
import { rateLimitMiddleware } from "../middlewares/rate-limit-middleware";
import type { Middleware } from "../types";

/**
 * Configuration for middleware pipelines used in the application.
 */

// The maximum number of requests allowed per client in a given time window
export const LIMIT_PER_WINDOW = 100;

// The time window in seconds for rate limiting
export const WINDOW_IN_SECONDS = 60;

// Application routes middleware pipeline
export const appMiddlewares: Middleware[] = [
  loggingMiddleware, // Keep first for accuract timing
  authMiddleware,
  rateLimitMiddleware,
  i18nMiddleware,
];

// API routes middleware pipeline
export const apiMiddlewares: Middleware[] = [
  loggingMiddleware,
  rateLimitMiddleware,
  i18nMiddleware,
];
