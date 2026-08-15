import { NextResponse } from "next/server";
import { requireCoupleApi } from "@/lib/auth/access";
import { ensureDemoWorkspace } from "@/lib/data/workspace";
import { getMusic, saveMusic } from "@/lib/data/music-store";

export async function GET() {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  const { workspace } = await ensureDemoWorkspace();
  const music = await getMusic(workspace.id);
  return NextResponse.json({ music });
}

export async function POST(request: Request) {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  const body = await request.json();
  const { workspace } = await ensureDemoWorkspace();
  const music = await saveMusic(workspace.id, {
    mustPlay: Array.isArray(body.mustPlay) ? body.mustPlay : undefined,
    doNotPlay: Array.isArray(body.doNotPlay) ? body.doNotPlay : undefined,
    moments: Array.isArray(body.moments) ? body.moments : undefined,
    notes: typeof body.notes === "string" ? body.notes : undefined,
  });
  return NextResponse.json({ music });
}
