import { NextResponse } from "next/server";
import { requireCoupleApi } from "@/lib/auth/access";
import { ensureDemoWorkspace } from "@/lib/data/workspace";
import {
  addPayment,
  listPayments,
  patchPayment,
  type PaymentKind,
} from "@/lib/data/payments-store";
import { requiredString, optionalString, ValidationError } from "@/lib/validation";

export async function GET() {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  const { workspace } = await ensureDemoWorkspace();
  const payments = await listPayments(workspace.id);
  return NextResponse.json({ payments });
}

export async function POST(request: Request) {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  try {
    const body = await request.json();
    if (body.action === "status") {
      const payment = await patchPayment(body.id, { status: body.status });
      if (!payment) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json({ payment });
    }
    const vendorName = requiredString(body.vendorName, "Vendor", 120);
    const label = requiredString(body.label, "Label", 120);
    const kind = (["DEPOSIT", "FINAL", "OTHER"].includes(body.kind)
      ? body.kind
      : undefined) as PaymentKind | undefined;
    const { workspace } = await ensureDemoWorkspace();
    const payment = await addPayment({
      workspaceId: workspace.id,
      vendorName,
      label,
      amount: Number(body.amount) || 0,
      dueDate: optionalString(body.dueDate, 40),
      contractLink: optionalString(body.contractLink, 500),
      notes: optionalString(body.notes, 2000),
      kind,
    });
    return NextResponse.json({ payment });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
