import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { dataDir } from "./store-io";

const legalFile = path.join(dataDir, "legal.json");

export type LegalItem = {
  id: string;
  title: string;
  category: string;
  dueDate?: string;
  link?: string;
  notes?: string;
  done: boolean;
};

export type StoredLegal = {
  workspaceId: string;
  countyState?: string;
  items: LegalItem[];
  privateNotes?: string;
  updatedAt: string;
};

const STARTER: Omit<LegalItem, "id">[] = [
  { title: "Apply for marriage license", category: "License", done: false },
  { title: "Pick up / receive marriage license", category: "License", done: false },
  { title: "Confirm officiant can sign license", category: "License", done: false },
  { title: "Name-change checklist (if any)", category: "Name change", done: false },
  { title: "Update Social Security (if changing name)", category: "Name change", done: false },
  { title: "Update driver's license / ID", category: "Name change", done: false },
  { title: "Store prenup / private docs securely", category: "Private", done: false },
];

async function readAll(): Promise<Record<string, StoredLegal>> {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    return JSON.parse(await fs.readFile(legalFile, "utf8"));
  } catch {
    return {};
  }
}

async function writeAll(all: Record<string, StoredLegal>) {
  await fs.writeFile(legalFile, JSON.stringify(all, null, 2), "utf8");
}

export async function getLegal(workspaceId: string): Promise<StoredLegal> {
  const all = await readAll();
  if (!all[workspaceId]) {
    all[workspaceId] = {
      workspaceId,
      items: STARTER.map((s) => ({ ...s, id: randomUUID() })),
      privateNotes: "",
      updatedAt: new Date().toISOString(),
    };
    await writeAll(all);
  }
  return all[workspaceId];
}

export async function saveLegal(workspaceId: string, patch: Partial<StoredLegal>) {
  const all = await readAll();
  const current = await getLegal(workspaceId);
  all[workspaceId] = { ...current, ...patch, updatedAt: new Date().toISOString() };
  await writeAll(all);
  return all[workspaceId];
}

export async function patchLegalItem(
  workspaceId: string,
  itemId: string,
  patch: Partial<LegalItem>
) {
  const current = await getLegal(workspaceId);
  const items = current.items.map((i) => (i.id === itemId ? { ...i, ...patch } : i));
  return saveLegal(workspaceId, { items });
}
