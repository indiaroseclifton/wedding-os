import { NextResponse } from "next/server";
import { requireCoupleApi } from "@/lib/auth/access";
import { ensureDemoWorkspace } from "@/lib/data/workspace";
import { getLegal, patchLegalItem, saveLegal } from "@/lib/data/legal-store";

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
  const body = await request.json();
  const { workspace } = await ensureDemoWorkspace();
  if (body.action === "toggle") {
    const legal = await patchLegalItem(workspace.id, body.id, { done: !!body.done });
    return NextResponse.json({ legal });
  }
  if (body.action === "meta") {
    const legal = await saveLegal(workspace.id, {
      countyState: body.countyState,
      privateNotes: body.privateNotes,
    });
    return NextResponse.json({ legal });
  }
  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
