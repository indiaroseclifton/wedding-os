import { NextResponse } from "next/server";
import { requireCoupleApi } from "@/lib/auth/access";
import { getTableById, patchTable, removeTable } from "@/lib/data/workspace";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  const { id } = await context.params;
  const table = await getTableById(id);
  if (!table) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ table });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  const { id } = await context.params;
  const body = await request.json();
  const patch: Record<string, unknown> = {};
  for (const key of ["name", "capacity", "shape", "notes", "sortOrder"] as const) {
    if (key in body) patch[key] = body[key];
  }
  const table = await patchTable(id, patch as Parameters<typeof patchTable>[1]);
  if (!table) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ table });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  const { id } = await context.params;
  const ok = await removeTable(id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
