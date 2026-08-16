import { NextResponse } from "next/server";
import { requireCoupleApi } from "@/lib/auth/access";
import { appleDeveloperToken, appleMusicConfigured } from "@/lib/integrations/apple-music";

export async function GET() {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  if (!appleMusicConfigured()) {
    return NextResponse.json({ error: "Apple Music isn’t set up on this project yet" }, { status: 400 });
  }
  try {
    return NextResponse.json({ token: appleDeveloperToken() });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Token failed" }, { status: 500 });
  }
}
