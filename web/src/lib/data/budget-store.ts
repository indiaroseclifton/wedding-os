import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { dataDir } from "./store-io";

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
  await fs.mkdir(dataDir, { recursive: true });
  try {
    const raw = await fs.readFile(budgetFile, "utf8");
    return JSON.parse(raw || "{}");
  } catch {
    return {};
  }
}

async function writeAll(all: Record<string, StoredBudget>) {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(budgetFile, JSON.stringify(all, null, 2), "utf8");
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
