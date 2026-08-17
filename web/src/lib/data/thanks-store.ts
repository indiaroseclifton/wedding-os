import path from "path";
import { randomUUID } from "crypto";
import { dataDir, ensureDir, readText, writeText } from "./store-io";

const thanksFile = path.join(dataDir, "thanks.json");

export type ThankYou = {
  id: string;
  guestName: string;
  gift?: string;
  status: "TODO" | "SENT";
  sentDate?: string;
  notes?: string;
  guestId?: string;
  source?: "guest" | "registry" | "manual";
};

export type StoredThanks = {
  workspaceId: string;
  items: ThankYou[];
  updatedAt: string;
};

async function readAll(): Promise<Record<string, StoredThanks>> {
  await ensureDir();
  try {
    return JSON.parse(await readText(thanksFile));
  } catch {
    return {};
  }
}

async function writeAll(all: Record<string, StoredThanks>) {
  await writeText(thanksFile, JSON.stringify(all, null, 2));
}

export async function getThanks(workspaceId: string): Promise<StoredThanks> {
  const all = await readAll();
  if (!all[workspaceId]) {
    all[workspaceId] = {
      workspaceId,
      items: [],
      updatedAt: new Date().toISOString(),
    };
    await writeAll(all);
  }
  return all[workspaceId];
}

export async function saveThanks(workspaceId: string, patch: Partial<StoredThanks>) {
  const all = await readAll();
  const current = await getThanks(workspaceId);
  all[workspaceId] = { ...current, ...patch, updatedAt: new Date().toISOString() };
  await writeAll(all);
  return all[workspaceId];
}

export async function addThankYou(
  workspaceId: string,
  input: { guestName: string; gift?: string; notes?: string; guestId?: string; source?: ThankYou["source"] }
) {
  const current = await getThanks(workspaceId);
  const item: ThankYou = {
    id: randomUUID(),
    guestName: input.guestName,
    gift: input.gift,
    notes: input.notes,
    guestId: input.guestId,
    source: input.source || "manual",
    status: "TODO",
  };
  return saveThanks(workspaceId, { items: [...current.items, item] });
}

export async function patchThankYou(
  workspaceId: string,
  id: string,
  patch: Partial<ThankYou>
) {
  const current = await getThanks(workspaceId);
  return saveThanks(workspaceId, {
    items: current.items.map((i) => (i.id === id ? { ...i, ...patch } : i)),
  });
}

export async function deleteThankYou(workspaceId: string, id: string) {
  const current = await getThanks(workspaceId);
  return saveThanks(workspaceId, { items: current.items.filter((i) => i.id !== id) });
}

export async function importGiftsAsThanks(
  workspaceId: string,
  gifts: { from: string; description: string }[]
) {
  const current = await getThanks(workspaceId);
  const existing = new Set(
    current.items.map((i) => `${i.guestName.toLowerCase()}|${(i.gift || "").toLowerCase()}`)
  );
  const extras: ThankYou[] = [];
  for (const g of gifts) {
    const key = `${g.from.toLowerCase()}|${g.description.toLowerCase()}`;
    if (existing.has(key)) continue;
    extras.push({
      id: randomUUID(),
      guestName: g.from,
      gift: g.description,
      status: "TODO",
      source: "registry",
    });
  }
  if (!extras.length) return current;
  return saveThanks(workspaceId, { items: [...current.items, ...extras] });
}

export async function seedThanksFromGuests(
  workspaceId: string,
  guests: { id: string; name: string; rsvp: string; showed?: boolean }[]
) {
  const current = await getThanks(workspaceId);
  const existingIds = new Set(current.items.map((i) => i.guestId).filter(Boolean) as string[]);
  const existingNames = new Set(current.items.map((i) => i.guestName.trim().toLowerCase()));
  const extras: ThankYou[] = [];
  for (const g of guests) {
    if (g.showed === false || g.rsvp === "NO") continue;
    if (g.rsvp !== "YES" && g.showed !== true) continue;
    const key = g.name.trim().toLowerCase();
    if (existingIds.has(g.id) || existingNames.has(key)) continue;
    extras.push({
      id: randomUUID(),
      guestName: g.name,
      guestId: g.id,
      status: "TODO",
      source: "guest",
    });
    existingIds.add(g.id);
    existingNames.add(key);
  }
  if (!extras.length) return current;
  return saveThanks(workspaceId, { items: [...current.items, ...extras] });
}
