import { NextResponse } from "next/server";
import { getSiteByToken } from "@/lib/data/site-store";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const token = String(body.token || "");
  const password = String(body.password || "");
  const site = await getSiteByToken(token);
  if (!site || !site.published) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!site.gate || site.gate !== password) {
    return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(`wos_gate_${token}`, "ok", {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
  return res;
}
