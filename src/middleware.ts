import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const GATE_PASSWORD = "redwhiteblue";
const GATE_COOKIE = "bedrock_gate";

// Routes that bypass the password gate entirely
const GATE_BYPASS = ["/gate", "/signin", "/signup", "/auth/callback"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Layer 1: Password gate ──────────────────────────────────────────────
  const isGateBypassed =
    GATE_BYPASS.some((p) => pathname === p || pathname.startsWith(p)) ||
    pathname.startsWith("/api/gate");

  if (!isGateBypassed) {
    const gateCookie = request.cookies.get(GATE_COOKIE);
    if (gateCookie?.value !== GATE_PASSWORD) {
      const url = request.nextUrl.clone();
      url.pathname = "/gate";
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }
  }

  // ── Layer 2: Supabase session refresh ───────────────────────────────────
  // Must refresh the session on every request so tokens don't silently expire.
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Calling getUser() triggers token refresh if needed
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon|robots|sitemap|.*\\.png|.*\\.jpg|.*\\.ico|.*\\.svg).*)",
  ],
};
