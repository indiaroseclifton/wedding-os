import { NextResponse } from "next/server";
import { requireCoupleApi } from "@/lib/auth/access";
import { seedDemoIfEmpty } from "@/lib/data/seed-demo";

export async function POST() {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  const result = await seedDemoIfEmpty();
  return NextResponse.json(result);
}
