import path from "path";
import { randomUUID } from "crypto";
import { dataDir, readJson, writeJson } from "./store-io";
import { getEvent, isWeddingDayEvent, listEvents, type SubEvent } from "./events-store";
import type { StoredGuest } from "./store";

const file = path.join(dataDir, "event-rsvps.json");

export type EventRsvpStatus = "INVITED" | "YES" | "NO" | "MAYBE";

export type EventRsvp = {
  id: string;
  workspaceId: string;
  eventId: string;
  guestId: string;
  status: EventRsvpStatus;
  meal?: string;
  updatedAt: string;
};

export async function listEventRsvps(workspaceId: string) {
  return (await readJson<EventRsvp>(file)).filter((r) => r.workspaceId === workspaceId);
}

export async function listRsvpsForEvent(eventId: string) {
  return (await readJson<EventRsvp>(file)).filter((r) => r.eventId === eventId);
}

export async function rsvpsForGuest(workspaceId: string, guestId: string) {
  return (await listEventRsvps(workspaceId)).filter((r) => r.guestId === guestId);
}

export async function upsertEventRsvp(input: {
  workspaceId: string;
  eventId: string;
  guestId: string;
  status: EventRsvpStatus;
  meal?: string;
}) {
  const rows = await readJson<EventRsvp>(file);
  const existing = rows.find((r) => r.eventId === input.eventId && r.guestId === input.guestId);
  const now = new Date().toISOString();
  if (existing) {
    existing.status = input.status;
    if (input.meal !== undefined) existing.meal = input.meal || undefined;
    existing.updatedAt = now;
    await writeJson(file, rows);
    return existing;
  }
  const row: EventRsvp = {
    id: randomUUID(),
    workspaceId: input.workspaceId,
    eventId: input.eventId,
    guestId: input.guestId,
    status: input.status,
    meal: input.meal || undefined,
    updatedAt: now,
  };
  rows.push(row);
  await writeJson(file, rows);
  return row;
}

export async function inviteGuestsToEvent(
  workspaceId: string,
  eventId: string,
  guestIds: string[]
) {
  const rows = await readJson<EventRsvp>(file);
  const now = new Date().toISOString();
  const have = new Set(
    rows.filter((r) => r.eventId === eventId).map((r) => r.guestId)
  );
  for (const guestId of guestIds) {
    if (have.has(guestId)) continue;
    rows.push({
      id: randomUUID(),
      workspaceId,
      eventId,
      guestId,
      status: "INVITED",
      updatedAt: now,
    });
  }
  await writeJson(file, rows);
  return rows.filter((r) => r.eventId === eventId);
}

export async function uninviteGuest(eventId: string, guestId: string) {
  const rows = await readJson<EventRsvp>(file);
  const next = rows.filter((r) => !(r.eventId === eventId && r.guestId === guestId));
  await writeJson(file, next);
  return true;
}

export async function deleteRsvpsForEvent(eventId: string) {
  const rows = await readJson<EventRsvp>(file);
  await writeJson(
    file,
    rows.filter((r) => r.eventId !== eventId)
  );
}

export function eventVisibleToGuest(event: SubEvent, rsvp?: EventRsvp | null) {
  if (!event.rsvpEnabled || isWeddingDayEvent(event)) return false;
  if (event.inviteMode === "everyone") return true;
  return Boolean(rsvp);
}

export async function publicEventsForGuest(
  workspaceId: string,
  guestId: string
) {
  const [events, rsvps] = await Promise.all([
    listEvents(workspaceId),
    rsvpsForGuest(workspaceId, guestId),
  ]);
  const byEvent = new Map(rsvps.map((r) => [r.eventId, r]));
  return events
    .filter((e) => eventVisibleToGuest(e, byEvent.get(e.id)))
    .map((e) => ({
      id: e.id,
      name: e.name,
      type: e.type,
      date: e.date,
      location: e.location,
      askMeal: e.askMeal,
      status: byEvent.get(e.id)?.status || "INVITED",
      meal: byEvent.get(e.id)?.meal || "",
    }));
}

export function countEventRsvps(rows: EventRsvp[]) {
  return {
    invited: rows.length,
    yes: rows.filter((r) => r.status === "YES").length,
    no: rows.filter((r) => r.status === "NO").length,
    maybe: rows.filter((r) => r.status === "MAYBE").length,
    pending: rows.filter((r) => r.status === "INVITED").length,
  };
}

export async function eventRsvpMap(workspaceId: string) {
  const rows = await listEventRsvps(workspaceId);
  const byEvent: Record<string, Record<string, EventRsvpStatus>> = {};
  for (const row of rows) {
    if (!byEvent[row.eventId]) byEvent[row.eventId] = {};
    byEvent[row.eventId][row.guestId] = row.status;
  }
  return byEvent;
}

export { getEvent };
export type { StoredGuest };
