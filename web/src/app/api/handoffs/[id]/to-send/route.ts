import { NextResponse } from "next/server";
import { requireCoupleApi } from "@/lib/auth/access";
import { ensureDemoWorkspace } from "@/lib/data/workspace";
import { getPackage } from "@/lib/data/handoffs-store";
import { listVendors } from "@/lib/data/vendors-store";
import { getSendForVendor, upsertSend } from "@/lib/data/sends-store";
import { matchVendorToPackage, packageNoteText } from "@/lib/send/handoff-notes";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  const { workspace } = await ensureDemoWorkspace();
  const { id } = await context.params;
  const pkg = await getPackage(id);
  if (!pkg || pkg.workspaceId !== workspace.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const vendors = await listVendors(workspace.id);
  const vendor = matchVendorToPackage(vendors, pkg);
  if (!vendor) {
    return NextResponse.json({ error: "No matching vendor. Open Send and pick them." }, { status: 400 });
  }
  const existing = await getSendForVendor(workspace.id, vendor.id);
  const send = await upsertSend({
    workspaceId: workspace.id,
    vendorId: vendor.id,
    category: vendor.category,
    attachments: existing?.attachments,
    handoffNote: packageNoteText(pkg),
  });
  return NextResponse.json({ ok: true, vendorId: vendor.id, sendId: send.id });
}
