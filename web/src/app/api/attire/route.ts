import { NextResponse } from "next/server";
import { requireCoupleApi } from "@/lib/auth/access";
import { ensureDemoWorkspace } from "@/lib/data/workspace";
import {
  addAttireMember,
  getAttire,
  saveAttire,
  updateAttireMember,
} from "@/lib/data/attire-store";
import { requiredString, optionalString, ValidationError } from "@/lib/validation";

export async function GET() {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  const { workspace } = await ensureDemoWorkspace();
  const attire = await getAttire(workspace.id);
  return NextResponse.json({ attire });
}

export async function POST(request: Request) {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  try {
    const body = await request.json();
    const { workspace } = await ensureDemoWorkspace();
    if (body.action === "palette") {
      const attire = await saveAttire(workspace.id, {
        paletteNotes: String(body.paletteNotes || ""),
      });
      return NextResponse.json({ attire });
    }
    if (body.action === "update_member") {
      const attire = await updateAttireMember(workspace.id, body.id, body.patch || {});
      return NextResponse.json({ attire });
    }
    const name = requiredString(body.name, "Name", 120);
    const role = requiredString(body.role || "Party", "Role", 80);
    const attire = await addAttireMember(workspace.id, {
      name,
      role,
      color: optionalString(body.color, 80),
      dressLink: optionalString(body.dressLink, 500),
    });
    return NextResponse.json({ attire });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
