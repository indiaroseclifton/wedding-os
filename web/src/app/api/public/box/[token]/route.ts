import { NextResponse } from "next/server";
import { findBoxByToken, toggleBoxItem } from "@/lib/data/inventory-store";

export async function GET(
  _request: Request,
  context: { params: Promise<{ token: string }> }
) {
  const { token } = await context.params;
  const found = await findBoxByToken(token);
  if (!found) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ box: found.box });
}

export async function POST(
  request: Request,
  context: { params: Promise<{ token: string }> }
) {
  const { token } = await context.params;
  const found = await findBoxByToken(token);
  if (!found) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const body = await request.json().catch(() => ({}));
  const itemId = String(body.itemId || "");
  if (!itemId) return NextResponse.json({ error: "No item" }, { status: 400 });
  await toggleBoxItem(found.workspaceId, found.box.id, itemId);
  const next = await findBoxByToken(token);
  return NextResponse.json({ box: next?.box });
}
