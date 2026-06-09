import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PASSWORD = "redwhiteblue";
const COOKIE_NAME = "bedrock_gate";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow the password gate page, its API route, and auth pages
  if (pathname === "/gate" || pathname.startsWith("/api/gate") || pathname === "/signin" || pathname === "/signup") {
    return NextResponse.next();
  }

  // Check for the gate cookie
  const cookie = request.cookies.get(COOKIE_NAME);
  if (cookie?.value === PASSWORD) {
    return NextResponse.next();
  }

  // Redirect to the password gate, preserving intended destination
  const url = request.nextUrl.clone();
  url.pathname = "/gate";
  url.searchParams.set("from", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, robots.txt, sitemap.xml
     * - public assets
     */
    "/((?!_next/static|_next/image|favicon|robots|sitemap|.*\\.png|.*\\.jpg|.*\\.ico|.*\\.svg).*)",
  ],
};
