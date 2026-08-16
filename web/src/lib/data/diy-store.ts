import path from "path";
import { randomUUID } from "crypto";
import { dataDir, ensureDir, readText, writeText } from "./store-io";
import { estimateQty, getPlaybook } from "./diy-playbooks";
import { addBudgetLine, getBudget, updateBudgetLine } from "./budget-store";

const diyFile = path.join(dataDir, "diy.json");

export type DiyShopItem = {
  id: string;
  label: string;
  qty: number;
  unit: string;
  bought: boolean;
  estEach?: number;
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

export type FloralMockup = {
  id: string;
  title: string;
  vessel: string;
  story: string;
  pieces: {
    id: string;
    stemId: string;
    x: number;
    y: number;
    rot: number;
    scale: number;
    z: number;
  }[];
  updatedAt: string;
  kind?: "floral" | "table";
  shape?: string;
  seats?: number;
  tables?: number;
  runner?: boolean;
  candles?: number;
  buds?: number;
  bowl?: boolean;
  plates?: boolean;
};

export type StoredDiy = {
  workspaceId: string;
  projects: DiyProject[];
  mockups?: FloralMockup[];
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
      estEach: rule.estEach,
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
    estEach: rule.estEach,
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

export function diyEstimate(diy: StoredDiy) {
  return diy.projects
    .filter((p) => p.status !== "done")
    .reduce(
      (sum, p) =>
        sum +
        p.shopping.reduce((s, item) => s + (item.qty || 0) * (item.estEach || 0), 0),
      0
    );
}

export async function saveMockup(
  workspaceId: string,
  mockup: Omit<FloralMockup, "id" | "updatedAt"> & { id?: string }
) {
  const current = await getDiy(workspaceId);
  const list = current.mockups || [];
  const now = new Date().toISOString();
  if (mockup.id) {
    const next = list.map((m) => (m.id === mockup.id ? { ...m, ...mockup, id: mockup.id, updatedAt: now } : m));
    if (!next.some((m) => m.id === mockup.id)) {
      next.unshift({ ...mockup, id: mockup.id, updatedAt: now });
    }
    return saveDiy(workspaceId, { mockups: next });
  }
  const row: FloralMockup = { ...mockup, id: randomUUID(), updatedAt: now };
  return saveDiy(workspaceId, { mockups: [row, ...list].slice(0, 24) });
}

export async function deleteMockup(workspaceId: string, id: string) {
  const current = await getDiy(workspaceId);
  return saveDiy(workspaceId, { mockups: (current.mockups || []).filter((m) => m.id !== id) });
}

export async function pushFloralShop(
  workspaceId: string,
  lines: { label: string; qty: number; estEach: number }[],
  tables: number
) {
  let current = await getDiy(workspaceId);
  let project = current.projects.find((p) => p.playbookSlug === "flowers");
  if (!project) {
    current = await startProject(workspaceId, { playbookSlug: "flowers", tables });
    project = current.projects.find((p) => p.playbookSlug === "flowers");
  }
  if (!project) return current;
  const shopping = [...project.shopping];
  for (const line of lines) {
    const qty = Math.max(1, Math.round(line.qty * Math.max(1, tables)));
    const existing = shopping.find((s) => s.label === line.label);
    if (existing) {
      existing.qty = qty;
      existing.estEach = line.estEach;
    } else {
      shopping.push({
        id: randomUUID(),
        label: line.label,
        qty,
        unit: "stems",
        bought: false,
        estEach: line.estEach,
        note: "From floral studio",
      });
    }
  }
  const next = await patchProject(workspaceId, project.id, { shopping, tables });
  const amount = shopping.reduce((s, i) => s + (i.qty || 0) * (i.estEach || 0), 0);
  await writeDiyBudget(workspaceId, "flowers", "DIY flowers", amount);
  return next;
}

async function writeDiyBudget(workspaceId: string, category: string, label: string, amount: number) {
  if (!amount) return;
  const budget = await getBudget(workspaceId);
  const existing = budget.lines.find((l) => l.path === "diy" && l.label === label);
  if (existing) {
    await updateBudgetLine(workspaceId, existing.id, {
      diyEstimate: Math.round(amount),
      planned: Math.round(amount),
      path: "diy",
    });
    return;
  }
  await addBudgetLine(workspaceId, {
    category,
    label,
    diyEstimate: Math.round(amount),
    planned: Math.round(amount),
    path: "diy",
  });
}

export async function pushTableShop(
  workspaceId: string,
  lines: { label: string; qty: number; estEach: number }[],
  tables: number
) {
  let current = await getDiy(workspaceId);
  let project = current.projects.find((p) => p.playbookSlug === "table-decor");
  if (!project) {
    current = await startProject(workspaceId, { playbookSlug: "table-decor", tables });
    project = current.projects.find((p) => p.playbookSlug === "table-decor");
  }
  if (!project) return current;
  const shopping = [...project.shopping];
  for (const line of lines) {
    const qty = Math.max(1, Math.round(line.qty * Math.max(1, tables)));
    const existing = shopping.find((s) => s.label === line.label);
    if (existing) {
      existing.qty = qty;
      existing.estEach = line.estEach;
    } else {
      shopping.push({
        id: randomUUID(),
        label: line.label,
        qty,
        unit: "ea",
        bought: false,
        estEach: line.estEach,
        note: "From tablescape studio",
      });
    }
  }
  const next = await patchProject(workspaceId, project.id, { shopping, tables });
  const amount = shopping.reduce((s, i) => s + (i.qty || 0) * (i.estEach || 0), 0);
  await writeDiyBudget(workspaceId, "decor", "DIY tables", amount);
  return next;
}
