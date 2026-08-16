import { NextResponse } from "next/server";
import { requireCoupleApi } from "@/lib/auth/access";
import { searchTracks, spotifyConfigured } from "@/lib/integrations/spotify";

export async function GET(request: Request) {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  if (!spotifyConfigured()) {
    return NextResponse.json({ error: "Spotify isn’t connected on this project yet" }, { status: 400 });
  }
  const q = new URL(request.url).searchParams.get("q")?.trim() || "";
  if (q.length < 2) return NextResponse.json({ tracks: [] });
  try {
    const tracks = await searchTracks(q);
    return NextResponse.json({ tracks });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Search failed" }, { status: 502 });
  }
}
