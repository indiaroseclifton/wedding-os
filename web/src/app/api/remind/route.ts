import { NextResponse } from "next/server";
import { requireCoupleApi } from "@/lib/auth/access";
import { ensureDemoWorkspace } from "@/lib/data/workspace";
import { getRemind, saveRemind } from "@/lib/data/remind-store";
import { runTick } from "@/lib/remind/tick";
import { requestOrigin } from "@/lib/email/send";

export async function GET() {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  const { workspace } = await ensureDemoWorkspace();
  const arms = await getRemind(workspace.id);
  return NextResponse.json({ arms });
}

export async function PATCH(request: Request) {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  const { workspace } = await ensureDemoWorkspace();
  const body = await request.json().catch(() => ({}));
  const patch: Record<string, unknown> = {};
  if (typeof body.digest === "boolean") patch.digest = body.digest;
  if (typeof body.autoRsvp === "boolean") patch.autoRsvp = body.autoRsvp;
  if (typeof body.autoAddress === "boolean") patch.autoAddress = body.autoAddress;
  if (typeof body.digestTo === "string") {
    patch.digestTo = body.digestTo.trim().slice(0, 160) || undefined;
  }
  const arms = await saveRemind(workspace.id, patch);
  return NextResponse.json({ arms });
}

export async function POST(request: Request) {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  const result = await runTick(requestOrigin(request));
  return NextResponse.json({ ok: true, ...result });
}
