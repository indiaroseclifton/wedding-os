import { promises as fs } from "fs";
import path from "path";

const dataDir = path.join(process.cwd(), ".data");
const musicFile = path.join(dataDir, "music.json");

export type StoredMusic = {
  workspaceId: string;
  mustPlay: string[];
  doNotPlay: string[];
  moments: { label: string; song?: string }[];
  notes?: string;
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
      updatedAt: new Date().toISOString(),
    };
    await fs.writeFile(musicFile, JSON.stringify(all, null, 2), "utf8");
  }
  return all[workspaceId];
}

export async function saveMusic(workspaceId: string, patch: Partial<StoredMusic>) {
  const all = await readAll();
  const current = await getMusic(workspaceId);
  all[workspaceId] = { ...current, ...patch, updatedAt: new Date().toISOString() };
  await fs.writeFile(musicFile, JSON.stringify(all, null, 2), "utf8");
  return all[workspaceId];
}
