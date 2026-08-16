import path from "path";
import { randomUUID } from "crypto";
import { dataDir, ensureDir, readText, writeText } from "./store-io";

const travelFile = path.join(dataDir, "travel.json");

export type HotelBlock = {
  id: string;
  name: string;
  address?: string;
  rate?: string;
  blockCode?: string;
  cutoff?: string;
  rooms?: number;
  bookingUrl?: string;
  kind: "courtesy" | "guaranteed" | "other";
  notes?: string;
};

export type StoredTravel = {
  workspaceId: string;
  airport?: string;
  shuttle?: string;
  parking?: string;
  honeymoon?: string;
  notes?: string;
  hotels: HotelBlock[];
  updatedAt: string;
};

async function readAll(): Promise<Record<string, StoredTravel>> {
  await ensureDir();
  try {
    return JSON.parse(await readText(travelFile));
  } catch {
    return {};
  }
}

async function writeAll(all: Record<string, StoredTravel>) {
  await writeText(travelFile, JSON.stringify(all, null, 2));
}

export async function getTravel(workspaceId: string): Promise<StoredTravel> {
  const all = await readAll();
  if (!all[workspaceId]) {
    all[workspaceId] = {
      workspaceId,
      hotels: [],
      updatedAt: new Date().toISOString(),
    };
    await writeAll(all);
  }
  return all[workspaceId];
}

export async function saveTravel(workspaceId: string, patch: Partial<StoredTravel>) {
  const all = await readAll();
  const current = await getTravel(workspaceId);
  all[workspaceId] = { ...current, ...patch, updatedAt: new Date().toISOString() };
  await writeAll(all);
  return all[workspaceId];
}

export async function addHotel(
  workspaceId: string,
  input: Omit<HotelBlock, "id">
) {
  const current = await getTravel(workspaceId);
  const hotel: HotelBlock = { ...input, id: randomUUID() };
  return saveTravel(workspaceId, { hotels: [...current.hotels, hotel] });
}

export async function deleteHotel(workspaceId: string, id: string) {
  const current = await getTravel(workspaceId);
  return saveTravel(workspaceId, { hotels: current.hotels.filter((h) => h.id !== id) });
}
