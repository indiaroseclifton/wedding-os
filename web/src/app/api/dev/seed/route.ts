import { NextResponse } from "next/server";
import { requireCoupleApi } from "@/lib/auth/access";
import { resetDemoData, seedDemoIfEmpty } from "@/lib/data/seed-demo";

export async function POST(request: Request) {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  let force = false;
  let action: string | undefined;
  try {
    const body = await request.json();
    force = !!body?.force;
    action = typeof body?.action === "string" ? body.action : undefined;
  } catch {
    // no body is fine
  }
  if (action === "reset") {
    const result = await resetDemoData();
    return NextResponse.json({ ...result, reset: true });
  }
  const result = await seedDemoIfEmpty({ force });
  return NextResponse.json(result);
}
