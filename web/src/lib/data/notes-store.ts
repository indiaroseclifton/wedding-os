import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { dataDir } from "./store-io";

const notesFile = path.join(dataDir, "notes.json");

export type NoteEntry = {
  id: string;
  body: string;
  authorName?: string;
  createdAt: string;
};

export type StoredNotes = {
  workspaceId: string;
  pinned: string;
  entries: NoteEntry[];
  updatedAt: string;
};

async function readAll(): Promise<Record<string, StoredNotes>> {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    return JSON.parse(await fs.readFile(notesFile, "utf8"));
  } catch {
    return {};
  }
}

export async function getNotes(workspaceId: string): Promise<StoredNotes> {
  const all = await readAll();
  if (!all[workspaceId]) {
    all[workspaceId] = {
      workspaceId,
      pinned: "",
      entries: [],
      updatedAt: new Date().toISOString(),
    };
    await fs.writeFile(notesFile, JSON.stringify(all, null, 2), "utf8");
  }
  return all[workspaceId];
}

export async function addNote(
  workspaceId: string,
  body: string,
  authorName?: string
) {
  const all = await readAll();
  const current = await getNotes(workspaceId);
  const entry: NoteEntry = {
    id: randomUUID(),
    body,
    authorName,
    createdAt: new Date().toISOString(),
  };
  all[workspaceId] = {
    ...current,
    entries: [entry, ...current.entries],
    updatedAt: new Date().toISOString(),
  };
  await fs.writeFile(notesFile, JSON.stringify(all, null, 2), "utf8");
  return all[workspaceId];
}

export async function savePinned(workspaceId: string, pinned: string) {
  const all = await readAll();
  const current = await getNotes(workspaceId);
  all[workspaceId] = { ...current, pinned, updatedAt: new Date().toISOString() };
  await fs.writeFile(notesFile, JSON.stringify(all, null, 2), "utf8");
  return all[workspaceId];
}
