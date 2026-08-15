import { NextResponse } from "next/server";
import { requireCoupleApi } from "@/lib/auth/access";
import {
  deleteTimelineItem,
  patchTimelineItem,
} from "@/lib/data/timeline-store";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  const { id } = await context.params;
  const body = await request.json();
  const item = await patchTimelineItem(id, body);
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ item });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  const { id } = await context.params;
  const ok = await deleteTimelineItem(id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
