import { NextResponse } from "next/server";
import { requireCoupleApi } from "@/lib/auth/access";
import { seedDemoIfEmpty } from "@/lib/data/seed-demo";

export async function POST(request: Request) {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  let force = false;
  try {
    const body = await request.json();
    force = !!body?.force;
  } catch {
    // no body is fine
  }
  const result = await seedDemoIfEmpty({ force });
  return NextResponse.json(result);
}
