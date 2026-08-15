import { NextResponse } from "next/server";
import { requireCoupleApi } from "@/lib/auth/access";
import { getVendor, updateVendor } from "@/lib/data/vendors-store";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  const { id } = await context.params;
  const vendor = await getVendor(id);
  if (!vendor) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ vendor });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  const { id } = await context.params;
  const body = await request.json();
  const vendor = await updateVendor(id, body);
  if (!vendor) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ vendor });
}
