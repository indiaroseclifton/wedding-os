import { NextResponse } from "next/server";
import { requireCoupleApi } from "@/lib/auth/access";
import { ensureDemoWorkspace } from "@/lib/data/workspace";
import { deleteSign, getSignage, upsertSign } from "@/lib/data/signage-store";
import { ValidationError } from "@/lib/validation";

export async function GET() {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  const { workspace } = await ensureDemoWorkspace();
  const signage = await getSignage(workspace.id);
  return NextResponse.json({ signage });
}

export async function POST(request: Request) {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  try {
    const body = await request.json();
    const { workspace, meta } = await ensureDemoWorkspace();
    if (body.action === "save") {
      const sign = await upsertSign(workspace.id, body.sign || body, meta.coupleNames, meta.weddingDate);
      const signage = await getSignage(workspace.id);
      return NextResponse.json({ sign, signage });
    }
    if (body.action === "delete") {
      const signage = await deleteSign(workspace.id, String(body.id));
      return NextResponse.json({ signage });
    }
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
