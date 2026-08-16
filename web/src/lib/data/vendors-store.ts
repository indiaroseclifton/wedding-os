import path from "path";
import { randomUUID } from "crypto";
import { dataDir, readJson, writeJson } from "./store-io";

const vendorsFile = path.join(dataDir, "vendors.json");

export type StoredVendor = {
  id: string;
  workspaceId: string;
  name: string;
  category: string;
  status: string;
  contactName?: string;
  email?: string;
  phone?: string;
  website?: string;
  notes?: string;
  contractUrl?: string;
  directorySlug?: string;
  createdAt: string;
  updatedAt: string;
};

export async function listVendors(workspaceId: string) {
  return (await readJson<StoredVendor>(vendorsFile))
    .filter((r) => r.workspaceId === workspaceId)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function getVendor(id: string) {
  return (await readJson<StoredVendor>(vendorsFile)).find((r) => r.id === id) ?? null;
}

export async function createVendor(
  input: Omit<StoredVendor, "id" | "createdAt" | "updatedAt">
) {
  const rows = await readJson<StoredVendor>(vendorsFile);
  const now = new Date().toISOString();
  const row: StoredVendor = { ...input, id: randomUUID(), createdAt: now, updatedAt: now };
  rows.push(row);
  await writeJson(vendorsFile, rows);
  return row;
}

export async function updateVendor(id: string, patch: Partial<StoredVendor>) {
  const rows = await readJson<StoredVendor>(vendorsFile);
  const row = rows.find((r) => r.id === id);
  if (!row) return null;
  Object.assign(row, patch, { updatedAt: new Date().toISOString() });
  await writeJson(vendorsFile, rows);
  return row;
}

export async function deleteVendor(id: string) {
  const rows = await readJson<StoredVendor>(vendorsFile);
  const next = rows.filter((r) => r.id !== id);
  if (next.length === rows.length) return false;
  await writeJson(vendorsFile, next);
  return true;
}
