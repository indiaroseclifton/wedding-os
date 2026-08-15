import { NextResponse } from "next/server";
import { requireCoupleApi } from "@/lib/auth/access";
import { ensureDemoWorkspace } from "@/lib/data/workspace";
import { addNote, getNotes, savePinned } from "@/lib/data/notes-store";
import { requiredString, ValidationError } from "@/lib/validation";

export async function GET() {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  const { workspace } = await ensureDemoWorkspace();
  const notes = await getNotes(workspace.id);
  return NextResponse.json({ notes });
}

export async function POST(request: Request) {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  try {
    const body = await request.json();
    const { workspace } = await ensureDemoWorkspace();
    if (body.action === "pin") {
      const notes = await savePinned(workspace.id, String(body.pinned || ""));
      return NextResponse.json({ notes });
    }
    const text = requiredString(body.body, "Note", 5000);
    const notes = await addNote(workspace.id, text, access.session.name);
    return NextResponse.json({ notes });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
