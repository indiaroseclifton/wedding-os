import { NextResponse } from "next/server";
import { requireCoupleApi } from "@/lib/auth/access";
import { ensureDemoWorkspace } from "@/lib/data/workspace";
import { PLAYBOOKS } from "@/lib/data/diy-playbooks";
import {
  deleteProject,
  getDiy,
  patchProject,
  recalcShopping,
  startProject,
  toggleShopItem,
} from "@/lib/data/diy-store";

export async function GET() {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  const { workspace } = await ensureDemoWorkspace();
  const diy = await getDiy(workspace.id);
  return NextResponse.json({ diy, playbooks: PLAYBOOKS });
}

export async function POST(request: Request) {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  const body = await request.json();
  const { workspace } = await ensureDemoWorkspace();
  try {
    if (body.action === "start") {
      const diy = await startProject(workspace.id, {
        playbookSlug: String(body.slug),
        tables: Number(body.tables) || undefined,
        guests: Number(body.guests) || undefined,
      });
      return NextResponse.json({ diy });
    }
    if (body.action === "status") {
      const status =
        body.status === "committed" || body.status === "done" ? body.status : "exploring";
      const diy = await patchProject(workspace.id, String(body.id), {
        status,
        chosenSourceId: body.chosenSourceId,
        notes: body.notes,
      });
      return NextResponse.json({ diy });
    }
    if (body.action === "recalc") {
      const diy = await recalcShopping(
        workspace.id,
        String(body.id),
        Number(body.tables) || 10,
        Number(body.guests) || 80
      );
      return NextResponse.json({ diy });
    }
    if (body.action === "toggle_item") {
      const diy = await toggleShopItem(workspace.id, String(body.projectId), String(body.itemId));
      return NextResponse.json({ diy });
    }
    if (body.action === "delete") {
      const diy = await deleteProject(workspace.id, String(body.id));
      return NextResponse.json({ diy });
    }
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
