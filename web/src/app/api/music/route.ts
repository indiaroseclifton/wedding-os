import { NextResponse } from "next/server";
import { requireCoupleApi } from "@/lib/auth/access";
import { ensureDemoWorkspace } from "@/lib/data/workspace";
import {
  addSongRequest,
  getMusic,
  saveMusic,
  setSongRequestStatus,
} from "@/lib/data/music-store";

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

  if (body.action === "request") {
    const music = await addSongRequest(workspace.id, {
      song: String(body.song || ""),
      from: body.from ? String(body.from) : undefined,
    });
    return NextResponse.json({ music });
  }
  if (body.action === "request_status") {
    const music = await setSongRequestStatus(
      workspace.id,
      String(body.id),
      body.status
    );
    return NextResponse.json({ music });
  }

  const music = await saveMusic(workspace.id, {
    mustPlay: Array.isArray(body.mustPlay) ? body.mustPlay : undefined,
    doNotPlay: Array.isArray(body.doNotPlay) ? body.doNotPlay : undefined,
    moments: Array.isArray(body.moments) ? body.moments : undefined,
    notes: typeof body.notes === "string" ? body.notes : undefined,
  });
  return NextResponse.json({ music });
}
