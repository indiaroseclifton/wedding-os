import path from "path";
import { randomUUID } from "crypto";
import { dataDir, ensureDir, readText, writeText } from "./store-io";
import { defaultSign, type SignDesign, type SignKind } from "@/lib/signage";

const file = path.join(dataDir, "signage.json");

export type StoredSignage = {
  workspaceId: string;
  signs: SignDesign[];
  updatedAt: string;
};

async function readAll(): Promise<Record<string, StoredSignage>> {
  await ensureDir();
  try {
    return JSON.parse(await readText(file));
  } catch {
    return {};
  }
}

async function writeAll(all: Record<string, StoredSignage>) {
  await writeText(file, JSON.stringify(all, null, 2));
}

export async function getSignage(workspaceId: string): Promise<StoredSignage> {
  const all = await readAll();
  if (!all[workspaceId]) {
    all[workspaceId] = { workspaceId, signs: [], updatedAt: new Date().toISOString() };
    await writeAll(all);
  }
  return all[workspaceId];
}

export async function upsertSign(
  workspaceId: string,
  input: Partial<SignDesign> & { kind?: SignKind },
  names?: string,
  date?: string
) {
  const current = await getSignage(workspaceId);
  const now = new Date().toISOString();
  if (input.id) {
    const signs = current.signs.map((s) =>
      s.id === input.id ? { ...s, copies: s.copies || 1, style: s.style || "arch", ...input, updatedAt: now } : s
    );
    const next = { ...current, signs, updatedAt: now };
    const all = await readAll();
    all[workspaceId] = next;
    await writeAll(all);
    return signs.find((s) => s.id === input.id)!;
  }
  const created: SignDesign = {
    ...defaultSign(input.kind || "welcome", names, date),
    ...input,
    id: randomUUID(),
    token: randomUUID().replace(/-/g, "").slice(0, 16),
    updatedAt: now,
  };
  const next = { ...current, signs: [...current.signs, created], updatedAt: now };
  const all = await readAll();
  all[workspaceId] = next;
  await writeAll(all);
  return created;
}

export async function deleteSign(workspaceId: string, id: string) {
  const current = await getSignage(workspaceId);
  const next = { ...current, signs: current.signs.filter((s) => s.id !== id), updatedAt: new Date().toISOString() };
  const all = await readAll();
  all[workspaceId] = next;
  await writeAll(all);
  return next;
}

export async function findSignByToken(token: string) {
  const all = await readAll();
  for (const row of Object.values(all)) {
    const sign = row.signs.find((s) => s.token === token);
    if (sign) return { workspaceId: row.workspaceId, sign };
  }
  return null;
}
