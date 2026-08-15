import { NextResponse } from "next/server";
import { acceptInviteToken, findInviteByToken } from "@/lib/data/workspace";
import { SESSION_COOKIE, type SessionUser } from "@/lib/auth/session";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = String(body.token || "");
    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }
    const existing = await findInviteByToken(token);
    if (!existing || existing.status !== "PENDING") {
      return NextResponse.json({ error: "Invite not available" }, { status: 400 });
    }
    const result = await acceptInviteToken(token, { name: body.name });
    if (!result.ok || !result.member) {
      return NextResponse.json({ error: "Could not accept" }, { status: 400 });
    }
    const user: SessionUser = {
      userId: result.member.userId,
      name: result.member.name,
      email: result.member.email,
    };
    const response = NextResponse.json({ ok: true, user, role: result.member.role });
    response.cookies.set(SESSION_COOKIE, encodeURIComponent(JSON.stringify(user)), {
      httpOnly: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
