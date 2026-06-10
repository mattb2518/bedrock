import { NextRequest, NextResponse } from "next/server";

const PASSWORD = "redwhiteblue";
const COOKIE_NAME = "bedrock_gate";

// Scope the cookie to the registrable domain so it survives apex ↔ www (and
// any other subdomain) redirects. Host-only cookies are dropped on redirect to
// a different host, which bounces the user back to the gate. Left undefined for
// localhost / vercel preview hosts so it falls back to host-only there.
function cookieDomain(request: NextRequest): string | undefined {
  const host = (request.headers.get("host") ?? "").split(":")[0];
  if (host.endsWith("bedrock.guide")) return ".bedrock.guide";
  return undefined;
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { password, from } = body;

  if (password === PASSWORD) {
    const response = NextResponse.json({ success: true });
    response.cookies.set(COOKIE_NAME, PASSWORD, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
      domain: cookieDomain(request),
    });
    return response;
  }

  return NextResponse.json({ success: false, error: "Incorrect password" }, { status: 401 });
}
