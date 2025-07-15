import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { apiPipeline, appPipeline } from "./features/middleware";

/**
 * Main Next.js middleware handler
 */
export async function middleware(
  request: NextRequest,
): Promise<NextResponse | Response> {
  try {
    const path = request.nextUrl.pathname;
    const isApiRoute = path.startsWith("/api/");

    // Execute the appropriate middleware pipeline
    const response = await (isApiRoute ? apiPipeline : appPipeline)(request);

    // Ensure we return a proper Response object
    if (!response) {
      return NextResponse.next();
    }
    return response;
  } catch (error) {
    console.error("Middleware error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export const config = {
  // Specify which routes the middleware applies to
  // Exclude health checks, static files, and favicon
  matcher: ["/((?!api/health|_next/static|_next/image|favicon.ico).*)"],
};
