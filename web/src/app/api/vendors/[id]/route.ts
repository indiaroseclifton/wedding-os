import { NextResponse } from "next/server";
import { requireCoupleApi } from "@/lib/auth/access";
import { getVendor, updateVendor } from "@/lib/data/vendors-store";
import {
  listPayments,
  paymentsForVendor,
  patchPayment,
  upsertVendorMilestone,
} from "@/lib/data/payments-store";
import { ensureDemoWorkspace } from "@/lib/data/workspace";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  const { id } = await context.params;
  const vendor = await getVendor(id);
  if (!vendor) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const payments = paymentsForVendor(await listPayments(vendor.workspaceId), vendor);
  return NextResponse.json({ vendor, payments });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  const { id } = await context.params;
  const body = await request.json();
  const allowed = [
    "name",
    "category",
    "status",
    "contactName",
    "email",
    "phone",
    "website",
    "notes",
    "contractUrl",
  ] as const;
  const patch: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) patch[key] = body[key];
  }
  const vendor = await updateVendor(id, patch);
  if (!vendor) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ vendor });
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  const { id } = await context.params;
  const vendor = await getVendor(id);
  if (!vendor) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const { workspace } = await ensureDemoWorkspace();
  const body = await request.json();

  if (body.action === "money") {
    const contractUrl =
      typeof body.contractUrl === "string" ? body.contractUrl.trim().slice(0, 500) : vendor.contractUrl;
    if (contractUrl !== vendor.contractUrl) {
      await updateVendor(id, { contractUrl: contractUrl || undefined });
    }
    if (body.deposit != null && body.deposit !== "") {
      await upsertVendorMilestone({
        workspaceId: workspace.id,
        vendorId: vendor.id,
        vendorName: vendor.name,
        kind: "DEPOSIT",
        amount: Number(body.deposit) || 0,
        dueDate: body.depositDue || undefined,
        contractLink: contractUrl || undefined,
        status: body.depositPaid ? "PAID" : undefined,
      });
    }
    if (body.final != null && body.final !== "") {
      await upsertVendorMilestone({
        workspaceId: workspace.id,
        vendorId: vendor.id,
        vendorName: vendor.name,
        kind: "FINAL",
        amount: Number(body.final) || 0,
        dueDate: body.finalDue || undefined,
        contractLink: contractUrl || undefined,
        status: body.finalPaid ? "PAID" : undefined,
      });
    }
    const next = await getVendor(id);
    const payments = paymentsForVendor(await listPayments(workspace.id), vendor);
    return NextResponse.json({ vendor: next, payments });
  }

  if (body.action === "pay") {
    const payment = await patchPayment(String(body.paymentId), { status: body.status || "PAID" });
    if (!payment) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (payment.kind === "DEPOSIT" && body.status === "PAID" && vendor.status === "BOOKED") {
      await updateVendor(id, { status: "PAID_DEPOSIT" });
    }
    const next = await getVendor(id);
    const payments = paymentsForVendor(await listPayments(workspace.id), vendor);
    return NextResponse.json({ vendor: next, payments });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
