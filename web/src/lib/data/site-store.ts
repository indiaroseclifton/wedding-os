import path from "path";
import { randomUUID } from "crypto";
import { dataDir, ensureDir, readText, writeText } from "./store-io";

const siteFile = path.join(dataDir, "site.json");

export type StoredSite = {
  workspaceId: string;
  siteToken: string;
  published: boolean;
  headline?: string;
  story?: string;
  scheduleNote?: string;
  dressCode?: string;
  extra?: string;
  showTravel: boolean;
  showRegistry: boolean;
  rsvpOpen: boolean;
  rsvpNote?: string;
  collectAddress: boolean;
  requireAddress: boolean;
  updatedAt: string;
};

async function readAll(): Promise<Record<string, StoredSite>> {
  await ensureDir();
  try {
    return JSON.parse(await readText(siteFile));
  } catch {
    return {};
  }
}

async function writeAll(all: Record<string, StoredSite>) {
  await writeText(siteFile, JSON.stringify(all, null, 2));
}

function fresh(workspaceId: string): StoredSite {
  return {
    workspaceId,
    siteToken: randomUUID().replace(/-/g, "").slice(0, 12),
    published: false,
    showTravel: true,
    showRegistry: true,
    rsvpOpen: true,
    collectAddress: true,
    requireAddress: false,
    updatedAt: new Date().toISOString(),
  };
}

export async function getSite(workspaceId: string): Promise<StoredSite> {
  const all = await readAll();
  if (!all[workspaceId]) {
    all[workspaceId] = fresh(workspaceId);
    await writeAll(all);
  }
  const site = all[workspaceId];
  return {
    ...site,
    collectAddress: site.collectAddress !== false,
    requireAddress: Boolean(site.requireAddress),
  };
}

export async function saveSite(workspaceId: string, patch: Partial<StoredSite>) {
  const all = await readAll();
  const current = await getSite(workspaceId);
  all[workspaceId] = { ...current, ...patch, updatedAt: new Date().toISOString() };
  await writeAll(all);
  return all[workspaceId];
}

export async function getSiteByToken(token: string) {
  if (!token) return null;
  const all = await readAll();
  const site = Object.values(all).find((s) => s.siteToken === token);
  if (!site) return null;
  return {
    ...site,
    collectAddress: site.collectAddress !== false,
    requireAddress: Boolean(site.requireAddress),
  };
}

export async function publishSite(workspaceId: string) {
  const current = await getSite(workspaceId);
  return saveSite(workspaceId, {
    published: true,
    siteToken: current.siteToken || randomUUID().replace(/-/g, "").slice(0, 12),
  });
}
