import { NextRequest, NextResponse } from "next/server";

const PASSWORD = "redwhiteblue";
const COOKIE_NAME = "bedrock_gate";

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
    });
    return response;
  }

  return NextResponse.json({ success: false, error: "Incorrect password" }, { status: 401 });
}
