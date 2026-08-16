import { NextResponse } from "next/server";
import { requireCoupleApi } from "@/lib/auth/access";
import { ensureDemoWorkspace } from "@/lib/data/workspace";
import {
  addBudgetLine,
  deleteBudgetLine,
  getBudget,
  saveBudget,
  updateBudgetLine,
} from "@/lib/data/budget-store";
import { listPayments } from "@/lib/data/payments-store";
import { diyEstimate, getDiy } from "@/lib/data/diy-store";
import { requiredString, ValidationError } from "@/lib/validation";

function rollup(
  budget: Awaited<ReturnType<typeof getBudget>>,
  payments: Awaited<ReturnType<typeof listPayments>>,
  diy: Awaited<ReturnType<typeof getDiy>>
) {
  const vendorPaid = payments.filter((p) => p.status === "PAID").reduce((s, p) => s + (p.amount || 0), 0);
  const vendorOpen = payments.filter((p) => p.status !== "PAID").reduce((s, p) => s + (p.amount || 0), 0);
  const linesPlanned = budget.lines.reduce((s, l) => s + (l.planned || 0), 0);
  const linesActual = budget.lines.reduce((s, l) => s + (l.actual || 0), 0);
  const diyEst = Math.round(diyEstimate(diy));
  const inPlay = vendorPaid + vendorOpen + diyEst + linesPlanned;
  return {
    vendorPaid,
    vendorOpen,
    vendorAll: vendorPaid + vendorOpen,
    diyEst,
    linesPlanned,
    linesActual,
    inPlay,
    cap: budget.overallLimit || 0,
    remaining: budget.overallLimit ? budget.overallLimit - inPlay : null,
  };
}

export async function GET() {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  const { workspace } = await ensureDemoWorkspace();
  const [budget, payments, diy] = await Promise.all([
    getBudget(workspace.id),
    listPayments(workspace.id),
    getDiy(workspace.id),
  ]);
  return NextResponse.json({ budget, payments, rollup: rollup(budget, payments, diy) });
}

export async function POST(request: Request) {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  try {
    const body = await request.json();
    const { workspace } = await ensureDemoWorkspace();
    if (body.action === "add_line") {
      const label = requiredString(body.label, "Label", 120);
      const budget = await addBudgetLine(workspace.id, {
        category: body.category || "General",
        label,
        planned: body.planned,
        actual: body.actual,
        hireEstimate: body.hireEstimate,
        diyEstimate: body.diyEstimate,
        path: body.path,
      });
      return NextResponse.json({ budget });
    }
    if (body.action === "update_line") {
      const budget = await updateBudgetLine(workspace.id, String(body.id), {
        category: body.category,
        label: body.label,
        planned: body.planned == null ? undefined : Number(body.planned) || 0,
        actual: body.actual == null ? undefined : Number(body.actual) || 0,
        hireEstimate: body.hireEstimate == null ? undefined : Number(body.hireEstimate) || 0,
        diyEstimate: body.diyEstimate == null ? undefined : Number(body.diyEstimate) || 0,
        path: body.path,
      });
      return NextResponse.json({ budget });
    }
    if (body.action === "delete_line") {
      const budget = await deleteBudgetLine(workspace.id, String(body.id));
      return NextResponse.json({ budget });
    }
    if (body.action === "set_limit") {
      const budget = await saveBudget(workspace.id, {
        overallLimit: body.overallLimit === "" || body.overallLimit == null
          ? undefined
          : Number(body.overallLimit) || 0,
      });
      return NextResponse.json({ budget });
    }
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
