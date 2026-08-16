import { NextResponse } from "next/server";
import { requireCoupleApi } from "@/lib/auth/access";
import { appleMusicConfigured, searchAppleSongs } from "@/lib/integrations/apple-music";

export async function GET(request: Request) {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  if (!appleMusicConfigured()) {
    return NextResponse.json({ error: "Apple Music isn’t set up on this project yet" }, { status: 400 });
  }
  const q = new URL(request.url).searchParams.get("q")?.trim() || "";
  if (q.length < 2) return NextResponse.json({ tracks: [] });
  try {
    const tracks = await searchAppleSongs(q);
    return NextResponse.json({
      tracks: tracks.map((t) => ({
        title: t.title,
        artist: t.artist,
        appleId: t.appleId,
        url: t.url,
        previewUrl: t.previewUrl,
        source: "apple",
      })),
    });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Search failed" }, { status: 502 });
  }
}
