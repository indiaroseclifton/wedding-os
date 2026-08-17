import { NextResponse } from "next/server";
import { requireCoupleApi } from "@/lib/auth/access";
import { ensureDemoWorkspace, loadWorkspaceMeta } from "@/lib/data/workspace";
import { getMusic, lineForTrack, saveMusic } from "@/lib/data/music-store";
import {
  refreshAccess,
  searchTracks,
  me,
  upsertMustPlayPlaylist,
} from "@/lib/integrations/spotify";

export async function POST() {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  const { workspace } = await ensureDemoWorkspace();
  const music = await getMusic(workspace.id);
  if (!music.spotify?.refreshToken) {
    return NextResponse.json({ error: "Connect Spotify first" }, { status: 400 });
  }
  if (!music.mustPlay.length) {
    return NextResponse.json({ error: "Add must-play songs first" }, { status: 400 });
  }

  try {
    const tokens = await refreshAccess(music.spotify.refreshToken);
    const profile = await me(tokens.access_token);
    const known = new Map(
      (music.mustPlayTracks || []).map((t) => [lineForTrack(t).toLowerCase(), t.uri || ""])
    );
    const uris: string[] = [];
    for (const line of music.mustPlay) {
      const have = known.get(line.toLowerCase());
      if (have) {
        uris.push(have);
        continue;
      }
      const hits = await searchTracks(line, tokens.access_token);
      if (hits[0]?.uri) uris.push(hits[0].uri);
    }
    if (!uris.length) {
      return NextResponse.json({ error: "Spotify couldn’t match those titles" }, { status: 400 });
    }
    const meta = await loadWorkspaceMeta(workspace.id, workspace.name);
    const playlist = await upsertMustPlayPlaylist({
      accessToken: tokens.access_token,
      userId: profile.id,
      name: `${meta.name || workspace.name} — Must play`,
      description: "Exported from Vowfolk for the DJ.",
      uris,
      playlistId: music.spotify.playlistId,
    });
    const next = await saveMusic(workspace.id, {
      spotify: {
        ...music.spotify,
        refreshToken: tokens.refresh_token || music.spotify.refreshToken,
        displayName: profile.display_name || music.spotify.displayName,
        playlistId: playlist.playlistId,
        playlistUrl: playlist.playlistUrl,
      },
    });
    return NextResponse.json({
      playlistUrl: playlist.playlistUrl,
      tracks: uris.length,
      music: {
        ...next,
        spotify: {
          connected: true,
          displayName: next.spotify?.displayName,
          playlistUrl: next.spotify?.playlistUrl,
        },
      },
    });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Export failed" }, { status: 502 });
  }
}
