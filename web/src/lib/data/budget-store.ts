import path from "path";
import { randomUUID } from "crypto";
import { dataDir, ensureDir, readText, writeText, ensureFile, pathExists } from "./store-io";

const budgetFile = path.join(dataDir, "budget.json");

export type BudgetLine = {
  id: string;
  category: string;
  label: string;
  planned: number;
  actual: number;
};

export type StoredBudget = {
  workspaceId: string;
  currency: string;
  overallLimit?: number;
  lines: BudgetLine[];
  updatedAt: string;
};

async function readAll(): Promise<Record<string, StoredBudget>> {
  await ensureDir();
  try {
    const raw = await readText(budgetFile);
    return JSON.parse(raw || "{}");
  } catch {
    return {};
  }
}

async function writeAll(all: Record<string, StoredBudget>) {
  await ensureDir();
  await writeText(budgetFile, JSON.stringify(all, null, 2));
}

export async function getBudget(workspaceId: string): Promise<StoredBudget> {
  const all = await readAll();
  if (!all[workspaceId]) {
    all[workspaceId] = {
      workspaceId,
      currency: "USD",
      lines: [],
      updatedAt: new Date().toISOString(),
    };
    await writeAll(all);
  }
  return all[workspaceId];
}

export async function saveBudget(
  workspaceId: string,
  patch: { overallLimit?: number; lines?: BudgetLine[] }
) {
  const all = await readAll();
  const current = await getBudget(workspaceId);
  all[workspaceId] = {
    ...current,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  await writeAll(all);
  return all[workspaceId];
}

export async function addBudgetLine(
  workspaceId: string,
  input: { category: string; label: string; planned?: number; actual?: number }
) {
  const budget = await getBudget(workspaceId);
  const line: BudgetLine = {
    id: randomUUID(),
    category: input.category,
    label: input.label,
    planned: Number(input.planned) || 0,
    actual: Number(input.actual) || 0,
  };
  return saveBudget(workspaceId, { lines: [...budget.lines, line] });
}

export async function updateBudgetLine(
  workspaceId: string,
  id: string,
  patch: Partial<Pick<BudgetLine, "category" | "label" | "planned" | "actual">>
) {
  const budget = await getBudget(workspaceId);
  return saveBudget(workspaceId, {
    lines: budget.lines.map((line) => (line.id === id ? { ...line, ...patch } : line)),
  });
}

export async function deleteBudgetLine(workspaceId: string, id: string) {
  const budget = await getBudget(workspaceId);
  return saveBudget(workspaceId, { lines: budget.lines.filter((line) => line.id !== id) });
}
