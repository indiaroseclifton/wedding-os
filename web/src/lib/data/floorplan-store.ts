import path from "path";
import { dataDir, ensureDir, readText, writeText } from "./store-io";
import type { FloorObject, TablePosition } from "@/lib/floorplan";

export type { FloorKind, FloorObject, TablePosition } from "@/lib/floorplan";
export { newFixture } from "@/lib/floorplan";

const floorFile = path.join(dataDir, "floorplan.json");

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
