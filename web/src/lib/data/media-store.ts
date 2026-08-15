import path from "path";
import { randomUUID } from "crypto";
import { dataDir, ensureDir, readText, writeText, ensureFile, pathExists } from "./store-io";

const mediaFile = path.join(dataDir, "media.json");

export type MediaItem = {
  id: string;
  title: string;
  url: string;
  kind: "PHOTO" | "VIDEO" | "ALBUM" | "OTHER";
  source?: string; // photographer, guest, diy
  notes?: string;
  createdAt: string;
};

export type StoredMedia = {
  workspaceId: string;
  items: MediaItem[];
  updatedAt: string;
};

async function readAll(): Promise<Record<string, StoredMedia>> {
  await ensureDir();
  try {
    return JSON.parse(await readText(mediaFile));
  } catch {
    return {};
  }
}

async function writeAll(all: Record<string, StoredMedia>) {
  await writeText(mediaFile, JSON.stringify(all, null, 2));
}

export async function getMedia(workspaceId: string): Promise<StoredMedia> {
  const all = await readAll();
  if (!all[workspaceId]) {
    all[workspaceId] = {
      workspaceId,
      items: [],
      updatedAt: new Date().toISOString(),
    };
    await writeAll(all);
  }
  return all[workspaceId];
}

export async function addMediaItem(
  workspaceId: string,
  input: { title: string; url: string; kind?: MediaItem["kind"]; source?: string; notes?: string }
) {
  const all = await readAll();
  const current = await getMedia(workspaceId);
  const item: MediaItem = {
    id: randomUUID(),
    title: input.title,
    url: input.url,
    kind: input.kind || "ALBUM",
    source: input.source,
    notes: input.notes,
    createdAt: new Date().toISOString(),
  };
  all[workspaceId] = {
    ...current,
    items: [item, ...current.items],
    updatedAt: new Date().toISOString(),
  };
  await writeAll(all);
  return all[workspaceId];
}

export async function removeMediaItem(workspaceId: string, itemId: string) {
  const all = await readAll();
  const current = await getMedia(workspaceId);
  all[workspaceId] = {
    ...current,
    items: current.items.filter((i) => i.id !== itemId),
    updatedAt: new Date().toISOString(),
  };
  await writeAll(all);
  return all[workspaceId];
}
