import { NextResponse } from "next/server";
import { requireCoupleApi } from "@/lib/auth/access";
import { ensureDemoWorkspace, loadWorkspaceMeta } from "@/lib/data/workspace";
import {
  PHASES,
  addChecklistItem,
  deleteChecklistItem,
  getChecklist,
  patchChecklistItem,
} from "@/lib/data/checklist-store";
import { addTimelineItem, listTimeline } from "@/lib/data/timeline-store";
import { requiredString, ValidationError } from "@/lib/validation";
import { syncFaithToPlanning } from "@/lib/data/sync-faith";
import { FAITHS } from "@/lib/preferences";

export async function GET() {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  const { workspace } = await ensureDemoWorkspace();
  const meta = await loadWorkspaceMeta(workspace.id, workspace.name);
  await syncFaithToPlanning(workspace.id, meta.faith, meta.faithPacks);
  const checklist = await getChecklist(workspace.id);
  const faith = FAITHS.find((f) => f.id === meta.faith);
  return NextResponse.json({
    checklist,
    phases: PHASES,
    faith: meta.faith,
    faithLabel: faith?.label || "None",
  });
}

export async function POST(request: Request) {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  try {
    const body = await request.json();
    const { workspace } = await ensureDemoWorkspace();
    if (body.action === "toggle") {
      const checklist = await patchChecklistItem(workspace.id, String(body.id), {
        done: !!body.done,
      });
      return NextResponse.json({ checklist });
    }
    if (body.action === "add") {
      const checklist = await addChecklistItem(workspace.id, {
        title: requiredString(body.title, "Title", 200),
        phase: body.phase || "1",
      });
      return NextResponse.json({ checklist });
    }
    if (body.action === "delete") {
      const checklist = await deleteChecklistItem(workspace.id, String(body.id));
      return NextResponse.json({ checklist });
    }
    if (body.action === "to_timeline") {
      const checklist = await getChecklist(workspace.id);
      const existing = await listTimeline(workspace.id);
      const existingTitles = new Set(
        existing.filter((t) => t.category === "Checklist").map((t) => t.title)
      );
      const toAdd = checklist.items.filter((i) => !i.done && !existingTitles.has(i.title));
      const created = [];
      for (const item of toAdd) {
        created.push(
          await addTimelineItem({
            workspaceId: workspace.id,
            title: item.title,
            when: item.phase,
            category: "Checklist",
            notes: "From planning checklist",
          })
        );
      }
      return NextResponse.json({ ok: true, added: created.length, items: created });
    }
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
