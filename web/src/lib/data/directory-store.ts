import path from "path";
import { dataDir, ensureDir, readText, writeText } from "./store-io";
import { getDirectoryVendor } from "./vendor-directory";
import { createVendor, listVendors } from "./vendors-store";

const file = path.join(dataDir, "directory.json");

export type Inquiry = {
  slug: string;
  message: string;
  createdAt: string;
};

export type StoredDirectory = {
  workspaceId: string;
  shortlist: string[];
  inquiries: Inquiry[];
  updatedAt: string;
};

async function readAll(): Promise<Record<string, StoredDirectory>> {
  await ensureDir();
  try {
    return JSON.parse(await readText(file));
  } catch {
    return {};
  }
}

async function writeAll(all: Record<string, StoredDirectory>) {
  await writeText(file, JSON.stringify(all, null, 2));
}

export async function getDirectoryState(workspaceId: string): Promise<StoredDirectory> {
  const all = await readAll();
  if (!all[workspaceId]) {
    all[workspaceId] = {
      workspaceId,
      shortlist: [],
      inquiries: [],
      updatedAt: new Date().toISOString(),
    };
    await writeAll(all);
  }
  return all[workspaceId];
}

async function save(workspaceId: string, patch: Partial<StoredDirectory>) {
  const all = await readAll();
  const current = await getDirectoryState(workspaceId);
  all[workspaceId] = { ...current, ...patch, updatedAt: new Date().toISOString() };
  await writeAll(all);
  return all[workspaceId];
}

export async function toggleShortlist(workspaceId: string, slug: string) {
  const current = await getDirectoryState(workspaceId);
  const has = current.shortlist.includes(slug);
  const shortlist = has
    ? current.shortlist.filter((s) => s !== slug)
    : [...current.shortlist, slug];
  return save(workspaceId, { shortlist });
}

export async function addInquiry(workspaceId: string, slug: string, message: string) {
  const current = await getDirectoryState(workspaceId);
  const shortlist = current.shortlist.includes(slug)
    ? current.shortlist
    : [...current.shortlist, slug];
  return save(workspaceId, {
    shortlist,
    inquiries: [
      ...current.inquiries,
      { slug, message: message.slice(0, 2000), createdAt: new Date().toISOString() },
    ],
  });
}

export async function hireFromDirectory(
  workspaceId: string,
  slug: string,
  status: "RESEARCHING" | "CONTACTED" | "BOOKED"
) {
  const listing = getDirectoryVendor(slug);
  if (!listing) throw new Error("Unknown listing");
  const existing = (await listVendors(workspaceId)).find((v) => v.directorySlug === slug);
  if (existing) return { vendor: existing, created: false };
  const vendor = await createVendor({
    workspaceId,
    name: listing.name,
    category: listing.category,
    status,
    email: listing.email,
    notes: `${listing.blurb}\n\n${listing.afterBook}`,
    directorySlug: slug,
  });
  return { vendor, created: true };
}
