import path from "path";
import { dataDir, ensureDir, readText, writeText } from "./store-io";

const dietFile = path.join(dataDir, "dietary.json");

export type StoredDietary = {
  workspaceId: string;
  packOut?: string;
  fridge?: string;
  leftoverTo?: string;
  donate?: string;
  notes?: string;
  updatedAt: string;
};

async function readAll(): Promise<Record<string, StoredDietary>> {
  await ensureDir();
  try {
    return JSON.parse(await readText(dietFile));
  } catch {
    return {};
  }
}

async function writeAll(all: Record<string, StoredDietary>) {
  await writeText(dietFile, JSON.stringify(all, null, 2));
}

export async function getDietary(workspaceId: string): Promise<StoredDietary> {
  const all = await readAll();
  if (!all[workspaceId]) {
    all[workspaceId] = { workspaceId, updatedAt: new Date().toISOString() };
    await writeAll(all);
  }
  return all[workspaceId];
}

export async function saveDietary(workspaceId: string, patch: Partial<StoredDietary>) {
  const all = await readAll();
  const current = await getDietary(workspaceId);
  all[workspaceId] = { ...current, ...patch, workspaceId, updatedAt: new Date().toISOString() };
  await writeAll(all);
  return all[workspaceId];
}
