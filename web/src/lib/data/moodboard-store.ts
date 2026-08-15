import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { dataDir } from "./store-io";

const moodFile = path.join(dataDir, "moodboard.json");

export type MoodItem = {
  id: string;
  title: string;
  url?: string;
  notes?: string;
  tag?: string;
  createdAt: string;
};

export type StoredMoodboard = {
  workspaceId: string;
  title: string;
  items: MoodItem[];
  updatedAt: string;
};

async function readAll(): Promise<Record<string, StoredMoodboard>> {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    return JSON.parse(await fs.readFile(moodFile, "utf8"));
  } catch {
    return {};
  }
}

async function writeAll(all: Record<string, StoredMoodboard>) {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(moodFile, JSON.stringify(all, null, 2), "utf8");
}

export async function getMoodboard(workspaceId: string): Promise<StoredMoodboard> {
  const all = await readAll();
  if (!all[workspaceId]) {
    all[workspaceId] = {
      workspaceId,
      title: "Inspiration & DIY",
      items: [],
      updatedAt: new Date().toISOString(),
    };
    await writeAll(all);
  }
  return all[workspaceId];
}

export async function addMoodItem(
  workspaceId: string,
  input: { title: string; url?: string; notes?: string; tag?: string }
) {
  const all = await readAll();
  const board = await getMoodboard(workspaceId);
  const item: MoodItem = {
    id: randomUUID(),
    title: input.title,
    url: input.url,
    notes: input.notes,
    tag: input.tag,
    createdAt: new Date().toISOString(),
  };
  all[workspaceId] = {
    ...board,
    items: [item, ...board.items],
    updatedAt: new Date().toISOString(),
  };
  await writeAll(all);
  return all[workspaceId];
}

export async function removeMoodItem(workspaceId: string, itemId: string) {
  const all = await readAll();
  const board = await getMoodboard(workspaceId);
  all[workspaceId] = {
    ...board,
    items: board.items.filter((i) => i.id !== itemId),
    updatedAt: new Date().toISOString(),
  };
  await writeAll(all);
  return all[workspaceId];
}
