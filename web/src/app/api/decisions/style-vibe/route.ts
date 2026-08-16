import { NextResponse } from "next/server";
import { requireCoupleApi } from "@/lib/auth/access";
import {
  DEMO_USERS,
  ensureDemoWorkspace,
  getWorkspaceDecisions,
  saveStyleVibeDecision,
} from "@/lib/data/workspace";

export async function GET() {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  const { workspace } = await ensureDemoWorkspace();
  const decisions = await getWorkspaceDecisions(workspace.id);
  const decision = decisions.find((d) => d.type === "STYLE_VIBE") || null;
  return NextResponse.json({ decision });
}

export async function POST(request: Request) {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  try {
    const body = await request.json();
    const { workspace } = await ensureDemoWorkspace();
    const decision = await saveStyleVibeDecision({
      workspaceId: workspace.id,
      status: body.status === "DECIDED" ? "DECIDED" : "EXPLORING",
      summary: body.summary || "Style & vibe",
      payload: body.payload || {},
      participantIds: [DEMO_USERS.alex.id, DEMO_USERS.jordan.id],
    });
    return NextResponse.json({ decision });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to save style" }, { status: 500 });
  }
}
