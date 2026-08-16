import { NextResponse } from "next/server";
import { requireCoupleApi } from "@/lib/auth/access";
import {
  ensureDemoWorkspace,
  loadWorkspaceMeta,
  updateWorkspaceMeta,
} from "@/lib/data/workspace";
import { optionalString, requiredString, ValidationError } from "@/lib/validation";

export async function GET() {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  const { workspace } = await ensureDemoWorkspace();
  const meta = await loadWorkspaceMeta(workspace.id, workspace.name);
  return NextResponse.json({ meta });
}

export async function POST(request: Request) {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  try {
    const body = await request.json();
    const { workspace } = await ensureDemoWorkspace();
    const meta = await updateWorkspaceMeta(workspace.id, {
      name: body.name ? requiredString(body.name, "Wedding name", 120) : undefined,
      weddingDate: optionalString(body.weddingDate, 40),
      location: optionalString(body.location, 160),
      coupleNames: optionalString(body.coupleNames, 160),
      coverUrl: optionalString(body.coverUrl, 500),
    });
    return NextResponse.json({ meta });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
