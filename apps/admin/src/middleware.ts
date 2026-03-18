import { NextRequest, NextResponse } from "next/server";

// Admin Next.js app is configured with basePath="/admin".
// Keep login and public APIs accessible without auth checks.
const PUBLIC_PATHS = ["/admin/login", "/api/auth", "/api/site", "/api/docs"];
const SESSION_COOKIE = "better-auth.session_token";

const CORS_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3000",
];

function setCorsHeaders(response: NextResponse, origin: string | null) {
  const allowed = origin && CORS_ORIGINS.some((o) => origin.startsWith(o));
  response.headers.set(
    "Access-Control-Allow-Origin",
    allowed ? origin! : CORS_ORIGINS[0]
  );
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  response.headers.set("Access-Control-Max-Age", "86400");
  return response;
}

/**
 * Edge middleware: handles CORS for public API + checks session on protected routes.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const origin = request.headers.get("origin");

  if (request.method === "OPTIONS" && pathname.startsWith("/api/site")) {
    const response = new NextResponse(null, { status: 204 });
    return setCorsHeaders(response, origin);
  }

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p)) || pathname === "/") {
    const response = NextResponse.next();
    if (pathname.startsWith("/api/site") || pathname.startsWith("/api/docs")) {
      setCorsHeaders(response, origin);
    }
    return response;
  }

  const hasSession =
    request.cookies.has(SESSION_COOKIE) ||
    request.cookies.has("__Secure-better-auth.session_token");

  if (!hasSession) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/:path*",
  ],
};
