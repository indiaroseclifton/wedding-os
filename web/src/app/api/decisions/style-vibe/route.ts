import { NextResponse } from "next/server";
import { requireCoupleApi } from "@/lib/auth/access";
import {
  DEMO_USERS,
  ensureDemoWorkspace,
  getWorkspaceDecisions,
  saveStyleVibeDecision,
  updateWorkspaceMeta,
} from "@/lib/data/workspace";
import { applyVisionSteering } from "@/lib/vision-steer";
import { mergeVision, normalizeVision, visionSummary } from "@/lib/vision";

export async function GET() {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  const { workspace } = await ensureDemoWorkspace();
  const decisions = await getWorkspaceDecisions(workspace.id);
  const raw = decisions.find((d) => d.type === "STYLE_VIBE") || null;
  const decision = raw ? { ...raw, payload: normalizeVision(raw.payload) } : null;
  return NextResponse.json({ decision });
}

export async function POST(request: Request) {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  try {
    const body = await request.json();
    const { workspace } = await ensureDemoWorkspace();
    const decisions = await getWorkspaceDecisions(workspace.id);
    const existing = decisions.find((d) => d.type === "STYLE_VIBE");
    const prev = normalizeVision(existing?.payload);
    const next = mergeVision(prev, normalizeVision(body.payload || {}));
    if (body.status === "DECIDED") next.lockedAt = next.lockedAt || new Date().toISOString();
    const decision = await saveStyleVibeDecision({
      workspaceId: workspace.id,
      status: body.status === "DECIDED" ? "DECIDED" : "EXPLORING",
      summary: body.summary || visionSummary(next),
      payload: next,
      participantIds: [DEMO_USERS.alex.id, DEMO_USERS.jordan.id],
    });
    if (next.formal) {
      await updateWorkspaceMeta(workspace.id, { formality: next.formal });
    }
    await applyVisionSteering(workspace.id, next, body.status === "DECIDED");
    return NextResponse.json({ decision: { ...decision, payload: next } });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to save style" }, { status: 500 });
  }
}
