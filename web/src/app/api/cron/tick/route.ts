import { NextResponse } from "next/server";
import { runTick } from "@/lib/remind/tick";
import { requestOrigin } from "@/lib/email/send";

function allowed(request: Request) {
  const secret = process.env.CRON_SECRET || "";
  const auth = request.headers.get("authorization") || "";
  if (secret && auth === `Bearer ${secret}`) return true;
  if (request.headers.get("user-agent")?.includes("vercel-cron")) return true;
  return false;
}

export async function GET(request: Request) {
  if (!allowed(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const result = await runTick(requestOrigin(request));
  return NextResponse.json({ ok: true, ...result });
}
