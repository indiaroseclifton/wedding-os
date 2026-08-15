import { NextResponse } from "next/server";
import { requireCoupleApi } from "@/lib/auth/access";
import {
  DEMO_USERS,
  ensureDemoWorkspace,
  savePrioritiesDecision,
} from "@/lib/data/workspace";

export async function POST(request: Request) {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  try {
    const body = await request.json();
    const { workspace } = await ensureDemoWorkspace();
    const decision = await savePrioritiesDecision({
      workspaceId: workspace.id,
      status: body.status === "DECIDED" ? "DECIDED" : "EXPLORING",
      summary: body.summary || "Priorities",
      payload: body.payload || {},
      participantIds: [DEMO_USERS.alex.id, DEMO_USERS.jordan.id],
    });
    return NextResponse.json({ decision });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to save priorities" }, { status: 500 });
  }
}
