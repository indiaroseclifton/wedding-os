import { NextResponse } from "next/server";
import { requireCoupleApi } from "@/lib/auth/access";
import { ensureDemoWorkspace } from "@/lib/data/workspace";
import {
  addBudgetLine,
  deleteBudgetLine,
  getBudget,
  saveBudget,
  seedBudgetEnvelopes,
  updateBudgetLine,
} from "@/lib/data/budget-store";
import { listPayments } from "@/lib/data/payments-store";
import { listVendors } from "@/lib/data/vendors-store";
import { diyEstimate, getDiy } from "@/lib/data/diy-store";
import { getStudio } from "@/lib/data/studio-store";
import { projectCost } from "@/lib/studio-project";
import { getPath } from "@/lib/data/path-store";
import { requiredString, ValidationError } from "@/lib/validation";
import { BUDGET_ENVELOPES, envelopeForVendor } from "@/lib/budget-envelopes";
import { suggestPhase, type BudgetAlternative, type BudgetPhaseId } from "@/lib/budget-plan";

function rollup(
  budget: Awaited<ReturnType<typeof getBudget>>,
  payments: Awaited<ReturnType<typeof listPayments>>,
  diy: Awaited<ReturnType<typeof getDiy>>,
  studioSpend: number,
) {
  const vendorPaid = payments.filter((p) => p.status === "PAID").reduce((s, p) => s + (p.amount || 0), 0);
  const vendorOpen = payments.filter((p) => p.status !== "PAID").reduce((s, p) => s + (p.amount || 0), 0);
  const linesPlanned = budget.lines.reduce((s, l) => s + (l.planned || 0), 0);
  const linesActual = budget.lines.reduce((s, l) => s + (l.actual || 0), 0);
  const diyEst = Math.round(diyEstimate(diy));
  const studio = Math.round(studioSpend);
  const making = Math.max(diyEst, studio);
  const spent = vendorPaid + linesActual;
  const committed = vendorPaid + vendorOpen + making + Math.max(0, linesPlanned - linesActual);
  return {
    vendorPaid,
    vendorOpen,
    vendorAll: vendorPaid + vendorOpen,
    diyEst: making,
    studioSpend: studio,
    linesPlanned,
    linesActual,
    spent,
    inPlay: committed,
    cap: budget.overallLimit || 0,
    remaining: budget.overallLimit ? budget.overallLimit - committed : null,
  };
}

function envelopes(
  budget: Awaited<ReturnType<typeof getBudget>>,
  payments: Awaited<ReturnType<typeof listPayments>>,
  vendors: { id: string; name: string; category: string }[],
) {
  const byId = new Map(vendors.map((v) => [v.id, v]));
  return BUDGET_ENVELOPES.map((env) => {
    const lines = budget.lines.filter((l) => l.category === env.id);
    const planned = lines.reduce((s, l) => s + (l.planned || 0), 0);
    const lineActual = lines.reduce((s, l) => s + (l.actual || 0), 0);
    const pay = payments.filter((p) => {
      const v = p.vendorId ? byId.get(p.vendorId) : undefined;
      return envelopeForVendor(p.vendorName, v?.category) === env.id;
    });
    const paid = pay.filter((p) => p.status === "PAID").reduce((s, p) => s + p.amount, 0);
    const open = pay.filter((p) => p.status !== "PAID").reduce((s, p) => s + p.amount, 0);
    const spent = lineActual + paid;
    return {
      id: env.id,
      hint: env.hint,
      typicalPct: env.pct,
      planned,
      spent,
      open,
      remaining: planned - spent - open,
    };
  });
}

