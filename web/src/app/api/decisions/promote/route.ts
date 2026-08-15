import { NextResponse } from "next/server";
import { requireCoupleApi } from "@/lib/auth/access";
import {
  DEMO_USERS,
  addTask,
  ensureDemoWorkspace,
  getWorkspaceDecisions,
} from "@/lib/data/workspace";
import { addTimelineItem } from "@/lib/data/timeline-store";

/**
 * Promote a decision into operational work:
 * - follow-up task (always if requested)
 * - timeline milestone (always if requested)
 */
export async function POST(request: Request) {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;

  try {
    const body = await request.json();
    const decisionId = String(body.decisionId || "");
    const createTask = body.createTask !== false;
    const createTimeline = body.createTimeline !== false;

    const { workspace } = await ensureDemoWorkspace();
    const decisions = await getWorkspaceDecisions(workspace.id);
    const decision = decisions.find((d) => d.id === decisionId);
    if (!decision) {
      return NextResponse.json({ error: "Decision not found" }, { status: 404 });
    }

    let task = null;
    let timelineItem = null;

    if (createTask) {
      task = await addTask({
        workspaceId: workspace.id,
        title: `Follow up: ${decision.title}`,
        description:
          decision.summary ||
          `Next actions from decision (${decision.status}).`,
        ownerId: access.session.userId || DEMO_USERS.alex.id,
        ownerName: access.session.name || DEMO_USERS.alex.name,
        decisionId: decision.id,
      });
    }

    if (createTimeline) {
      timelineItem = await addTimelineItem({
        workspaceId: workspace.id,
        title: decision.title,
        when: decision.status === "DECIDED" ? "Locked" : "In discussion",
        category: "Decision",
        notes: decision.summary || undefined,
      });
    }

    return NextResponse.json({ ok: true, task, timelineItem, decision });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to promote decision" }, { status: 500 });
  }
}
