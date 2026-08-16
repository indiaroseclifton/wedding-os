import { NextResponse } from "next/server";
import { requireCoupleApi } from "@/lib/auth/access";
import { ensureDemoWorkspace } from "@/lib/data/workspace";
import { saveMusic } from "@/lib/data/music-store";

export async function POST() {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  const { workspace } = await ensureDemoWorkspace();
  await saveMusic(workspace.id, { appleMusic: undefined });
  return NextResponse.json({ ok: true });
}
