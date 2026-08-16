import { NextResponse } from "next/server";
import { requireCoupleApi } from "@/lib/auth/access";
import {
  ensureDemoWorkspace,
  getWorkspaceGuests,
  getWorkspaceTables,
} from "@/lib/data/workspace";
import { getFloorPlan, saveFloorPlan } from "@/lib/data/floorplan-store";

export async function GET() {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  const { workspace } = await ensureDemoWorkspace();
  const [floor, tables, guests] = await Promise.all([
    getFloorPlan(workspace.id),
    getWorkspaceTables(workspace.id),
    getWorkspaceGuests(workspace.id),
  ]);
  return NextResponse.json({
    floor,
    tables,
    guests: guests
      .filter((g) => g.rsvp !== "NO")
      .map((g) => ({
        id: g.id,
        name: g.name,
        tableLabel: g.tableLabel || null,
        seatIndex: g.seatIndex ?? null,
        dietary: g.dietary || null,
        rsvp: g.rsvp,
        side: g.side || null,
        partyName: g.partyName || null,
        plusOnes: g.plusOnes || 0,
        plusOneNames: g.plusOneNames || [],
      })),
  });
}

export async function POST(request: Request) {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  const body = await request.json();
  const { workspace } = await ensureDemoWorkspace();
  const floor = await saveFloorPlan(workspace.id, {
    positions: Array.isArray(body.positions) ? body.positions : undefined,
    objects: Array.isArray(body.objects) ? body.objects : undefined,
    room: body.room && typeof body.room === "object" ? body.room : undefined,
  });
  return NextResponse.json({ floor });
}
