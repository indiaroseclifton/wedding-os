import { NextResponse } from "next/server";
import { getSendByToken, markSendReceived } from "@/lib/data/sends-store";

export async function POST(
  request: Request,
  context: { params: Promise<{ token: string }> }
) {
  const { token } = await context.params;
  const existing = await getSendByToken(token);
  if (!existing || existing.status !== "SENT") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const body = await request.json().catch(() => ({}));
  const name = typeof body.name === "string" ? body.name : "";
  const row = await markSendReceived(token, name);
  return NextResponse.json({ ok: true, receivedAt: row?.receivedAt, receivedName: row?.receivedName });
}
