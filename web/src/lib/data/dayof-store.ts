import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

const dataDir = path.join(process.cwd(), ".data");
const dayOfFile = path.join(dataDir, "day-of.json");

export type CheckIn = {
  id: string;
  name: string;
  role: string;
  status: "NOT_STARTED" | "ON_THE_WAY" | "ARRIVED" | "READY" | "BLOCKED";
  note?: string;
};

export type DayOfUpdate = {
  id: string;
  body: string;
  createdAt: string;
};

export type StoredDayOf = {
  workspaceId: string;
  weatherNote?: string;
  emergencyContact?: string;
  checkIns: CheckIn[];
  updates: DayOfUpdate[];
  updatedAt: string;
};

async function readAll(): Promise<Record<string, StoredDayOf>> {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    return JSON.parse(await fs.readFile(dayOfFile, "utf8"));
  } catch {
    return {};
  }
}

async function writeAll(all: Record<string, StoredDayOf>) {
  await fs.writeFile(dayOfFile, JSON.stringify(all, null, 2), "utf8");
}

export async function getDayOf(workspaceId: string): Promise<StoredDayOf> {
  const all = await readAll();
  if (!all[workspaceId]) {
    all[workspaceId] = {
      workspaceId,
      checkIns: [
        { id: randomUUID(), name: "Photographer", role: "Vendor", status: "NOT_STARTED" },
        { id: randomUUID(), name: "Day-of coordinator", role: "Vendor", status: "NOT_STARTED" },
        { id: randomUUID(), name: "Maid of honor", role: "Party", status: "NOT_STARTED" },
      ],
      updates: [],
      updatedAt: new Date().toISOString(),
    };
    await writeAll(all);
  }
  return all[workspaceId];
}

export async function saveDayOf(workspaceId: string, patch: Partial<StoredDayOf>) {
  const all = await readAll();
  const current = await getDayOf(workspaceId);
  all[workspaceId] = { ...current, ...patch, updatedAt: new Date().toISOString() };
  await writeAll(all);
  return all[workspaceId];
}

export async function patchCheckIn(
  workspaceId: string,
  checkInId: string,
  patch: Partial<CheckIn>
) {
  const current = await getDayOf(workspaceId);
  const checkIns = current.checkIns.map((c) =>
    c.id === checkInId ? { ...c, ...patch } : c
  );
  return saveDayOf(workspaceId, { checkIns });
}

export async function addUpdate(workspaceId: string, body: string) {
  const current = await getDayOf(workspaceId);
  const updates = [
    { id: randomUUID(), body, createdAt: new Date().toISOString() },
    ...current.updates,
  ].slice(0, 50);
  return saveDayOf(workspaceId, { updates });
}
