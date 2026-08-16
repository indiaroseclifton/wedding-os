import { NextResponse } from "next/server";
import { requireCoupleApi, requireSession } from "@/lib/auth/access";
import { ensureDemoWorkspace } from "@/lib/data/workspace";
import {
  addAttireMember,
  getAttire,
  saveAttire,
  updateAttireMember,
} from "@/lib/data/attire-store";
import { requiredString, optionalString, ValidationError } from "@/lib/validation";

export async function GET() {
  const access = await requireSession();
  if (!access.ok) return access.response;
  const { workspace } = await ensureDemoWorkspace();
  const attire = await getAttire(workspace.id);
  return NextResponse.json({ attire });
}

export async function POST(request: Request) {
  const session = await requireSession();
  if (!session.ok) return session.response;
  try {
    const body = await request.json();
    const { workspace } = await ensureDemoWorkspace();

    if (body.action === "update_mine") {
      const attire = await getAttire(workspace.id);
      const mine =
        attire.members.find((m) => m.name.toLowerCase() === session.session.name.toLowerCase()) ||
        attire.members.find((m) => m.id === body.id);
      if (!mine) return NextResponse.json({ error: "No attire row for you" }, { status: 404 });
      const patch: { size?: string; status?: typeof mine.status; notes?: string } = {};
      if (typeof body.size === "string") patch.size = body.size.slice(0, 40);
      if (typeof body.notes === "string") patch.notes = body.notes.slice(0, 400);
      if (["NOT_STARTED", "ORDERED", "ALTERING", "READY"].includes(String(body.status))) {
        patch.status = body.status;
      }
      const next = await updateAttireMember(workspace.id, mine.id, patch);
      return NextResponse.json({ attire: next });
    }

    const couple = await requireCoupleApi();
    if (!couple.ok) return couple.response;

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
