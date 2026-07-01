import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const GATE_PASSWORD = "redwhiteblue";
const GATE_COOKIE = "bedrock_gate";

// Routes that bypass the password gate entirely
const GATE_BYPASS = ["/gate", "/signin", "/signup", "/forgot-password", "/reset-password", "/auth/callback", "/api/inngest"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Layer 1: Password gate ──────────────────────────────────────────────
  const isGateBypassed =
    GATE_BYPASS.some((p) => pathname === p || pathname.startsWith(p)) ||
    pathname.startsWith("/api/gate");

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

  // getSession() reads the JWT from cookies without a network round-trip —
  // getUser() makes a server call that can fail silently in middleware.
  // For the gate bypass we only need to know a session exists, not verify it.
  const { data: { session } } = await supabase.auth.getSession();

  // Still call getUser() for the token refresh side-effect on authed requests.
  if (session) await supabase.auth.getUser();

  if (!isGateBypassed && !session) {
    const gateCookie = request.cookies.get(GATE_COOKIE);
    if (gateCookie?.value !== GATE_PASSWORD) {
      const url = request.nextUrl.clone();
      url.pathname = "/gate";
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon|robots|sitemap|.*\\.png|.*\\.jpg|.*\\.ico|.*\\.svg).*)",
  ],
};
