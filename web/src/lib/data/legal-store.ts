import path from "path";
import { randomUUID } from "crypto";
import { dataDir, ensureDir, readText, writeText, ensureFile, pathExists } from "./store-io";

const legalFile = path.join(dataDir, "legal.json");

export type NamePath = "unset" | "keep" | "hyphen" | "change";

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
  namePath?: NamePath;
  updatedAt: string;
};

export const NAME_STEPS: Omit<LegalItem, "id" | "done">[] = [
  { title: "Social Security", category: "Name change", notes: "SS-5. Do this first — banks want the card." },
  { title: "Driver's license or state ID", category: "Name change", notes: "Bring the new SS card and the marriage license." },
  { title: "Passport", category: "Name change", notes: "If you travel this year. DS-5504 if the license is recent." },
  { title: "Bank and cards", category: "Name change", notes: "The name on the account has to match the ID." },
  { title: "Work and payroll", category: "Name change", notes: "HR, benefits, and email if you want it." },
  { title: "Insurance", category: "Name change", notes: "Health, auto, life. The policy name is what they pay." },
  { title: "Lease, deed, car title", category: "Name change", notes: "Only if the name is already on the paper." },
];

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
  await ensureDir();
  try {
    return JSON.parse(await readText(legalFile));
  } catch {
    return {};
  }
}

async function writeAll(all: Record<string, StoredLegal>) {
  await writeText(legalFile, JSON.stringify(all, null, 2));
}

export async function getLegal(workspaceId: string): Promise<StoredLegal> {
  const all = await readAll();
  if (!all[workspaceId]) {
    all[workspaceId] = {
      workspaceId,
      items: STARTER.map((s) => ({ ...s, id: randomUUID() })),
      privateNotes: "",
      namePath: "unset",
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

export async function addLegalItem(
  workspaceId: string,
  input: { title: string; category?: string; dueDate?: string }
) {
  const current = await getLegal(workspaceId);
  const item: LegalItem = {
    id: randomUUID(),
    title: input.title,
    category: input.category || "Other",
    dueDate: input.dueDate,
    done: false,
  };
  return saveLegal(workspaceId, { items: [...current.items, item] });
}

export async function deleteLegalItem(workspaceId: string, itemId: string) {
  const current = await getLegal(workspaceId);
  return saveLegal(workspaceId, { items: current.items.filter((i) => i.id !== itemId) });
}

export async function setNamePath(workspaceId: string, namePath: NamePath) {
  const current = await getLegal(workspaceId);
  let items = current.items;
  if (namePath === "hyphen" || namePath === "change") {
    const have = new Set(
      items.filter((i) => i.category === "Name change").map((i) => i.title.toLowerCase())
    );
    const missing = NAME_STEPS.filter((s) => !have.has(s.title.toLowerCase()));
    if (missing.length) {
      items = [...items, ...missing.map((s) => ({ ...s, id: randomUUID(), done: false }))];
    }
  }
  return saveLegal(workspaceId, { namePath, items });
}
