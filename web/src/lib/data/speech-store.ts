import path from "path";
import { dataDir, ensureDir, readText, writeText } from "./store-io";

const speechFile = path.join(dataDir, "speeches.json");

export type SpeechRow = {
  memberKey: string;
  name: string;
  role: string;
  status: "not_started" | "drafting" | "ready";
  due?: string;
  notes?: string;
};

export type StoredSpeeches = {
  workspaceId: string;
  rows: SpeechRow[];
  updatedAt: string;
};

async function readAll(): Promise<Record<string, StoredSpeeches>> {
  await ensureDir();
  try {
    return JSON.parse(await readText(speechFile));
  } catch {
    return {};
  }
}

async function writeAll(all: Record<string, StoredSpeeches>) {
  await writeText(speechFile, JSON.stringify(all, null, 2));
}

export async function getSpeeches(workspaceId: string): Promise<StoredSpeeches> {
  const all = await readAll();
  if (!all[workspaceId]) {
    all[workspaceId] = { workspaceId, rows: [], updatedAt: new Date().toISOString() };
    await writeAll(all);
  }
  return all[workspaceId];
}

export async function upsertSpeech(workspaceId: string, row: SpeechRow) {
  const all = await readAll();
  const current = await getSpeeches(workspaceId);
  const next = current.rows.filter((r) => r.memberKey !== row.memberKey);
  next.push(row);
  all[workspaceId] = { workspaceId, rows: next, updatedAt: new Date().toISOString() };
  await writeAll(all);
  return all[workspaceId];
}
