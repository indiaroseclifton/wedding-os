import { NextResponse } from "next/server";
import { requireCoupleApi } from "@/lib/auth/access";
import {
  DEMO_USERS,
  addTask,
  ensureDemoWorkspace,
  getWorkspaceDecisions,
} from "@/lib/data/workspace";

export async function POST(request: Request) {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  try {
    const body = await request.json();
    const decisionId = String(body.decisionId || "");
    const { workspace } = await ensureDemoWorkspace();
    const decisions = await getWorkspaceDecisions(workspace.id);
    const decision = decisions.find((d) => d.id === decisionId);
    if (!decision) {
      return NextResponse.json({ error: "Decision not found" }, { status: 404 });
    }
    const task = await addTask({
      workspaceId: workspace.id,
      title: `Follow up: ${decision.title}`,
      description: decision.summary || "Next actions from this decision.",
      ownerId: access.session.userId || DEMO_USERS.alex.id,
      ownerName: access.session.name || DEMO_USERS.alex.name,
      decisionId: decision.id,
    });
    return NextResponse.json({ task });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
