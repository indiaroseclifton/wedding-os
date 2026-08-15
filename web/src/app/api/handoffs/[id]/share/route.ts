import { NextResponse } from "next/server";
import { requireCoupleApi } from "@/lib/auth/access";
import { sharePackage } from "@/lib/data/handoffs-store";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  const { id } = await context.params;
  const pkg = await sharePackage(id);
  if (!pkg) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({
    package: pkg,
    sharePath: pkg.shareToken ? `/p/${pkg.shareToken}` : null,
  });
}
