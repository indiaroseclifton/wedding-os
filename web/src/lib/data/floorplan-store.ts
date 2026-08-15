import { promises as fs } from "fs";
import path from "path";

const dataDir = path.join(process.cwd(), ".data");
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
  await fs.mkdir(dataDir, { recursive: true });
  try {
    return JSON.parse(await fs.readFile(floorFile, "utf8"));
  } catch {
    return {};
  }
}

async function writeAll(all: Record<string, StoredFloorPlan>) {
  await fs.writeFile(floorFile, JSON.stringify(all, null, 2), "utf8");
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
