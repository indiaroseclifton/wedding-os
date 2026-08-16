import path from "path";
import { randomUUID } from "crypto";
import { dataDir, readJson, writeJson } from "./store-io";
import { type AttachmentId, defaultAttachments, isAttachmentId } from "@/lib/send/attachments";

const sendsFile = path.join(dataDir, "sends.json");

export type VendorSend = {
  id: string;
  workspaceId: string;
  vendorId: string;
  token: string;
  attachments: AttachmentId[];
  note?: string;
  status: "DRAFT" | "SENT";
  sentAt?: string;
  sentTo?: string;
  emailedAt?: string;
  receivedAt?: string;
  receivedName?: string;
  createdAt: string;
  updatedAt: string;
};

function cleanAttachments(list?: string[], category?: string): AttachmentId[] {
  const next = (list || []).filter(isAttachmentId);
  if (next.length) return Array.from(new Set(next));
  return defaultAttachments(category || "");
}

export async function listSends(workspaceId: string) {
  return (await readJson<VendorSend>(sendsFile))
    .filter((r) => r.workspaceId === workspaceId)
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
}

export async function getSendForVendor(workspaceId: string, vendorId: string) {
  return (
    (await readJson<VendorSend>(sendsFile)).find(
      (r) => r.workspaceId === workspaceId && r.vendorId === vendorId
    ) ?? null
  );
}

export async function getSendByToken(token: string) {
  return (await readJson<VendorSend>(sendsFile)).find((r) => r.token === token) ?? null;
}

export async function upsertSend(input: {
  workspaceId: string;
  vendorId: string;
  category?: string;
  attachments?: string[];
  note?: string;
}) {
  const rows = await readJson<VendorSend>(sendsFile);
  const now = new Date().toISOString();
  const existing = rows.find((r) => r.workspaceId === input.workspaceId && r.vendorId === input.vendorId);
  const attachments = cleanAttachments(input.attachments, input.category);
  if (existing) {
    existing.attachments = attachments;
    if (input.note !== undefined) existing.note = input.note.slice(0, 800);
    existing.updatedAt = now;
    await writeJson(sendsFile, rows);
    return existing;
  }
  const row: VendorSend = {
    id: randomUUID(),
    workspaceId: input.workspaceId,
    vendorId: input.vendorId,
    token: randomUUID().replace(/-/g, ""),
    attachments,
    note: input.note?.slice(0, 800),
    status: "DRAFT",
    createdAt: now,
    updatedAt: now,
  };
  rows.push(row);
  await writeJson(sendsFile, rows);
  return row;
}

export async function markSendShared(id: string, sentTo?: string, emailed?: boolean) {
  const rows = await readJson<VendorSend>(sendsFile);
  const row = rows.find((r) => r.id === id);
  if (!row) return null;
  const now = new Date().toISOString();
  row.status = "SENT";
  row.sentAt = now;
  if (sentTo) row.sentTo = sentTo;
  if (emailed) row.emailedAt = now;
  row.updatedAt = now;
  await writeJson(sendsFile, rows);
  return row;
}

export async function markSendReceived(token: string, name?: string) {
  const rows = await readJson<VendorSend>(sendsFile);
  const row = rows.find((r) => r.token === token);
  if (!row) return null;
  row.receivedAt = new Date().toISOString();
  row.receivedName = (name || "").trim().slice(0, 80) || row.receivedName || "Vendor";
  row.updatedAt = new Date().toISOString();
  await writeJson(sendsFile, rows);
  return row;
}
