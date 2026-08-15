import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/session";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  const expire = { path: "/", maxAge: 0 };
  response.cookies.set(SESSION_COOKIE, "", expire);
  response.cookies.set("authjs.session-token", "", expire);
  response.cookies.set("__Secure-authjs.session-token", "", {
    ...expire,
    secure: true,
  });
  return response;
}
