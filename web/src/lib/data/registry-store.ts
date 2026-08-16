import path from "path";
import { randomUUID } from "crypto";
import { dataDir, ensureDir, readText, writeText } from "./store-io";

const registryFile = path.join(dataDir, "registry.json");

export type RegistryLink = {
  id: string;
  store: string;
  url: string;
  notes?: string;
};

export type Gift = {
  id: string;
  from: string;
  description: string;
  received: boolean;
};

export type StoredRegistry = {
  workspaceId: string;
  links: RegistryLink[];
  gifts: Gift[];
  updatedAt: string;
};

async function readAll(): Promise<Record<string, StoredRegistry>> {
  await ensureDir();
  try {
    return JSON.parse(await readText(registryFile));
  } catch {
    return {};
  }
}

async function writeAll(all: Record<string, StoredRegistry>) {
  await writeText(registryFile, JSON.stringify(all, null, 2));
}

export async function getRegistry(workspaceId: string): Promise<StoredRegistry> {
  const all = await readAll();
  if (!all[workspaceId]) {
    all[workspaceId] = {
      workspaceId,
      links: [],
      gifts: [],
      updatedAt: new Date().toISOString(),
    };
    await writeAll(all);
  }
  return all[workspaceId];
}

export async function saveRegistry(workspaceId: string, patch: Partial<StoredRegistry>) {
  const all = await readAll();
  const current = await getRegistry(workspaceId);
  all[workspaceId] = { ...current, ...patch, updatedAt: new Date().toISOString() };
  await writeAll(all);
  return all[workspaceId];
}

export async function addRegistryLink(
  workspaceId: string,
  input: { store: string; url: string; notes?: string }
) {
  const current = await getRegistry(workspaceId);
  const link: RegistryLink = { id: randomUUID(), ...input };
  return saveRegistry(workspaceId, { links: [...current.links, link] });
}

export async function deleteRegistryLink(workspaceId: string, id: string) {
  const current = await getRegistry(workspaceId);
  return saveRegistry(workspaceId, { links: current.links.filter((l) => l.id !== id) });
}

export async function addGift(
  workspaceId: string,
  input: { from: string; description: string }
) {
  const current = await getRegistry(workspaceId);
  const gift: Gift = { id: randomUUID(), received: true, ...input };
  return saveRegistry(workspaceId, { gifts: [...current.gifts, gift] });
}

export async function patchGift(workspaceId: string, id: string, patch: Partial<Gift>) {
  const current = await getRegistry(workspaceId);
  return saveRegistry(workspaceId, {
    gifts: current.gifts.map((g) => (g.id === id ? { ...g, ...patch } : g)),
  });
}

export async function deleteGift(workspaceId: string, id: string) {
  const current = await getRegistry(workspaceId);
  return saveRegistry(workspaceId, { gifts: current.gifts.filter((g) => g.id !== id) });
}
