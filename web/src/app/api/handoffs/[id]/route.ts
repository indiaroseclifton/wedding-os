import { NextResponse } from "next/server";
import { requireCoupleApi } from "@/lib/auth/access";
import { getPackage, updatePackage } from "@/lib/data/handoffs-store";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  const { id } = await context.params;
  const pkg = await getPackage(id);
  if (!pkg) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ package: pkg });
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
  for (const key of ["title", "recipientName", "recipientEmail", "sections"] as const) {
    if (key in body) patch[key] = body[key];
  }
  const pkg = await updatePackage(id, patch as Parameters<typeof updatePackage>[1]);
  if (!pkg) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ package: pkg });
}
