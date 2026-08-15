import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

export const dataDir = path.join(process.cwd(), ".data");
export const decisionsFile = path.join(dataDir, "decisions.json");
export const invitesFile = path.join(dataDir, "invites.json");
export const membersFile = path.join(dataDir, "members.json");
export const tasksFile = path.join(dataDir, "tasks.json");
export const packagesFile = path.join(dataDir, "packages.json");
export const musicFile = path.join(dataDir, "music.json");
export const attireFile = path.join(dataDir, "attire.json");
export const pollsFile = path.join(dataDir, "polls.json");
export const dayOfFile = path.join(dataDir, "day-of.json");
export const eventsFile = path.join(dataDir, "events.json");
export const vendorsFile = path.join(dataDir, "vendors.json");
export const guestsFile = path.join(dataDir, "guests.json");
export const budgetFile = path.join(dataDir, "budget.json");
export const moodboardFile = path.join(dataDir, "moodboard.json");
export const notesFile = path.join(dataDir, "notes.json");
export const workspaceMetaFile = path.join(dataDir, "workspace-meta.json");
export const tablesFile = path.join(dataDir, "tables.json");

export type StoredDecision = {
  id: string;
  workspaceId: string;
  type: string;
  title: string;
  status: string;
  summary: string;
  payload: Record<string, unknown>;
  participantIds: string[];
  createdAt: string;
  updatedAt: string;
};

export type StoredInvite = {
  id: string;
  workspaceId: string;
  email?: string;
  token: string;
  role: "COUPLE" | "WEDDING_PARTY";
  status: "PENDING" | "ACCEPTED" | "EXPIRED";
  name?: string;
  createdAt: string;
  acceptedAt?: string;
};

export type StoredMember = {
  id: string;
  workspaceId: string;
  userId: string;
  name: string;
  email: string;
  role: "COUPLE" | "WEDDING_PARTY";
  status: "ACTIVE" | "PENDING";
  createdAt: string;
};

export async function ensureFile(file: string, fallback = "[]") {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    await fs.access(file);
  } catch {
    await fs.writeFile(file, fallback, "utf8");
  }
}

export async function readJson<T>(file: string): Promise<T[]> {
  await ensureFile(file);
  const raw = await fs.readFile(file, "utf8");
  return JSON.parse(raw || "[]") as T[];
}

export async function writeJson<T>(file: string, rows: T[]) {
  await ensureFile(file);
  await fs.writeFile(file, JSON.stringify(rows, null, 2), "utf8");
}

/** Wipe every file in `.data` (JSON stores + `.seeded`). Recreates the folder. */
export async function wipeDataDir() {
  await fs.mkdir(dataDir, { recursive: true });
  const entries = await fs.readdir(dataDir);
  await Promise.all(
    entries.map((name) =>
      fs.rm(path.join(dataDir, name), { recursive: true, force: true }),
    ),
  );
}

export { randomUUID };
