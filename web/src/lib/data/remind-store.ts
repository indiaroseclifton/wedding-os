import path from "path";
import { dataDir, ensureDir, readText, writeText } from "./store-io";

const file = path.join(dataDir, "remind.json");

export type RemindArms = {
  workspaceId: string;
  digest: boolean;
  digestTo?: string;
  autoRsvp: boolean;
  autoAddress: boolean;
  lastDigestAt?: string;
  lastTickAt?: string;
  lastAutoRsvpAt?: string;
  lastAutoAddressAt?: string;
  updatedAt: string;
};

const defaults = (workspaceId: string): RemindArms => ({
  workspaceId,
  digest: true,
  autoRsvp: false,
  autoAddress: false,
  updatedAt: new Date().toISOString(),
});

async function readAll(): Promise<Record<string, RemindArms>> {
  await ensureDir();
  try {
    return JSON.parse(await readText(file));
  } catch {
    return {};
  }
}

export async function getRemind(workspaceId: string): Promise<RemindArms> {
  const all = await readAll();
  return all[workspaceId] || defaults(workspaceId);
}

export async function saveRemind(workspaceId: string, patch: Partial<RemindArms>) {
  const all = await readAll();
  const next: RemindArms = {
    ...defaults(workspaceId),
    ...all[workspaceId],
    ...patch,
    workspaceId,
    updatedAt: new Date().toISOString(),
  };
  all[workspaceId] = next;
  await writeText(file, JSON.stringify(all, null, 2));
  return next;
}
