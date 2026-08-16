import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { requireCoupleApi } from "@/lib/auth/access";
import { ensureDemoWorkspace } from "@/lib/data/workspace";
import { getSpeeches, upsertSpeech } from "@/lib/data/speech-store";

export async function GET() {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "Sign in" }, { status: 401 });
  const { workspace } = await ensureDemoWorkspace();
  return NextResponse.json({ speeches: await getSpeeches(workspace.id) });
}

export async function POST(request: Request) {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "Sign in" }, { status: 401 });
  const couple = await requireCoupleApi();
  const body = await request.json();
  const { workspace } = await ensureDemoWorkspace();
  const key = couple.ok ? String(body.memberKey || session.name) : session.name;
  const speeches = await upsertSpeech(workspace.id, {
    memberKey: key.toLowerCase(),
    name: String(body.name || session.name).slice(0, 80),
    role: String(body.role || "Speech").slice(0, 40),
    status: body.status === "ready" || body.status === "drafting" ? body.status : "not_started",
    due: String(body.due || "").slice(0, 20) || undefined,
    notes: String(body.notes || "").slice(0, 2000) || undefined,
  });
  return NextResponse.json({ speeches });
}
