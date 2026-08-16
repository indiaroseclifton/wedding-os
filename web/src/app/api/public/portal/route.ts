import { NextResponse } from "next/server";
import { getPackageByToken, markReceived } from "@/lib/data/handoffs-store";
import { addSlotComment, confirmSlot, getDayOf } from "@/lib/data/dayof-store";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const token = String(body.token || "");
  const pkg = await getPackageByToken(token);
  if (!pkg) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (body.action === "ack") {
    const next = await markReceived(token, String(body.name || pkg.recipientName || "Vendor"));
    return NextResponse.json({ ok: true, receivedAt: next?.receivedAt });
  }
  if (body.action === "comment") {
    await addSlotComment(
      pkg.workspaceId,
      String(body.slotId),
      String(body.author || pkg.recipientName || "Vendor"),
      String(body.body || "")
    );
    return NextResponse.json({ ok: true });
  }
  if (body.action === "confirm") {
    const who = String(body.who || pkg.recipientName || "Vendor");
    await confirmSlot(pkg.workspaceId, String(body.slotId), who);
    return NextResponse.json({ ok: true });
  }
  const dayOf = await getDayOf(pkg.workspaceId);
  return NextResponse.json({ dayOf });
}
