import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { dataDir } from "./store-io";

const musicFile = path.join(dataDir, "music.json");

export type SongRequest = {
  id: string;
  song: string;
  from?: string;
  status: "PENDING" | "ACCEPTED" | "DECLINED";
  createdAt: string;
};

export type StoredMusic = {
  workspaceId: string;
  mustPlay: string[];
  doNotPlay: string[];
  moments: { label: string; song?: string }[];
  notes?: string;
  requests: SongRequest[];
  updatedAt: string;
};

async function readAll(): Promise<Record<string, StoredMusic>> {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    return JSON.parse(await fs.readFile(musicFile, "utf8"));
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
    await fs.writeFile(musicFile, JSON.stringify(all, null, 2), "utf8");
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
  await fs.writeFile(musicFile, JSON.stringify(all, null, 2), "utf8");
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
