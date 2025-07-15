import type { NextRequest, NextResponse } from "next/server";

export type Middleware = (
  request: NextRequest,
  next: () => Promise<NextResponse | Response | undefined>,
) => Promise<NextResponse | Response | undefined>;
