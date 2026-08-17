import { NextResponse } from "next/server";
import { requireCoupleApi } from "@/lib/auth/access";
import { ensureDemoWorkspace, loadWorkspaceMeta } from "@/lib/data/workspace";
import { getMusic, lineForTrack, saveMusic } from "@/lib/data/music-store";
import { createApplePlaylist, searchAppleSongs } from "@/lib/integrations/apple-music";

export async function POST() {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  const { workspace } = await ensureDemoWorkspace();
  const music = await getMusic(workspace.id);
  if (!music.appleMusic?.userToken) {
    return NextResponse.json({ error: "Connect Apple Music first" }, { status: 400 });
  }
  if (!music.mustPlay.length) {
    return NextResponse.json({ error: "Add must-play songs first" }, { status: 400 });
  }

  try {
    const known = new Map(
      (music.mustPlayTracks || [])
        .filter((t) => t.appleId)
        .map((t) => [lineForTrack(t).toLowerCase(), t.appleId as string])
    );
    const ids: string[] = [];
    const storefront = music.appleMusic.storefront;
    for (const line of music.mustPlay) {
      const have = known.get(line.toLowerCase());
      if (have) {
        ids.push(have);
        continue;
      }
      const hits = await searchAppleSongs(line, storefront);
      if (hits[0]?.appleId) ids.push(hits[0].appleId);
    }
    if (!ids.length) {
      return NextResponse.json({ error: "Apple Music couldn’t match those titles" }, { status: 400 });
    }
    const meta = await loadWorkspaceMeta(workspace.id, workspace.name);
    const playlist = await createApplePlaylist({
      userToken: music.appleMusic.userToken,
      name: `${meta.name || workspace.name} — Must play`,
      description: "Exported from Vowfolk for the DJ.",
      songIds: ids,
    });
    await saveMusic(workspace.id, {
      appleMusic: {
        ...music.appleMusic,
        playlistId: playlist.playlistId,
        playlistUrl: playlist.playlistUrl,
      },
    });
    return NextResponse.json({ playlistUrl: playlist.playlistUrl, tracks: ids.length });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Export failed" }, { status: 502 });
  }
}