async function pack() {
  const { workspace } = await ensureDemoWorkspace();
  const [budget, payments, diy, path, vendors, studio] = await Promise.all([
    getBudget(workspace.id),
    listPayments(workspace.id),
    getDiy(workspace.id),
    getPath(workspace.id),
    listVendors(workspace.id),
    getStudio(workspace.id),
  ]);
  const studioSpend = studio.projects.reduce((s, p) => s + projectCost(p), 0);
  const numbers = rollup(budget, payments, diy, studioSpend);
  const phase =
    budget.phase ||
    suggestPhase({
      budget: numbers.cap,
      now: numbers.spent,
      agreed: numbers.inPlay,
      lineCount: budget.lines.length,
    });
  const upcoming = payments
    .filter((p) => p.status !== "PAID")
    .sort((a, b) => (a.dueDate || "9999").localeCompare(b.dueDate || "9999"))
    .slice(0, 5);
  return {
    budget,
    payments,
    path: path.choices,
    upcoming,
    envelopes: envelopes(budget, payments, vendors),
    rollup: numbers,
    phase,
    alternatives: budget.alternatives || [],
  };
}

export async function GET() {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  return NextResponse.json(await pack());
}

export async function POST(request: Request) {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  try {
    const body = await request.json();
    const { workspace } = await ensureDemoWorkspace();
    if (body.action === "add_line") {
      const label = requiredString(body.label, "Label", 120);
      await addBudgetLine(workspace.id, {
        category: body.category || "Other",
        label,
        planned: body.planned,
        actual: body.actual,
        hireEstimate: body.hireEstimate,
        diyEstimate: body.diyEstimate,
        path: body.path,
        who: body.who,
      });
      return NextResponse.json(await pack());
    }
    if (body.action === "update_line") {
      await updateBudgetLine(workspace.id, String(body.id), {
        category: body.category,
        label: body.label,
        planned: body.planned == null ? undefined : Number(body.planned) || 0,
        actual: body.actual == null ? undefined : Number(body.actual) || 0,
        hireEstimate: body.hireEstimate == null ? undefined : Number(body.hireEstimate) || 0,
        diyEstimate: body.diyEstimate == null ? undefined : Number(body.diyEstimate) || 0,
        path: body.path,
        who: body.who,
      });
      return NextResponse.json(await pack());
    }
    if (body.action === "delete_line") {
      await deleteBudgetLine(workspace.id, String(body.id));
      return NextResponse.json(await pack());
    }
    if (body.action === "set_limit") {
      await saveBudget(workspace.id, {
        overallLimit:
          body.overallLimit === "" || body.overallLimit == null ? undefined : Number(body.overallLimit) || 0,
      });
      return NextResponse.json(await pack());
    }
    if (body.action === "set_phase") {
      await saveBudget(workspace.id, { phase: body.phase as BudgetPhaseId });
      return NextResponse.json(await pack());
    }
    if (body.action === "save_alternatives") {
      const alternatives = (body.alternatives || []) as BudgetAlternative[];
      await saveBudget(workspace.id, { alternatives });
      return NextResponse.json(await pack());
    }
    if (body.action === "keep_plan") {
      const current = await getBudget(workspace.id);
      const alternatives = (body.alternatives || current.alternatives || []) as BudgetAlternative[];
      await saveBudget(workspace.id, { alternatives });
      return NextResponse.json(await pack());
    }
    if (body.action === "set_envelopes") {
      const current = await getBudget(workspace.id);
      const planned = (body.planned || {}) as Record<string, number>;
      const lines = current.lines.map((line) =>
        planned[line.category] == null ? line : { ...line, planned: Number(planned[line.category]) || 0 },
      );
      await saveBudget(workspace.id, { lines });
      return NextResponse.json(await pack());
    }
    if (body.action === "seed") {
      const path = await getPath(workspace.id);
      const current = await getBudget(workspace.id);
      const total = Number(body.overallLimit || current.overallLimit) || 0;
      if (!total) return NextResponse.json({ error: "Set the budget first" }, { status: 400 });
      await seedBudgetEnvelopes(workspace.id, total, path.choices);
      return NextResponse.json(await pack());
    }
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
