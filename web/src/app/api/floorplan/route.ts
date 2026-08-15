import { NextResponse } from "next/server";
import { requireCoupleApi } from "@/lib/auth/access";
import { ensureDemoWorkspace, getWorkspaceTables } from "@/lib/data/workspace";
import { getFloorPlan, savePositions } from "@/lib/data/floorplan-store";

export async function GET() {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  const { workspace } = await ensureDemoWorkspace();
  const [floor, tables] = await Promise.all([
    getFloorPlan(workspace.id),
    getWorkspaceTables(workspace.id),
  ]);
  return NextResponse.json({ floor, tables });
}

export async function POST(request: Request) {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  const body = await request.json();
  const { workspace } = await ensureDemoWorkspace();
  const positions = Array.isArray(body.positions) ? body.positions : [];
  const floor = await savePositions(workspace.id, positions);
  return NextResponse.json({ floor });
}
