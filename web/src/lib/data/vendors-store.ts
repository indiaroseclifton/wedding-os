import path from "path";
import { randomUUID } from "crypto";
import { dataDir, readJson, writeJson } from "./store-io";
import type { ContractReview } from "./contract-review";
import { seedChecklist, type VendorCheckItem } from "@/lib/vendor-checklists";

const vendorsFile = path.join(dataDir, "vendors.json");

export type VendorInquiry = {
  id: string;
  at: string;
  direction: "out" | "in";
  body: string;
  emailedAt?: string;
};

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
  contractReview?: ContractReview;
  inquiries?: VendorInquiry[];
  directorySlug?: string;
  checklist?: VendorCheckItem[];
  face?: Record<string, string>;
  gutMark?: "yes" | "maybe" | "no";
  gutNote?: string;
  gutAt?: string;
  quoteLow?: string;
  quoteNote?: string;
  asks?: { id: string; body: string; at: string; answer?: string; answeredAt?: string }[];
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
  const row: StoredVendor = {
    ...input,
    checklist: input.checklist?.length ? input.checklist : seedChecklist(input.category),
    id: randomUUID(),
    createdAt: now,
    updatedAt: now,
  };
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

export function mergeInquiries(existing: VendorInquiry[], incoming: VendorInquiry[]) {
  const have = new Set(existing.map((e) => `${e.at}|${e.body}`));
  const extra = incoming.filter((i) => !have.has(`${i.at}|${i.body}`));
  return [...existing, ...extra].sort((a, b) => a.at.localeCompare(b.at));
}

export async function appendVendorInquiry(
  id: string,
  note: Omit<VendorInquiry, "id" | "at"> & { id?: string; at?: string }
) {
  const row = await getVendor(id);
  if (!row) return null;
  const next: VendorInquiry = {
    id: note.id || randomUUID(),
    at: note.at || new Date().toISOString(),
    direction: note.direction,
    body: note.body.slice(0, 2000),
    emailedAt: note.emailedAt,
  };
  return updateVendor(id, { inquiries: mergeInquiries(row.inquiries || [], [next]) });
}
