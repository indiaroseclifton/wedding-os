import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

const dataDir = path.join(process.cwd(), ".data");
const eventsFile = path.join(dataDir, "events.json");

export type SubEvent = {
  id: string;
  workspaceId: string;
  name: string;
  type: string;
  date?: string;
  location?: string;
  budgetCap?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

const DEFAULT_TYPES = [
  "Engagement party",
  "Bridal shower",
  "Bachelor / bachelorette",
  "Rehearsal dinner",
  "Welcome drinks",
  "Wedding day",
  "After-party",
  "Farewell brunch",
  "Other",
];

export { DEFAULT_TYPES };

async function readJson(): Promise<SubEvent[]> {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    return JSON.parse(await fs.readFile(eventsFile, "utf8"));
  } catch {
    return [];
  }
}

async function writeJson(rows: SubEvent[]) {
  await fs.writeFile(eventsFile, JSON.stringify(rows, null, 2), "utf8");
}

export async function listEvents(workspaceId: string) {
  return (await readJson())
    .filter((e) => e.workspaceId === workspaceId)
    .sort((a, b) => (a.date || "").localeCompare(b.date || ""));
}

export async function getEvent(id: string) {
  return (await readJson()).find((e) => e.id === id) ?? null;
}

export async function createEvent(input: {
  workspaceId: string;
  name: string;
  type: string;
  date?: string;
  location?: string;
  budgetCap?: number;
  notes?: string;
}) {
  const rows = await readJson();
  const now = new Date().toISOString();
  const row: SubEvent = {
    id: randomUUID(),
    workspaceId: input.workspaceId,
    name: input.name,
    type: input.type,
    date: input.date,
    location: input.location,
    budgetCap: input.budgetCap,
    notes: input.notes,
    createdAt: now,
    updatedAt: now,
  };
  rows.push(row);
  await writeJson(rows);
  return row;
}

export async function updateEvent(id: string, patch: Partial<SubEvent>) {
  const rows = await readJson();
  const row = rows.find((e) => e.id === id);
  if (!row) return null;
  Object.assign(row, patch, { updatedAt: new Date().toISOString() });
  await writeJson(rows);
  return row;
}

export async function deleteEvent(id: string) {
  const rows = await readJson();
  const next = rows.filter((e) => e.id !== id);
  if (next.length === rows.length) return false;
  await writeJson(next);
  return true;
}
