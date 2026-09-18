import path from "path";
import { randomUUID } from "crypto";
import { dataDir, ensureDir, readText, writeText } from "./store-io";
import { BUDGET_ENVELOPES, envelopeForPath } from "@/lib/budget-envelopes";
import type { BudgetAlternative, BudgetPhaseId } from "@/lib/budget-plan";

const budgetFile = path.join(dataDir, "budget.json");

export type BudgetLine = {
  id: string;
  category: string;
  label: string;
  planned: number;
  actual: number;
  hireEstimate?: number;
  diyEstimate?: number;
  path?: "hire" | "diy" | "undecided";
  who?: "couple" | "family" | "split";
};

export type StoredBudget = {
  workspaceId: string;
  currency: string;
  overallLimit?: number;
  phase?: BudgetPhaseId;
  alternatives?: BudgetAlternative[];
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
      alternatives: [],
      updatedAt: new Date().toISOString(),
    };
    await writeAll(all);
  }
  const row = all[workspaceId];
  if (!row.alternatives) row.alternatives = [];
  return row;
}

export async function saveBudget(
  workspaceId: string,
  patch: Partial<Pick<StoredBudget, "overallLimit" | "lines" | "phase" | "alternatives">>,
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
  input: {
    category: string;
    label: string;
    planned?: number;
    actual?: number;
    hireEstimate?: number;
    diyEstimate?: number;
    path?: BudgetLine["path"];
    who?: BudgetLine["who"];
  },
) {
  const budget = await getBudget(workspaceId);
  const pathChoice = input.path || "undecided";
  const hire = Number(input.hireEstimate) || 0;
  const diy = Number(input.diyEstimate) || 0;
  const planned =
    pathChoice === "hire" && hire
      ? hire
      : pathChoice === "diy" && diy
        ? diy
        : Number(input.planned) || 0;
  const line: BudgetLine = {
    id: randomUUID(),
    category: input.category,
    label: input.label,
    planned,
    actual: Number(input.actual) || 0,
    hireEstimate: hire || undefined,
    diyEstimate: diy || undefined,
    path: pathChoice,
    who: input.who,
  };
  return saveBudget(workspaceId, { lines: [...budget.lines, line] });
}

export async function updateBudgetLine(
  workspaceId: string,
  id: string,
  patch: Partial<Pick<BudgetLine, "category" | "label" | "planned" | "actual" | "hireEstimate" | "diyEstimate" | "path" | "who">>,
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

export async function seedBudgetEnvelopes(
  workspaceId: string,
  total: number,
  pathChoices: Record<string, string> = {},
) {
  const budget = await getBudget(workspaceId);
  const have = new Set(budget.lines.map((l) => l.category.toLowerCase()));
  const added = [...budget.lines];
  for (const env of BUDGET_ENVELOPES) {
    if (have.has(env.id.toLowerCase())) continue;
    const pathId = Object.keys(pathChoices).find((k) => envelopeForPath(k) === env.id);
    const choice = pathId ? pathChoices[pathId] : "undecided";
    const pathChoice =
      choice === "hire" || choice === "diy" ? (choice as BudgetLine["path"]) : "undecided";
    added.push({
      id: randomUUID(),
      category: env.id,
      label: env.id,
      planned: Math.round((total * env.pct) / 100),
      actual: 0,
      path: pathChoice,
    });
  }
  return saveBudget(workspaceId, { overallLimit: budget.overallLimit || total, lines: added });
}
