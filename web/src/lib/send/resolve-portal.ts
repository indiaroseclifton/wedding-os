import { getPackageByToken } from "@/lib/data/handoffs-store";
import { getSendByToken, getSendForVendor, markSendShared, upsertSend } from "@/lib/data/sends-store";
import { listVendors } from "@/lib/data/vendors-store";
import { matchVendorToPackage, packageNoteText } from "./handoff-notes";

/** Old /p links become the live /v packet. */
export async function resolvePortalToken(token: string): Promise<string | null> {
  const send = await getSendByToken(token);
  if (send) return send.status === "SENT" ? send.token : null;

  const pkg = await getPackageByToken(token);
  if (!pkg) return null;
  const vendors = await listVendors(pkg.workspaceId);
  const vendor = matchVendorToPackage(vendors, pkg);
  if (!vendor) return null;

  const existing = await getSendForVendor(pkg.workspaceId, vendor.id);
  const note = packageNoteText(pkg);
  const row = await upsertSend({
    workspaceId: pkg.workspaceId,
    vendorId: vendor.id,
    category: vendor.category,
    attachments: existing?.attachments,
    note: existing?.note,
    handoffNote: note || existing?.handoffNote,
  });
  if (row.status !== "SENT") {
    await markSendShared(row.id, pkg.recipientEmail);
  }
  return row.token;
}
