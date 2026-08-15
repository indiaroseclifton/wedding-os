import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

const dataDir = path.join(process.cwd(), ".data");
const attireFile = path.join(dataDir, "attire.json");

export type AttireMember = {
  id: string;
  name: string;
  role: string;
  color?: string;
  size?: string;
  dressLink?: string;
  notes?: string;
  status: "NOT_STARTED" | "ORDERED" | "ALTERING" | "READY";
};

export type StoredAttire = {
  workspaceId: string;
  paletteNotes?: string;
  members: AttireMember[];
  updatedAt: string;
};

async function readAll(): Promise<Record<string, StoredAttire>> {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    return JSON.parse(await fs.readFile(attireFile, "utf8"));
  } catch {
    return {};
  }
}

async function writeAll(all: Record<string, StoredAttire>) {
  await fs.writeFile(attireFile, JSON.stringify(all, null, 2), "utf8");
}

export async function getAttire(workspaceId: string): Promise<StoredAttire> {
  const all = await readAll();
  if (!all[workspaceId]) {
    all[workspaceId] = {
      workspaceId,
      paletteNotes: "",
      members: [],
      updatedAt: new Date().toISOString(),
    };
    await writeAll(all);
  }
  return all[workspaceId];
}

export async function saveAttire(workspaceId: string, patch: Partial<StoredAttire>) {
  const all = await readAll();
  const current = await getAttire(workspaceId);
  all[workspaceId] = { ...current, ...patch, updatedAt: new Date().toISOString() };
  await writeAll(all);
  return all[workspaceId];
}

export async function addAttireMember(
  workspaceId: string,
  input: { name: string; role: string; color?: string; dressLink?: string }
) {
  const current = await getAttire(workspaceId);
  const member: AttireMember = {
    id: randomUUID(),
    name: input.name,
    role: input.role,
    color: input.color,
    dressLink: input.dressLink,
    status: "NOT_STARTED",
  };
  return saveAttire(workspaceId, { members: [...current.members, member] });
}

export async function updateAttireMember(
  workspaceId: string,
  memberId: string,
  patch: Partial<AttireMember>
) {
  const current = await getAttire(workspaceId);
  const members = current.members.map((m) =>
    m.id === memberId ? { ...m, ...patch } : m
  );
  return saveAttire(workspaceId, { members });
}
