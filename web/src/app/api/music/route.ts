import { NextResponse } from "next/server";
import { requireCoupleApi } from "@/lib/auth/access";
import { ensureDemoWorkspace } from "@/lib/data/workspace";
import {
  addDoNotPlayLine,
  addMustPlayTrack,
  addSongRequest,
  getMusic,
  saveMusic,
  setSongRequestStatus,
} from "@/lib/data/music-store";
import { spotifyConfigured } from "@/lib/integrations/spotify";
import { appleMusicConfigured } from "@/lib/integrations/apple-music";

function publicMusic(music: Awaited<ReturnType<typeof getMusic>>) {
  return {
    ...music,
    spotify: music.spotify
      ? {
          connected: true,
          displayName: music.spotify.displayName,
          playlistId: music.spotify.playlistId,
          playlistUrl: music.spotify.playlistUrl,
        }
      : { connected: false },
    appleMusic: music.appleMusic
      ? {
          connected: true,
          playlistId: music.appleMusic.playlistId,
          playlistUrl: music.appleMusic.playlistUrl,
        }
      : { connected: false },
  };
}

export async function GET() {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  const { workspace } = await ensureDemoWorkspace();
  const music = await getMusic(workspace.id);
  return NextResponse.json({
    music: publicMusic(music),
    spotifyConfigured: spotifyConfigured(),
    appleConfigured: appleMusicConfigured(),
  });
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
    return NextResponse.json({ music: publicMusic(music) });
  }
  if (body.action === "request_status") {
    const music = await setSongRequestStatus(workspace.id, String(body.id), body.status);
    return NextResponse.json({ music: publicMusic(music) });
  }
  if (body.action === "add_track") {
    const music = await addMustPlayTrack(workspace.id, {
      title: String(body.title || ""),
      artist: body.artist ? String(body.artist) : undefined,
      uri: body.uri ? String(body.uri) : undefined,
      url: body.url ? String(body.url) : undefined,
      appleId: body.appleId ? String(body.appleId) : undefined,
    });
    return NextResponse.json({ music: publicMusic(music) });
  }
  if (body.action === "ban_line") {
    const music = await addDoNotPlayLine(workspace.id, String(body.line || ""));
    return NextResponse.json({ music: publicMusic(music) });
  }

  const music = await saveMusic(workspace.id, {
    mustPlay: Array.isArray(body.mustPlay) ? body.mustPlay : undefined,
    doNotPlay: Array.isArray(body.doNotPlay) ? body.doNotPlay : undefined,
    moments: Array.isArray(body.moments) ? body.moments : undefined,
    notes: typeof body.notes === "string" ? body.notes : undefined,
  });
  return NextResponse.json({ music: publicMusic(music) });
}
