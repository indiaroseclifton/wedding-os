import { NextResponse } from "next/server";
import { requireCoupleApi } from "@/lib/auth/access";
import { ensureDemoWorkspace } from "@/lib/data/workspace";
import { getVendor, listVendors } from "@/lib/data/vendors-store";
import { listSends, upsertSend, markSendShared, answerQuestion } from "@/lib/data/sends-store";
import { defaultAttachments, isAttachmentId, type AttachmentId } from "@/lib/send/attachments";
import { assemblePacket, sendHref, tickHandoffChecklist } from "@/lib/send/assemble";
import { sendAppEmail, requestOrigin } from "@/lib/email/send";

export async function GET() {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  const { workspace } = await ensureDemoWorkspace();
  const [vendors, sends] = await Promise.all([listVendors(workspace.id), listSends(workspace.id)]);
  return NextResponse.json({ vendors, sends });
}

export async function POST(request: Request) {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  const { workspace } = await ensureDemoWorkspace();
  const body = await request.json().catch(() => ({}));
  const vendorId = String(body.vendorId || "");
  if (body.action === "answer") {
    const sendId = String(body.sendId || "");
    const questionId = String(body.questionId || "");
    const answer = String(body.answer || "").slice(0, 500);
    const row = await answerQuestion(workspace.id, sendId, questionId, answer);
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ send: row });
  }
  const vendor = await getVendor(vendorId);
  if (!vendor || vendor.workspaceId !== workspace.id) {
    return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
  }
  const attachments = Array.isArray(body.attachments)
    ? (body.attachments as string[]).filter(isAttachmentId)
    : defaultAttachments(vendor.category);
  const note = typeof body.note === "string" ? body.note : undefined;
  const action = body.action === "send" ? "send" : "save";

  const row = await upsertSend({
    workspaceId: workspace.id,
    vendorId: vendor.id,
    category: vendor.category,
    attachments,
    note,
  });

  if (action !== "send") {
    return NextResponse.json({ send: row, sharePath: sendHref(row) });
  }

  const email = String(body.email || vendor.email || "").trim();
  let emailed = false;
  let emailError: string | undefined;
  if (email.includes("@")) {
    const origin = requestOrigin(request);
    const url = `${origin}${sendHref(row)}`;
    const packet = await assemblePacket(workspace.id, vendor, attachments as AttachmentId[]);
    const lines = packet.readiness
      .filter((r) => attachments.includes(r.id))
      .map((r) => `• ${r.label} — ${r.hint}`)
      .join("\n");
    const sent = await sendAppEmail({
      to: email,
      subject: `${packet.couple} — your packet`,
      text: `Hi ${vendor.name},\n\n${packet.couple} sent you the packet for ${packet.datePretty || "the wedding"}${packet.location ? ` in ${packet.location}` : ""}.\n\n${url}\n\nInside:\n${lines}${note ? `\n\n${note}` : ""}\n\nSame link if they send again.`,
      html: `<div style="font-family:Georgia,serif;line-height:1.5;color:#1c1b19">
        <p>Hi ${escapeHtml(vendor.name)},</p>
        <p>${escapeHtml(packet.couple)} sent you the packet${packet.datePretty ? ` for ${escapeHtml(packet.datePretty)}` : ""}${packet.location ? ` in ${escapeHtml(packet.location)}` : ""}.</p>
        <p><a href="${url}">Open your packet</a></p>
        <p style="font-size:14px;color:#5c5852">Inside:<br/>${escapeHtml(lines).replace(/\n/g, "<br/>")}</p>
        ${note ? `<p>${escapeHtml(note)}</p>` : ""}
        <p style="font-size:13px;color:#8a857c">Same link if they send again.</p>
      </div>`,
    });
    if (sent.ok) emailed = true;
    else emailError = sent.error;
  }

  const shared = await markSendShared(row.id, email || undefined, emailed);
  await tickHandoffChecklist(vendor);

  return NextResponse.json({
    send: shared || row,
    sharePath: sendHref(shared || row),
    emailed,
    emailError,
    sentTo: email || undefined,
  });
}

function escapeHtml(s: string) {
  return s.replace(/&/g, "&").replace(/</g, "<").replace(/>/g, ">");
}
