import path from "path";
import { randomUUID } from "crypto";
import { dataDir, readJson, writeJson } from "@/lib/data/store-io";
import { eventTitle, isEventKind, kindOf, type EventKind, type HouseEvent } from "@/lib/house";
import { getWorkspaceMeta } from "@/lib/data/store";

export const houseFile = path.join(dataDir, "house.json");

export async function listHouse(): Promise<HouseEvent[]> {
  const rows = await readJson<HouseEvent>(houseFile);
  return rows.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function activeHouse(): Promise<HouseEvent | null> {
  const rows = await listHouse();
  return rows.find((r) => r.active) || rows[0] || null;
}

export async function ensureHouse(seed?: {
  name?: string;
  honoreeA?: string;
  honoreeB?: string;
  date?: string;
  location?: string;
  shape?: string;
}): Promise<{ events: HouseEvent[]; activeId: string | null }> {
  const rows = await readJson<HouseEvent>(houseFile);
  if (rows.length) {
    if (!rows.some((r) => r.active)) {
      rows[0].active = true;
      await writeJson(houseFile, rows);
    }
    return { events: rows, activeId: rows.find((r) => r.active)?.id || rows[0].id };
  }
  const now = new Date().toISOString();
  const first: HouseEvent = {
    id: randomUUID(),
    kind: "wedding",
    title: seed?.name || eventTitle({ kind: "wedding", honoreeA: seed?.honoreeA, honoreeB: seed?.honoreeB, fallback: "First event" }),
    honoreeA: seed?.honoreeA,
    honoreeB: seed?.honoreeB,
    date: seed?.date,
    location: seed?.location,
    shape: seed?.shape,
    active: true,
    createdAt: now,
  };
  await writeJson(houseFile, [first]);
  return { events: [first], activeId: first.id };
}

export async function createHouseEvent(input: {
  kind?: string;
  honoreeA?: string;
  honoreeB?: string;
  date?: string;
  location?: string;
  shape?: string;
  enterHow?: string;
  guests?: string;
  cap?: string;
  thoughts?: string;
  title?: string;
}): Promise<HouseEvent> {
  const rows = await readJson<HouseEvent>(houseFile);
  const kind: EventKind = isEventKind(input.kind) ? input.kind : "wedding";
  const row: HouseEvent = {
    id: randomUUID(),
    kind,
    title:
      input.title ||
      eventTitle({
        kind,
        honoreeA: input.honoreeA,
        honoreeB: input.honoreeB,
        fallback: "New event",
      }),
    honoreeA: input.honoreeA,
    honoreeB: input.honoreeB,
    date: input.date,
    location: input.location,
    shape: input.shape,
    enterHow: input.enterHow,
    guests: input.guests,
    cap: input.cap,
    thoughts: input.thoughts,
    active: true,
    createdAt: new Date().toISOString(),
  };
  for (const existing of rows) existing.active = false;
  rows.unshift(row);
  await writeJson(houseFile, rows);
  return row;
}

export async function setActiveHouse(id: string): Promise<HouseEvent | null> {
  const rows = await readJson<HouseEvent>(houseFile);
  const found = rows.find((r) => r.id === id);
  if (!found) return null;
  for (const row of rows) row.active = row.id === id;
  await writeJson(houseFile, rows);
  return found;
}

export async function seedHouseFromWorkspace(workspaceId: string, fallbackName: string) {
  const meta = await getWorkspaceMeta(workspaceId, fallbackName);
  return ensureHouse({
    name: meta.name,
    honoreeA: meta.partnerA,
    honoreeB: meta.partnerB,
    date: meta.weddingDate,
    location: meta.location,
    shape: meta.shape,
  });
}

export { kindOf };
