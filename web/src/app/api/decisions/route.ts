import { NextResponse } from "next/server";
import { requireCoupleApi } from "@/lib/auth/access";
import {
  DEMO_USERS,
  addTask,
  createDecision,
  ensureDemoWorkspace,
  getWorkspaceDecisions,
} from "@/lib/data/workspace";
import { updateDecision } from "@/lib/data/store";
import { addTimelineItem } from "@/lib/data/timeline-store";
import { PLANNER_DECISIONS } from "@/lib/planner-decisions";
import { applyDecisionEffects } from "@/lib/planner-effects";
import { requiredString, optionalString, ValidationError } from "@/lib/validation";

export async function GET() {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  const { workspace } = await ensureDemoWorkspace();
  const saved = await getWorkspaceDecisions(workspace.id);
  return NextResponse.json({ decisions: saved, catalog: PLANNER_DECISIONS });
}

export async function POST(request: Request) {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  try {
    const body = await request.json();
    const { workspace } = await ensureDemoWorkspace();
    const ownerId = access.session.userId || DEMO_USERS.alex.id;
    const ownerName = access.session.name || DEMO_USERS.alex.name;

    if (body.action === "create") {
      const decision = await createDecision({
        workspaceId: workspace.id,
        type: "CUSTOM",
        title: requiredString(body.title, "Title", 160),
        status: "OPEN",
        summary: optionalString(body.summary, 400) || "",
        payload: { answer: "", notes: body.notes || "" },
        participantIds: [ownerId],
      });
      return NextResponse.json({ decision });
    }

    if (body.action === "from_catalog") {
      const item = PLANNER_DECISIONS.find((d) => d.id === body.catalogId);
      if (!item) return NextResponse.json({ error: "Unknown prompt" }, { status: 404 });
      const existing = (await getWorkspaceDecisions(workspace.id)).find(
        (d) => d.payload?.catalogId === item.id
      );
      if (existing) return NextResponse.json({ decision: existing });
      const decision = await createDecision({
        workspaceId: workspace.id,
        type: "CATALOG",
        title: item.title,
        status: "OPEN",
        summary: item.ask,
        payload: { catalogId: item.id, group: item.group, answer: "" },
        participantIds: [ownerId],
      });
      return NextResponse.json({ decision });
    }

    if (body.action === "save") {
      const id = String(body.id || "");
      const status = ["OPEN", "EXPLORING", "DECIDED"].includes(body.status) ? body.status : undefined;
      const answer = typeof body.answer === "string" ? body.answer.slice(0, 400) : undefined;
      const current = (await getWorkspaceDecisions(workspace.id)).find((d) => d.id === id);
      if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });
      const decision = await updateDecision(id, {
        status: status || current.status,
        summary: answer || current.summary,
        payload: { ...current.payload, answer: answer ?? current.payload?.answer },
      });
      const catalogId = String(decision?.payload?.catalogId || current.payload?.catalogId || "");
      const decided = (status || current.status) === "DECIDED";
      const effects =
        decided && catalogId
          ? await applyDecisionEffects(workspace.id, catalogId, String(answer ?? current.payload?.answer ?? ""))
          : { wrote: [] as string[] };
      let task = null;
      let timelineItem = null;
      if (body.promote && decision) {
        task = await addTask({
          workspaceId: workspace.id,
          title: `Do: ${decision.title}`,
          description: String(decision.payload?.answer || decision.summary || ""),
          ownerId,
          ownerName,
          decisionId: decision.id,
        });
        timelineItem = await addTimelineItem({
          workspaceId: workspace.id,
          title: decision.title,
          when: decision.status === "DECIDED" ? "Locked" : "Decide",
          category: "Decision",
          notes: String(decision.payload?.answer || ""),
        });
      }
      return NextResponse.json({ decision, task, timelineItem, effects });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e) {
    if (e instanceof ValidationError) return NextResponse.json({ error: e.message }, { status: 400 });
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
