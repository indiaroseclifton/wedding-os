import path from "path";
import { dataDir, ensureDir, readText, writeText, ensureFile, pathExists } from "./store-io";

const floorFile = path.join(dataDir, "floorplan.json");

export type TablePosition = {
  tableId: string;
  x: number; // percent 0-100
  y: number;
};

export type StoredFloorPlan = {
  workspaceId: string;
  positions: TablePosition[];
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
      updatedAt: new Date().toISOString(),
    };
    await writeAll(all);
  }
  return all[workspaceId];
}

export async function savePositions(
  workspaceId: string,
  positions: TablePosition[]
) {
  const all = await readAll();
  all[workspaceId] = {
    workspaceId,
    positions,
    updatedAt: new Date().toISOString(),
  };
  await writeAll(all);
  return all[workspaceId];
}
