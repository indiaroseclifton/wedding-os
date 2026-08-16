import { NextResponse } from "next/server";
import { requireCoupleApi } from "@/lib/auth/access";
import { ensureDemoWorkspace } from "@/lib/data/workspace";
import { getDietary, saveDietary } from "@/lib/data/dietary-store";

export async function GET() {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  const { workspace } = await ensureDemoWorkspace();
  return NextResponse.json({ dietary: await getDietary(workspace.id) });
}

export async function POST(request: Request) {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  const { workspace } = await ensureDemoWorkspace();
  const body = await request.json();
  const dietary = await saveDietary(workspace.id, {
    packOut: String(body.packOut || "").slice(0, 120),
    fridge: String(body.fridge || "").slice(0, 120),
    leftoverTo: String(body.leftoverTo || "").slice(0, 120),
    donate: String(body.donate || "").slice(0, 200),
    notes: String(body.notes || "").slice(0, 800),
  });
  return NextResponse.json({ dietary });
}
