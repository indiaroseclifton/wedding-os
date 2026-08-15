import { NextResponse } from "next/server";
import { requireCoupleApi } from "@/lib/auth/access";
import { ensureDemoWorkspace } from "@/lib/data/workspace";
import {
  addTimelineItem,
  listTimeline,
} from "@/lib/data/timeline-store";
import { requiredString, optionalString, ValidationError } from "@/lib/validation";

export async function GET() {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  const { workspace } = await ensureDemoWorkspace();
  const items = await listTimeline(workspace.id);
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  try {
    const body = await request.json();
    const title = requiredString(body.title, "Title", 200);
    const when = requiredString(body.when, "When", 80);
    const { workspace } = await ensureDemoWorkspace();
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
