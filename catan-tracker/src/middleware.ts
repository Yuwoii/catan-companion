import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // 1. Skip checks for internal Next.js requests, static files, and the blocked page itself
  if (
    request.nextUrl.pathname.startsWith("/_next") ||
    request.nextUrl.pathname.startsWith("/api") || // Optional: allow API calls?
    request.nextUrl.pathname.includes(".") ||      // Skip files like images, favicon, etc.
    request.nextUrl.pathname === "/blocked"        // IMPORTANT: Don't block the "Blocked" page!
  ) {
    return NextResponse.next();
  }

  // 2. Identify the country from Vercel's geo headers
  const country = request.headers.get("x-vercel-ip-country");

  // 3. Block if not Switzerland ('CH')
  // We also check for 'localhost' behavior: country is often null in local development
  const isDev = process.env.NODE_ENV === "development";
  
  if (!isDev && country && country !== "CH") {
    // Redirect unwanted visitors to a dedicated blocked page
    return NextResponse.rewrite(new URL("/blocked", request.url));
  }

  return NextResponse.next();
}