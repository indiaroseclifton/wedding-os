import { NextResponse } from "next/server";
import { requireCoupleApi } from "@/lib/auth/access";
import { getGuestById, patchGuest, removeGuest } from "@/lib/data/workspace";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  const { id } = await context.params;
  const guest = await getGuestById(id);
  if (!guest) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ guest });
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
    "side",
    "partyName",
    "email",
    "rsvp",
    "plusOnes",
    "dietary",
    "meal",
    "tableLabel",
    "notes",
  ] as const;
  const patch: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) patch[key] = body[key];
  }
  const guest = await patchGuest(id, patch);
  if (!guest) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ guest });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  const { id } = await context.params;
  const ok = await removeGuest(id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
