import { NextResponse } from "next/server";
import { requireCoupleApi } from "@/lib/auth/access";
import { ensureDemoWorkspace } from "@/lib/data/workspace";
import { patchChecklistItem } from "@/lib/data/checklist-store";
import { dismissWeekItem } from "@/lib/data/week-dismiss-store";

export async function POST(request: Request) {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  const body = await request.json().catch(() => ({}));
  const id = String(body.id || "");
  if (!id) return NextResponse.json({ error: "Missing item" }, { status: 400 });
  const { workspace } = await ensureDemoWorkspace();
  if (id.startsWith("check-")) {
    await patchChecklistItem(workspace.id, id.slice(6), { done: true });
  } else {
    await dismissWeekItem(workspace.id, id);
  }
  return NextResponse.json({ ok: true });
}
