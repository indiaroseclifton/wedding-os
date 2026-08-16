import { NextResponse } from "next/server";
import { requireCoupleApi } from "@/lib/auth/access";
import { ensureDemoWorkspace } from "@/lib/data/workspace";
import {
  addPayment,
  deletePayment,
  effectiveStatus,
  listPayments,
  patchPayment,
  paymentRollup,
  type PaymentKind,
} from "@/lib/data/payments-store";
import { getVendor, listVendors } from "@/lib/data/vendors-store";
import { requiredString, optionalString, ValidationError } from "@/lib/validation";

const KINDS = new Set(["DEPOSIT", "PROGRESS", "FINAL", "OTHER"]);

export async function GET() {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  const { workspace } = await ensureDemoWorkspace();
  const [payments, vendors] = await Promise.all([
    listPayments(workspace.id),
    listVendors(workspace.id),
  ]);
  const withStatus = payments.map((p) => ({ ...p, status: effectiveStatus(p) }));
  return NextResponse.json({
    payments: withStatus,
    vendors: vendors.map((v) => ({ id: v.id, name: v.name, category: v.category })),
    rollup: paymentRollup(withStatus),
  });
}

export async function POST(request: Request) {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  try {
    const body = await request.json();
    if (body.action === "status") {
      const payment = await patchPayment(body.id, { status: body.status });
      if (!payment) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json({ payment: { ...payment, status: effectiveStatus(payment) } });
    }
    if (body.action === "update") {
      const payment = await patchPayment(String(body.id), {
        amount: body.amount == null ? undefined : Number(body.amount) || 0,
        dueDate: body.dueDate === undefined ? undefined : optionalString(body.dueDate, 40) ?? "",
        label: body.label == null ? undefined : requiredString(body.label, "Label", 120),
        notes: body.notes === undefined ? undefined : optionalString(body.notes, 2000),
      });
      if (!payment) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json({ payment: { ...payment, status: effectiveStatus(payment) } });
    }
    if (body.action === "receipt") {
      const payment = await patchPayment(String(body.id), {
        receiptUrl: optionalString(body.receiptUrl, 500),
      });
      if (!payment) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json({ payment });
    }
    if (body.action === "delete") {
      const ok = await deletePayment(String(body.id));
      if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json({ ok: true });
    }
    const vendorId = optionalString(body.vendorId, 80);
    let vendorName = "";
    if (vendorId) {
      const vendor = await getVendor(vendorId);
      if (vendor) vendorName = vendor.name;
    }
    if (!vendorName) {
      vendorName = requiredString(body.vendorName, "Vendor", 120);
    }
    const label = requiredString(body.label, "Label", 120);
    const kind = (KINDS.has(body.kind) ? body.kind : undefined) as PaymentKind | undefined;
    const { workspace } = await ensureDemoWorkspace();
    const payment = await addPayment({
      workspaceId: workspace.id,
      vendorId: vendorId || undefined,
      vendorName,
      label,
      amount: Number(body.amount) || 0,
      dueDate: optionalString(body.dueDate, 40),
      contractLink: optionalString(body.contractLink, 500),
      receiptUrl: optionalString(body.receiptUrl, 500),
      notes: optionalString(body.notes, 2000),
      kind,
    });
    if (body.paid) {
      const paid = await patchPayment(payment.id, { status: "PAID" });
      return NextResponse.json({ payment: paid || payment });
    }
    return NextResponse.json({ payment });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
