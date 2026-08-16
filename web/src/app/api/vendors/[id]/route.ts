import { NextResponse } from "next/server";
import { requireCoupleApi } from "@/lib/auth/access";
import { appendVendorInquiry, getVendor, updateVendor } from "@/lib/data/vendors-store";
import { sanitizeContractReview } from "@/lib/data/contract-review";
import {
  listPayments,
  paymentsForVendor,
  patchPayment,
  upsertVendorMilestone,
} from "@/lib/data/payments-store";
import { ensureDemoWorkspace, loadWorkspaceMeta } from "@/lib/data/workspace";
import { seedChecklist } from "@/lib/vendor-checklists";
import { sendInquiryEmails } from "@/lib/email/resend";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  const { id } = await context.params;
  const vendor = await getVendor(id);
  if (!vendor) return NextResponse.json({ error: "Not found" }, { status: 404 });
  let nextVendor = vendor;
  if (!vendor.checklist?.length) {
    nextVendor = (await updateVendor(id, { checklist: seedChecklist(vendor.category) })) || vendor;
  }
  const payments = paymentsForVendor(await listPayments(vendor.workspaceId), vendor);
  return NextResponse.json({ vendor: nextVendor, payments });
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

  if (body.action === "review") {
    const next = await updateVendor(id, {
      contractReview: sanitizeContractReview(body.review),
    });
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

  if (body.action === "note") {
    const next = await appendVendorInquiry(id, {
      direction: body.direction === "in" ? "in" : "out",
      body: String(body.body || ""),
    });
    const payments = paymentsForVendor(await listPayments(workspace.id), vendor);
    return NextResponse.json({ vendor: next, payments });
  }

  if (body.action === "email") {
    const text = String(body.body || "").trim();
    if (!text) return NextResponse.json({ error: "Write a note first" }, { status: 400 });
    const replyEmail = String(body.replyEmail || access.session.email || "").trim();
    const meta = await loadWorkspaceMeta(workspace.id, workspace.name);
    const mailed = await sendInquiryEmails({
      coupleTo: replyEmail,
      vendorTo: vendor.email,
      vendorName: vendor.name,
      coupleName: access.session.name || meta.coupleNames || "The couple",
      weddingName: meta.name || workspace.name,
      date: meta.weddingDate,
      location: meta.location,
      replyEmail,
      message: text,
    });
    const next = await appendVendorInquiry(id, {
      direction: "out",
      body: text,
      emailedAt: mailed.emailedYou || mailed.emailedVendor ? new Date().toISOString() : undefined,
    });
    const payments = paymentsForVendor(await listPayments(workspace.id), vendor);
    return NextResponse.json({
      vendor: next,
      payments,
      emailedYou: mailed.emailedYou,
      emailedVendor: mailed.emailedVendor,
      emailError: mailed.error || undefined,
    });
  }

  if (body.action === "checklist") {
    let list = vendor.checklist?.length ? [...vendor.checklist] : seedChecklist(vendor.category);
    if (body.apply) {
      list = seedChecklist(String(body.category || vendor.category));
    } else if (body.toggleId) {
      list = list.map((i) => (i.id === body.toggleId ? { ...i, done: !i.done } : i));
    } else if (body.add) {
      list = [...list, { id: `c${Date.now()}`, title: String(body.add).slice(0, 200), done: false }];
    }
    const next = await updateVendor(id, { checklist: list });
    const payments = paymentsForVendor(await listPayments(workspace.id), vendor);
    return NextResponse.json({ vendor: next, payments });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

