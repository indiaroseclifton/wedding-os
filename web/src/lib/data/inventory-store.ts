import path from "path";
import { randomUUID } from "crypto";
import { dataDir, ensureDir, readText, writeText } from "./store-io";

const inventoryFile = path.join(dataDir, "inventory.json");

export type InventoryFate = "unset" | "keep" | "return" | "sell" | "donate" | "reuse";

export type BoxItem = {
  id: string;
  label: string;
  done: boolean;
};

export type InventoryBox = {
  id: string;
  name: string;
  zone: string;
  takeTo: string;
  owner: string;
  setupBy: string;
  fate: InventoryFate;
  items: BoxItem[];
};

export type StoredInventory = {
  workspaceId: string;
  boxes: InventoryBox[];
  updatedAt: string;
};

async function readAll(): Promise<Record<string, StoredInventory>> {
  await ensureDir();
  try {
    return JSON.parse(await readText(inventoryFile));
  } catch {
    return {};
  }
}

async function writeAll(all: Record<string, StoredInventory>) {
  await writeText(inventoryFile, JSON.stringify(all, null, 2));
}

export async function getInventory(workspaceId: string): Promise<StoredInventory> {
  const all = await readAll();
  if (!all[workspaceId]) {
    all[workspaceId] = { workspaceId, boxes: [], updatedAt: new Date().toISOString() };
    await writeAll(all);
  }
  return all[workspaceId];
}

export async function saveInventory(workspaceId: string, patch: Partial<StoredInventory>) {
  const all = await readAll();
  const current = await getInventory(workspaceId);
  all[workspaceId] = { ...current, ...patch, updatedAt: new Date().toISOString() };
  await writeAll(all);
  return all[workspaceId];
}

export async function addBox(
  workspaceId: string,
  input: { name: string; zone?: string; takeTo?: string; owner?: string; setupBy?: string }
) {
  const current = await getInventory(workspaceId);
  const box: InventoryBox = {
    id: randomUUID(),
    name: input.name,
    zone: input.zone || "",
    takeTo: input.takeTo || "",
    owner: input.owner || "",
    setupBy: input.setupBy || "",
    fate: "unset",
    items: [],
  };
  return saveInventory(workspaceId, { boxes: [...current.boxes, box] });
}

export async function patchBox(workspaceId: string, boxId: string, patch: Partial<InventoryBox>) {
  const current = await getInventory(workspaceId);
  return saveInventory(workspaceId, {
    boxes: current.boxes.map((b) => (b.id === boxId ? { ...b, ...patch } : b)),
  });
}

export async function deleteBox(workspaceId: string, boxId: string) {
  const current = await getInventory(workspaceId);
  return saveInventory(workspaceId, { boxes: current.boxes.filter((b) => b.id !== boxId) });
}

export async function addBoxItem(workspaceId: string, boxId: string, label: string) {
  const current = await getInventory(workspaceId);
  return saveInventory(workspaceId, {
    boxes: current.boxes.map((b) =>
      b.id === boxId
        ? { ...b, items: [...b.items, { id: randomUUID(), label, done: false }] }
        : b
    ),
  });
}

export async function toggleBoxItem(workspaceId: string, boxId: string, itemId: string) {
  const current = await getInventory(workspaceId);
  return saveInventory(workspaceId, {
    boxes: current.boxes.map((b) =>
      b.id === boxId
        ? { ...b, items: b.items.map((i) => (i.id === itemId ? { ...i, done: !i.done } : i)) }
        : b
    ),
  });
}
