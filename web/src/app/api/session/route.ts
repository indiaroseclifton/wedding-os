import { NextResponse } from "next/server";
import { SESSION_COOKIE, type SessionUser } from "@/lib/auth/session";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const user: SessionUser = {
      userId: body.userId,
      name: body.name,
      email: body.email,
    };
    if (!user.userId || !user.name || !user.email) {
      return NextResponse.json({ error: "Missing user fields" }, { status: 400 });
    }

    const response = NextResponse.json({ ok: true, user });
    response.cookies.set(
      SESSION_COOKIE,
      encodeURIComponent(JSON.stringify(user)),
      {
        httpOnly: false,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      }
    );
    return response;
  } catch (error) {
    console.error("Failed to set session", error);
    return NextResponse.json({ error: "Failed to set session" }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  return response;
}
