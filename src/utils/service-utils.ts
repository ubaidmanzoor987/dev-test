import { createErrorHandler } from "@/utils/error-handlers";
import { logger } from "@/utils/logging";

export function createServiceContext(contextName: string) {
  return {
    log: logger.createContextLogger(contextName),
    handleError: createErrorHandler(contextName),
  };
}
