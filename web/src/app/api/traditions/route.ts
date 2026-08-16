import { NextResponse } from "next/server";
import { requireCoupleApi } from "@/lib/auth/access";
import { ensureDemoWorkspace } from "@/lib/data/workspace";
import {
  PACKS,
  applyPack,
  getTraditions,
  saveTraditionNotes,
  toggleTraditionItem,
} from "@/lib/data/traditions-store";
import { addTimelineItem, listTimeline } from "@/lib/data/timeline-store";
import { syncFaithToPlanning } from "@/lib/data/sync-faith";
import { getWorkspaceMeta } from "@/lib/data/store";
import { DEMO_WORKSPACE } from "@/lib/data/workspace";

export async function GET() {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  const { workspace } = await ensureDemoWorkspace();
  const traditions = await getTraditions(workspace.id);
  return NextResponse.json({ traditions, packs: PACKS });
}

export async function POST(request: Request) {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  const body = await request.json();
  const { workspace } = await ensureDemoWorkspace();

  if (body.action === "apply_pack") {
    const traditions = await applyPack(workspace.id, body.packId);
    const meta = await getWorkspaceMeta(workspace.id, DEMO_WORKSPACE.name);
    await syncFaithToPlanning(workspace.id, meta.faith, [
      ...(meta.faithPacks || []),
      String(body.packId),
    ]);
    return NextResponse.json({ traditions });
  }
  if (body.action === "toggle") {
    const traditions = await toggleTraditionItem(
      workspace.id,
      body.id,
      !!body.done
    );
    return NextResponse.json({ traditions });
  }
  if (body.action === "notes") {
    const traditions = await saveTraditionNotes(
      workspace.id,
      String(body.customNotes || "")
    );
    return NextResponse.json({ traditions });
  }
  if (body.action === "to_timeline") {
    const traditions = await getTraditions(workspace.id);
    const existing = await listTimeline(workspace.id);
    const existingTitles = new Set(
      existing.filter((t) => t.category === "Tradition").map((t) => t.title)
    );
    const toAdd = traditions.items.filter(
      (item) => !item.done && !existingTitles.has(item.title)
    );
    const created = [];
    for (const item of toAdd) {
      const row = await addTimelineItem({
        workspaceId: workspace.id,
        title: item.title,
        when: item.timing || "TBD",
        category: "Tradition",
        notes: "From traditions checklist",
      });
      created.push(row);
    }
    return NextResponse.json({
      ok: true,
      added: created.length,
      skipped: traditions.items.length - toAdd.length,
      items: created,
    });
  }
  if (body.action === "item_to_timeline") {
    const traditions = await getTraditions(workspace.id);
    const item = traditions.items.find((i) => i.id === body.id);
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const row = await addTimelineItem({
      workspaceId: workspace.id,
      title: item.title,
      when: item.timing || "TBD",
      category: "Tradition",
      notes: "From traditions checklist",
    });
    return NextResponse.json({ ok: true, item: row });
  }
  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
