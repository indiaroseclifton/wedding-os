import path from "path";
import { randomUUID } from "crypto";
import { dataDir, ensureDir, readText, writeText } from "./store-io";
import { estimateQty, getPlaybook } from "./diy-playbooks";

const diyFile = path.join(dataDir, "diy.json");

export type DiyShopItem = {
  id: string;
  label: string;
  qty: number;
  unit: string;
  bought: boolean;
  note?: string;
};

export type DiyProject = {
  id: string;
  playbookSlug: string;
  title: string;
  status: "exploring" | "committed" | "done";
  tables: number;
  guests: number;
  chosenSourceId?: string;
  notes?: string;
  shopping: DiyShopItem[];
};

export type StoredDiy = {
  workspaceId: string;
  projects: DiyProject[];
  updatedAt: string;
};

async function readAll(): Promise<Record<string, StoredDiy>> {
  await ensureDir();
  try {
    return JSON.parse(await readText(diyFile));
  } catch {
    return {};
  }
}

async function writeAll(all: Record<string, StoredDiy>) {
  await writeText(diyFile, JSON.stringify(all, null, 2));
}

export async function getDiy(workspaceId: string): Promise<StoredDiy> {
  const all = await readAll();
  if (!all[workspaceId]) {
    all[workspaceId] = { workspaceId, projects: [], updatedAt: new Date().toISOString() };
    await writeAll(all);
  }
  return all[workspaceId];
}

export async function saveDiy(workspaceId: string, patch: Partial<StoredDiy>) {
  const all = await readAll();
  const current = await getDiy(workspaceId);
  all[workspaceId] = { ...current, ...patch, updatedAt: new Date().toISOString() };
  await writeAll(all);
  return all[workspaceId];
}

export async function startProject(
  workspaceId: string,
  input: { playbookSlug: string; tables?: number; guests?: number }
) {
  const book = getPlaybook(input.playbookSlug);
  if (!book) throw new Error("Unknown playbook");
  const current = await getDiy(workspaceId);
  const existing = current.projects.find((p) => p.playbookSlug === input.playbookSlug);
  if (existing) return current;
  const tables = input.tables && input.tables > 0 ? input.tables : 10;
  const guests = input.guests && input.guests > 0 ? input.guests : 80;
  const project: DiyProject = {
    id: randomUUID(),
    playbookSlug: book.slug,
    title: book.title,
    status: "exploring",
    tables,
    guests,
    shopping: book.shopping.map((rule) => ({
      id: randomUUID(),
      label: rule.label,
      qty: estimateQty(rule, tables, guests),
      unit: rule.unit,
      bought: false,
      note: rule.note,
    })),
  };
  return saveDiy(workspaceId, { projects: [...current.projects, project] });
}

export async function patchProject(
  workspaceId: string,
  id: string,
  patch: Partial<DiyProject>
) {
  const current = await getDiy(workspaceId);
  return saveDiy(workspaceId, {
    projects: current.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)),
  });
}

export async function recalcShopping(workspaceId: string, id: string, tables: number, guests: number) {
  const current = await getDiy(workspaceId);
  const project = current.projects.find((p) => p.id === id);
  if (!project) return current;
  const book = getPlaybook(project.playbookSlug);
  if (!book) return current;
  const bought = new Map(project.shopping.map((s) => [s.label, s.bought]));
  const shopping: DiyShopItem[] = book.shopping.map((rule) => ({
    id: randomUUID(),
    label: rule.label,
    qty: estimateQty(rule, tables, guests),
    unit: rule.unit,
    bought: bought.get(rule.label) || false,
    note: rule.note,
  }));
  return patchProject(workspaceId, id, { tables, guests, shopping });
}

export async function toggleShopItem(workspaceId: string, projectId: string, itemId: string) {
  const current = await getDiy(workspaceId);
  const project = current.projects.find((p) => p.id === projectId);
  if (!project) return current;
  return patchProject(workspaceId, projectId, {
    shopping: project.shopping.map((s) => (s.id === itemId ? { ...s, bought: !s.bought } : s)),
  });
}

export async function deleteProject(workspaceId: string, id: string) {
  const current = await getDiy(workspaceId);
  return saveDiy(workspaceId, { projects: current.projects.filter((p) => p.id !== id) });
}
