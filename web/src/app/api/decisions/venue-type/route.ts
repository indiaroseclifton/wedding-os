import { NextResponse } from "next/server";
import { requireCoupleApi } from "@/lib/auth/access";
import {
  DEMO_USERS,
  ensureDemoWorkspace,
  saveVenueTypeDecision,
} from "@/lib/data/workspace";

export async function POST(request: Request) {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  try {
    const body = await request.json();
    const { workspace } = await ensureDemoWorkspace();
    const decision = await saveVenueTypeDecision({
      workspaceId: workspace.id,
      status: body.status === "DECIDED" ? "DECIDED" : "EXPLORING",
      summary: body.summary || "Venue type",
      payload: body.payload || {},
      participantIds: [DEMO_USERS.alex.id, DEMO_USERS.jordan.id],
    });
    return NextResponse.json({ decision });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to save venue type" }, { status: 500 });
  }
}
