import { NextResponse } from "next/server";
import { requireCoupleApi } from "@/lib/auth/access";
import { ensureDemoWorkspace } from "@/lib/data/workspace";
import { addBudgetLine, getBudget, saveBudget } from "@/lib/data/budget-store";
import { requiredString, ValidationError } from "@/lib/validation";

export async function GET() {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  const { workspace } = await ensureDemoWorkspace();
  const budget = await getBudget(workspace.id);
  return NextResponse.json({ budget });
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
      });
      return NextResponse.json({ budget });
    }
    if (body.action === "set_limit") {
      const budget = await saveBudget(workspace.id, {
        overallLimit: Number(body.overallLimit) || undefined,
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
