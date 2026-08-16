import path from "path";
import { randomUUID } from "crypto";
import { dataDir, ensureDir, readText, writeText } from "./store-io";

const floorFile = path.join(dataDir, "floorplan.json");

export type TablePosition = {
  tableId: string;
  x: number;
  y: number;
};

export type FloorKind =
  | "TABLE"
  | "DANCE_FLOOR"
  | "BUFFET"
  | "BAR"
  | "CAKE"
  | "DJ"
  | "KIDS"
  | "PHOTO"
  | "ESCORT";

export type FloorObject = {
  id: string;
  kind: FloorKind;
  label: string;
  x: number;
  y: number;
  w?: number;
  h?: number;
  tableId?: string;
};

export type StoredFloorPlan = {
  workspaceId: string;
  room?: { widthFt: number; depthFt: number };
  positions: TablePosition[];
  objects?: FloorObject[];
  updatedAt: string;
};

async function readAll(): Promise<Record<string, StoredFloorPlan>> {
  await ensureDir();
  try {
    return JSON.parse(await readText(floorFile));
  } catch {
    return {};
  }
}

async function writeAll(all: Record<string, StoredFloorPlan>) {
  await writeText(floorFile, JSON.stringify(all, null, 2));
}

export async function getFloorPlan(workspaceId: string): Promise<StoredFloorPlan> {
  const all = await readAll();
  if (!all[workspaceId]) {
    all[workspaceId] = {
      workspaceId,
      positions: [],
      objects: [],
      room: { widthFt: 60, depthFt: 40 },
      updatedAt: new Date().toISOString(),
    };
    await writeAll(all);
  }
  return all[workspaceId];
}

export async function saveFloorPlan(
  workspaceId: string,
  patch: Partial<Pick<StoredFloorPlan, "positions" | "objects" | "room">>
) {
  const all = await readAll();
  const current = await getFloorPlan(workspaceId);
  all[workspaceId] = {
    ...current,
    ...patch,
    workspaceId,
    updatedAt: new Date().toISOString(),
  };
  await writeAll(all);
  return all[workspaceId];
}

export async function savePositions(workspaceId: string, positions: TablePosition[]) {
  return saveFloorPlan(workspaceId, { positions });
}

export function newFixture(kind: Exclude<FloorKind, "TABLE">): FloorObject {
  const labels: Record<Exclude<FloorKind, "TABLE">, string> = {
    DANCE_FLOOR: "Dance floor",
    BUFFET: "Buffet",
    BAR: "Bar",
    CAKE: "Cake",
    DJ: "DJ",
    KIDS: "Kids",
    PHOTO: "Photo",
    ESCORT: "Escort cards",
  };
  const size: Partial<Record<FloorKind, { w: number; h: number }>> = {
    DANCE_FLOOR: { w: 22, h: 16 },
    BUFFET: { w: 18, h: 8 },
    BAR: { w: 10, h: 8 },
    CAKE: { w: 8, h: 8 },
    DJ: { w: 10, h: 8 },
    KIDS: { w: 12, h: 12 },
    PHOTO: { w: 8, h: 8 },
    ESCORT: { w: 10, h: 6 },
  };
  return {
    id: randomUUID(),
    kind,
    label: labels[kind],
    x: 50,
    y: 18,
    ...size[kind],
  };
}
