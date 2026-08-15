import { NextResponse } from "next/server";
import { requireCoupleApi } from "@/lib/auth/access";
import {
  getWorkspaceMembers,
  ensureDemoWorkspace,
  patchTask,
  removeTask,
} from "@/lib/data/workspace";

const STATUSES = new Set(["NOT_STARTED", "IN_PROGRESS", "DONE", "BLOCKED"]);

export async function POST(request: Request) {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;

  try {
    const body = await request.json();
    const ids: string[] = Array.isArray(body.ids)
      ? body.ids.filter((id: unknown) => typeof id === "string" && id)
      : [];

    if (!ids.length) {
      return NextResponse.json({ error: "Select at least one task" }, { status: 400 });
    }
    if (ids.length > 500) {
      return NextResponse.json({ error: "Too many tasks selected" }, { status: 400 });
    }

    const action = body.action as string;

    if (action === "status") {
      const status = String(body.status || "");
      if (!STATUSES.has(status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
      let updated = 0;
      for (const id of ids) {
        const t = await patchTask(id, { status: status as "NOT_STARTED" | "IN_PROGRESS" | "DONE" | "BLOCKED" });
        if (t) updated += 1;
      }
      return NextResponse.json({ ok: true, updated, action: "status" });
    }

    if (action === "owner") {
      const ownerId = String(body.ownerId || "");
      if (!ownerId) {
        return NextResponse.json({ error: "Owner required" }, { status: 400 });
      }
      const { workspace } = await ensureDemoWorkspace();
      const members = await getWorkspaceMembers(workspace.id);
      const member = members.find((m) => m.userId === ownerId);
      const ownerName = member?.name || String(body.ownerName || "Unassigned");
      let updated = 0;
      for (const id of ids) {
        const t = await patchTask(id, { ownerId, ownerName });
        if (t) updated += 1;
      }
      return NextResponse.json({ ok: true, updated, action: "owner" });
    }

    if (action === "delete") {
      let deleted = 0;
      for (const id of ids) {
        const ok = await removeTask(id);
        if (ok) deleted += 1;
      }
      return NextResponse.json({ ok: true, deleted, action: "delete" });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Bulk update failed" }, { status: 500 });
  }
}
