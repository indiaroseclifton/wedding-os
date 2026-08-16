import { promises as fs } from "fs";
import path from "path";
import { tmpdir } from "os";
import { randomUUID } from "crypto";
import { getDataBackend } from "./repository/types";

function resolveDataDir() {
  if (process.env.DATA_DIR) return process.env.DATA_DIR;
  // Vercel / Lambda: the app bundle is read-only. Only /tmp is writable.
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return path.join(tmpdir(), "wedding-os-data");
  }
  return path.join(process.cwd(), ".data");
}

export const dataDir = resolveDataDir();
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

function storeKey(file: string) {
  return path.basename(file);
}

export function usePrismaStore() {
  return getDataBackend() === "prisma" && Boolean(process.env.DATABASE_URL);
}

async function getPrisma() {
  const { prisma } = await import("./prisma");
  return prisma;
}

export async function ensureDir() {
  if (usePrismaStore()) return;
  await fs.mkdir(dataDir, { recursive: true });
}

export async function pathExists(file: string) {
  if (usePrismaStore()) {
    const prisma = await getPrisma();
    const row = await prisma.jsonStore.findUnique({ where: { key: storeKey(file) } });
    return Boolean(row);
  }
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

export async function readText(file: string): Promise<string> {
  if (usePrismaStore()) {
    const prisma = await getPrisma();
    const row = await prisma.jsonStore.findUnique({ where: { key: storeKey(file) } });
    if (!row) {
      const err = new Error(`ENOENT: ${storeKey(file)}`) as NodeJS.ErrnoException;
      err.code = "ENOENT";
      throw err;
    }
    const payload = row.payload as unknown;
    if (payload && typeof payload === "object" && !Array.isArray(payload) && "text" in payload) {
      const text = (payload as { text?: unknown }).text;
      if (typeof text === "string") return text;
    }
    return JSON.stringify(payload);
  }
  return fs.readFile(file, "utf8");
}

export async function writeText(file: string, contents: string) {
  if (usePrismaStore()) {
    const prisma = await getPrisma();
    let payload: unknown;
    try {
      payload = JSON.parse(contents);
    } catch {
      payload = { text: contents };
    }
    const key = storeKey(file);
    await prisma.jsonStore.upsert({
      where: { key },
      create: { key, payload: payload as object },
      update: { payload: payload as object },
    });
    return;
  }
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, contents, "utf8");
}

export async function ensureFile(file: string, fallback = "[]") {
  if (await pathExists(file)) return;
  await writeText(file, fallback);
}

export async function readJson<T>(file: string): Promise<T[]> {
  await ensureFile(file, "[]");
  const raw = await readText(file);
  return JSON.parse(raw || "[]") as T[];
}

export async function writeJson<T>(file: string, rows: T[]) {
  await writeText(file, JSON.stringify(rows, null, 2));
}

/** Wipe every file in `.data` (JSON stores + `.seeded`). Recreates the folder. */
export async function wipeDataDir() {
  if (usePrismaStore()) {
    const prisma = await getPrisma();
    await prisma.jsonStore.deleteMany();
    return;
  }
  await fs.mkdir(/*turbopackIgnore: true*/ dataDir, { recursive: true });
  const entries = await fs.readdir(/*turbopackIgnore: true*/ dataDir);
  await Promise.all(
    entries.map((name) =>
      fs.rm(/*turbopackIgnore: true*/ path.join(/*turbopackIgnore: true*/ dataDir, name), {
        recursive: true,
        force: true,
      }),
    ),
  );
}

export { randomUUID };
