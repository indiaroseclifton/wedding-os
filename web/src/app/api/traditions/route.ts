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
  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
