import path from "path";
import { randomUUID } from "crypto";
import { dataDir, ensureDir, readText, writeText } from "./store-io";

const eventsFile = path.join(dataDir, "events.json");

export type InviteMode = "everyone" | "invited";

export type SubEvent = {
  id: string;
  workspaceId: string;
  name: string;
  type: string;
  date?: string;
  location?: string;
  budgetCap?: number;
  expectedGuests?: number;
  notes?: string;
  rsvpEnabled: boolean;
  askMeal: boolean;
  inviteMode: InviteMode;
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

export function isWeddingDayEvent(event: Pick<SubEvent, "type">) {
  return event.type === "Wedding day";
}

function normalize(row: SubEvent): SubEvent {
  return {
    ...row,
    rsvpEnabled: Boolean(row.rsvpEnabled) && !isWeddingDayEvent(row),
    askMeal: Boolean(row.askMeal),
    inviteMode: row.inviteMode === "everyone" ? "everyone" : "invited",
  };
}

async function readJson(): Promise<SubEvent[]> {
  await ensureDir();
  try {
    const rows = JSON.parse(await readText(eventsFile));
    return (rows || []).map(normalize);
  } catch {
    return [];
  }
}

async function writeJson(rows: SubEvent[]) {
  await writeText(eventsFile, JSON.stringify(rows, null, 2));
}

export async function listEvents(workspaceId: string) {
  return (await readJson())
    .filter((e) => e.workspaceId === workspaceId)
    .sort((a, b) => (a.date || "").localeCompare(b.date || ""));
}

export async function getEvent(id: string) {
  const row = (await readJson()).find((e) => e.id === id);
  return row ? normalize(row) : null;
}

export async function createEvent(input: {
  workspaceId: string;
  name: string;
  type: string;
  date?: string;
  location?: string;
  budgetCap?: number;
  expectedGuests?: number;
  notes?: string;
  rsvpEnabled?: boolean;
  askMeal?: boolean;
  inviteMode?: InviteMode;
}) {
  const rows = await readJson();
  const now = new Date().toISOString();
  const row: SubEvent = normalize({
    id: randomUUID(),
    workspaceId: input.workspaceId,
    name: input.name,
    type: input.type,
    date: input.date,
    location: input.location,
    budgetCap: input.budgetCap,
    expectedGuests: input.expectedGuests,
    notes: input.notes,
    rsvpEnabled: Boolean(input.rsvpEnabled),
    askMeal: Boolean(input.askMeal),
    inviteMode: input.inviteMode || "invited",
    createdAt: now,
    updatedAt: now,
  });
  rows.push(row);
  await writeJson(rows);
  return row;
}

export async function updateEvent(id: string, patch: Partial<SubEvent>) {
  const rows = await readJson();
  const row = rows.find((e) => e.id === id);
  if (!row) return null;
  Object.assign(row, patch, { updatedAt: new Date().toISOString() });
  const next = normalize(row);
  Object.assign(row, next);
  await writeJson(rows);
  return next;
}

export async function deleteEvent(id: string) {
  const rows = await readJson();
  const next = rows.filter((e) => e.id !== id);
  if (next.length === rows.length) return false;
  await writeJson(next);
  return true;
}

export function rollupEvents(events: SubEvent[]) {
  return {
    count: events.length,
    budgetTotal: events.reduce((s, e) => s + (e.budgetCap || 0), 0),
    guestsTotal: events.reduce((s, e) => s + (e.expectedGuests || 0), 0),
    rsvpOpen: events.filter((e) => e.rsvpEnabled).length,
  };
}
