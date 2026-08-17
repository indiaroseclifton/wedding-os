import { NextResponse } from "next/server";
import { requireCoupleApi } from "@/lib/auth/access";
import { ensureDemoWorkspace } from "@/lib/data/workspace";
import {
  addLegalItem,
  deleteLegalItem,
  getLegal,
  patchLegalItem,
  saveLegal,
  setNamePath,
  type NamePath,
} from "@/lib/data/legal-store";
import { addTimelineItem, listTimeline } from "@/lib/data/timeline-store";
import { requiredString, ValidationError } from "@/lib/validation";

export async function GET() {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  const { workspace } = await ensureDemoWorkspace();
  const legal = await getLegal(workspace.id);
  return NextResponse.json({ legal });
}

export async function POST(request: Request) {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  try {
    const body = await request.json();
    const { workspace } = await ensureDemoWorkspace();
    if (body.action === "toggle") {
      const legal = await patchLegalItem(workspace.id, body.id, { done: !!body.done });
      return NextResponse.json({ legal });
    }
    if (body.action === "add") {
      const legal = await addLegalItem(workspace.id, {
        title: requiredString(body.title, "Title", 160),
        category: body.category || "Other",
        dueDate: body.dueDate || undefined,
      });
      return NextResponse.json({ legal });
    }
    if (body.action === "delete") {
      const legal = await deleteLegalItem(workspace.id, String(body.id));
      return NextResponse.json({ legal });
    }
    if (body.action === "path") {
      const next = String(body.namePath || "unset") as NamePath;
      if (!["unset", "keep", "hyphen", "change"].includes(next)) {
        return NextResponse.json({ error: "Unknown path" }, { status: 400 });
      }
      const legal = await setNamePath(workspace.id, next);
      return NextResponse.json({ legal });
    }
    if (body.action === "meta") {
      const legal = await saveLegal(workspace.id, {
        countyState: body.countyState,
        privateNotes: body.privateNotes,
      });
      return NextResponse.json({ legal });
    }
    if (body.action === "to_timeline") {
      const legal = await getLegal(workspace.id);
      const existing = await listTimeline(workspace.id);
      const existingTitles = new Set(
        existing.filter((t) => t.category === "Legal").map((t) => t.title)
      );
      const toAdd = legal.items.filter((item) => !item.done && !existingTitles.has(item.title));
      const created = [];
      for (const item of toAdd) {
        created.push(
          await addTimelineItem({
            workspaceId: workspace.id,
            title: item.title,
            when: item.dueDate || "TBD",
            category: "Legal",
            notes: "From legal checklist",
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
