import type { Middleware } from "../types";
import { createErrorHandler } from "@/utils/error-handlers";

const handleError = createErrorHandler("LoggingMiddleware");

export const loggingMiddleware: Middleware = async (req, next) => {
  const start = Date.now();
  const path = req.nextUrl.pathname;
  console.log(`Request: ${req.method} ${path}`);

  try {
    const response = await next();
    const duration = Date.now() - start;
    console.log(`Response: ${response?.status ?? "unknown"} (${duration}ms)`);
    return response;
  } catch (error) {
    const duration = Date.now() - start;
    // Use the error handler instead of console.error
    handleError(`handle ${path} request`, error, {
      customMessage: `Error handling ${path} after ${duration}ms`,
      rethrow: true, // Let the middleware error handler deal with it
    });
  }
};
