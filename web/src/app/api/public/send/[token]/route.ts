import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getSendByToken, markSendReceived, patchSendByToken } from "@/lib/data/sends-store";
import { addSlotComment, confirmSlot } from "@/lib/data/dayof-store";
import { appendVendorInquiry, getVendor } from "@/lib/data/vendors-store";
import { defaultNeeds } from "@/lib/send/needs";
import { isAttachmentId, type AttachmentId } from "@/lib/send/attachments";

async function log(vendorId: string, body: string) {
  await appendVendorInquiry(vendorId, { direction: "in", body });
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ token: string }> }
) {
  const { token } = await context.params;
  const send = await getSendByToken(token);
  if (!send || send.status !== "SENT") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ send });
}

export async function POST(
  request: Request,
  context: { params: Promise<{ token: string }> }
) {
  const { token } = await context.params;
  const existing = await getSendByToken(token);
  if (!existing || existing.status !== "SENT") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const body = await request.json().catch(() => ({}));
  const action = String(body.action || "ack");
  const name = (typeof body.name === "string" ? body.name : existing.receivedName || "Vendor").slice(0, 80);

  if (action === "ack") {
    const row = await markSendReceived(token, name);
    await log(existing.vendorId, `${name} has this packet`);
    return NextResponse.json({ ok: true, send: row });
  }

  if (action === "confirm") {
    const slotId = String(body.slotId || "");
    const title = String(body.title || "cue").slice(0, 120);
    if (!slotId) return NextResponse.json({ error: "Need a cue" }, { status: 400 });
    await confirmSlot(existing.workspaceId, slotId, name);
    const row = await patchSendByToken(token, (s) => {
      s.receivedAt = s.receivedAt || new Date().toISOString();
      s.receivedName = s.receivedName || name;
      s.lastConfirmed = { slotId, title, at: new Date().toISOString(), who: name };
    });
    await log(existing.vendorId, `${name} confirmed ${title}`);
    return NextResponse.json({ ok: true, send: row });
  }

  if (action === "comment") {
    const slotId = String(body.slotId || "");
    if (!slotId) return NextResponse.json({ error: "Need a cue" }, { status: 400 });
    const text = String(body.body || "").slice(0, 500);
    await addSlotComment(existing.workspaceId, slotId, name, text);
    await log(existing.vendorId, `${name} on a cue: ${text}`);
    return NextResponse.json({ ok: true });
  }

  if (action === "question") {
    const text = String(body.body || "").trim().slice(0, 500);
    if (!text) return NextResponse.json({ error: "Write a question" }, { status: 400 });
    const section = isAttachmentId(String(body.section || ""))
      ? (String(body.section) as AttachmentId)
      : undefined;
    const row = await patchSendByToken(token, (s) => {
      s.questions = [
        ...(s.questions || []),
        { id: randomUUID(), from: name, body: text, at: new Date().toISOString(), section },
      ];
    });
    await log(existing.vendorId, `Asked${section ? ` (${section})` : ""}: ${text}`);
    return NextResponse.json({ ok: true, send: row });
  }

  if (action === "need") {
    const needId = String(body.needId || "");
    const vendor = await getVendor(existing.vendorId);
    const row = await patchSendByToken(token, (s) => {
      if (!s.needs?.length) s.needs = defaultNeeds(vendor?.category || "");
      s.needs = (s.needs || []).map((n) =>
        n.id === needId
          ? {
              ...n,
              done: body.done !== false,
              fileUrl: typeof body.fileUrl === "string" ? body.fileUrl : n.fileUrl,
              fileName: typeof body.fileName === "string" ? body.fileName : n.fileName,
            }
          : n
      );
    });
    const need = row?.needs?.find((n) => n.id === needId);
    if (need) {
      await log(
        existing.vendorId,
        need.fileName
          ? `${name} attached ${need.fileName} for ${need.label}`
          : `${name} ${need.done ? "did" : "reopened"}: ${need.label}`
      );
    }
    return NextResponse.json({ ok: true, send: row });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
