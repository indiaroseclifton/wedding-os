import { NextResponse } from "next/server";
import { requireCoupleApi } from "@/lib/auth/access";
import { ensureDemoWorkspace } from "@/lib/data/workspace";
import { addTimelineItem, listTimeline } from "@/lib/data/timeline-store";
import { requiredString, optionalString, ValidationError } from "@/lib/validation";
import { SEED_MILESTONES, applyOffsetId } from "@/lib/timeline-dates";

export async function GET() {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  const { workspace, meta } = await ensureDemoWorkspace();
  const items = await listTimeline(workspace.id);
  return NextResponse.json({ items, weddingDate: meta.weddingDate || "" });
}

export async function POST(request: Request) {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  try {
    const body = await request.json();
    const { workspace, meta } = await ensureDemoWorkspace();

    if (body.action === "seed") {
      const existing = await listTimeline(workspace.id);
      if (existing.length) return NextResponse.json({ items: existing, seeded: 0 });
      const date = meta.weddingDate;
      if (!date) return NextResponse.json({ error: "Set a wedding date first" }, { status: 400 });
      for (const row of SEED_MILESTONES) {
        await addTimelineItem({
          workspaceId: workspace.id,
          title: row.title,
          when: applyOffsetId(date, row.offset),
          category: row.category,
        });
      }
      const items = await listTimeline(workspace.id);
      return NextResponse.json({ items, seeded: items.length });
    }

    const title = requiredString(body.title, "Title", 200);
    const when = requiredString(body.when, "When", 80);
    const item = await addTimelineItem({
      workspaceId: workspace.id,
      title,
      when,
      category: optionalString(body.category, 40) || "General",
      notes: optionalString(body.notes, 2000),
    });
    return NextResponse.json({ item });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
