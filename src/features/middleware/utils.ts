import { type NextRequest, NextResponse } from "next/server";
import type { Middleware } from "./types";

/**
 * Composes multiple middleware functions into a single pipeline
 * with proper typing throughout
 */
export function compose(
  middlewares: Middleware[],
): (request: NextRequest) => Promise<NextResponse | Response | undefined> {
  return async (request: NextRequest) => {
    let index = 0;

    const executeMiddleware = async (): Promise<
      NextResponse | Response | undefined
    > => {
      // If we've reached the end of the middleware chain
      if (index === middlewares.length) {
        return NextResponse.next();
      }

      // Get the current middleware and increment the index
      const currentMiddleware = middlewares[index++];

      // If the current middleware is not a function, throw an error
      if (typeof currentMiddleware !== "function") {
        throw new Error(`Middleware at index ${index - 1} is not a function`);
      }

      // Execute the current middleware, passing the next middleware as a callback
      return await currentMiddleware(request, executeMiddleware);
    };

    return executeMiddleware();
  };
}

/**
 * Helper to set headers on a response
 */
export function withHeaders(
  response: Response | NextResponse | undefined,
  headers: Record<string, string>,
): Response | NextResponse | undefined {
  // Return early if no response
  if (!response) return response;

  // Clone the response
  const newResponse = new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });

  // Add all the new headers
  Object.entries(headers).forEach(([key, value]) => {
    newResponse.headers.set(key, value);
  });

  return newResponse;
}

/**
 * Helper to set cookies on a response using Set-Cookie header
 */
export function withCookies(
  response: Response | NextResponse | undefined,
  cookies: Record<
    string,
    {
      value: string;
      options?: {
        maxAge?: number;
        expires?: Date;
        path?: string;
        domain?: string;
        secure?: boolean;
        httpOnly?: boolean;
        sameSite?: "strict" | "lax" | "none";
      };
    }
  >,
): Response | NextResponse | undefined {
  // Return early if no response
  if (!response) return response;

  // Clone the response
  const newResponse = new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });

  try {
    // Add all the cookies as Set-Cookie headers
    Object.entries(cookies).forEach(([name, { value, options = {} }]) => {
      // Build cookie string manually
      let cookieStr = `${name}=${encodeURIComponent(value)}`;

      if (options.path) cookieStr += `; Path=${options.path}`;
      if (options.domain) cookieStr += `; Domain=${options.domain}`;
      if (options.maxAge) cookieStr += `; Max-Age=${options.maxAge}`;
      if (options.expires)
        cookieStr += `; Expires=${options.expires.toUTCString()}`;
      if (options.httpOnly) cookieStr += "; HttpOnly";
      if (options.secure) cookieStr += "; Secure";
      if (options.sameSite) cookieStr += `; SameSite=${options.sameSite}`;

      // Set the cookie header directly
      newResponse.headers.append("Set-Cookie", cookieStr);
    });
  } catch (error) {
    console.error("Error setting cookie headers:", error);
    return response; // Return original on error
  }

  return newResponse;
}

export function withErrorResponse(
  error: string | Error,
  status = 500,
  headers: Record<string, string> = {},
): NextResponse {
  console.error("Middleware error:", error);
  const errorMsg = typeof error === "string" ? error : error.message;
  return new NextResponse(errorMsg, {
    status,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });
}
