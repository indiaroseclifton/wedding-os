import path from "path";
import { randomUUID } from "crypto";
import { dataDir, ensureDir, readText, writeText, ensureFile, pathExists } from "./store-io";

const musicFile = path.join(dataDir, "music.json");

export type SongRequest = {
  id: string;
  song: string;
  from?: string;
  status: "PENDING" | "ACCEPTED" | "DECLINED";
  createdAt: string;
};

export type TrackRef = {
  title: string;
  artist?: string;
  uri?: string;
  url?: string;
};

export type SpotifyLink = {
  refreshToken: string;
  displayName?: string;
  playlistId?: string;
  playlistUrl?: string;
  connectedAt?: string;
};

export type StoredMusic = {
  workspaceId: string;
  mustPlay: string[];
  doNotPlay: string[];
  mustPlayTracks?: TrackRef[];
  moments: { label: string; song?: string }[];
  notes?: string;
  requests: SongRequest[];
  spotify?: SpotifyLink;
  updatedAt: string;
};

async function readAll(): Promise<Record<string, StoredMusic>> {
  await ensureDir();
  try {
    return JSON.parse(await readText(musicFile));
  } catch {
    return {};
  }
}

function normalize(m: StoredMusic): StoredMusic {
  return { ...m, requests: m.requests || [] };
}

export async function getMusic(workspaceId: string): Promise<StoredMusic> {
  const all = await readAll();
  if (!all[workspaceId]) {
    all[workspaceId] = {
      workspaceId,
      mustPlay: [],
      doNotPlay: [],
      moments: [
        { label: "Processional" },
        { label: "First dance" },
        { label: "Last song" },
      ],
      requests: [],
      updatedAt: new Date().toISOString(),
    };
    await writeText(musicFile, JSON.stringify(all, null, 2));
  }
  return normalize(all[workspaceId]);
}

export async function saveMusic(workspaceId: string, patch: Partial<StoredMusic>) {
  const all = await readAll();
  const current = await getMusic(workspaceId);
  all[workspaceId] = {
    ...current,
    ...patch,
    requests: patch.requests ?? current.requests,
    updatedAt: new Date().toISOString(),
  };
  await writeText(musicFile, JSON.stringify(all, null, 2));
  return normalize(all[workspaceId]);
}

export async function addSongRequest(
  workspaceId: string,
  input: { song: string; from?: string }
) {
  const music = await getMusic(workspaceId);
  const req: SongRequest = {
    id: randomUUID(),
    song: input.song.trim(),
    from: input.from?.trim(),
    status: "PENDING",
    createdAt: new Date().toISOString(),
  };
  return saveMusic(workspaceId, { requests: [req, ...music.requests] });
}

export async function setSongRequestStatus(
  workspaceId: string,
  requestId: string,
  status: SongRequest["status"]
) {
  const music = await getMusic(workspaceId);
  const requests = music.requests.map((r) =>
    r.id === requestId ? { ...r, status } : r
  );
  let mustPlay = music.mustPlay;
  if (status === "ACCEPTED") {
    const song = music.requests.find((r) => r.id === requestId)?.song;
    if (song && !mustPlay.includes(song)) mustPlay = [...mustPlay, song];
  }
  return saveMusic(workspaceId, { requests, mustPlay });
}

export function lineForTrack(t: TrackRef) {
  return t.artist ? `${t.title} — ${t.artist}` : t.title;
}

export async function addMustPlayTrack(workspaceId: string, track: TrackRef) {
  const music = await getMusic(workspaceId);
  const line = lineForTrack(track);
  if (music.mustPlay.includes(line)) return music;
  return saveMusic(workspaceId, {
    mustPlay: [...music.mustPlay, line],
    mustPlayTracks: [...(music.mustPlayTracks || []), track],
  });
}

export async function addDoNotPlayLine(workspaceId: string, line: string) {
  const music = await getMusic(workspaceId);
  const text = line.trim();
  if (!text || music.doNotPlay.includes(text)) return music;
  return saveMusic(workspaceId, { doNotPlay: [...music.doNotPlay, text] });
}
