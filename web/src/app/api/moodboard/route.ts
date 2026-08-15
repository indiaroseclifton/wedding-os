import { NextResponse } from "next/server";
import { requireCoupleApi } from "@/lib/auth/access";
import { ensureDemoWorkspace } from "@/lib/data/workspace";
import {
  addMoodItem,
  getMoodboard,
  removeMoodItem,
} from "@/lib/data/moodboard-store";
import { requiredString, optionalString, ValidationError } from "@/lib/validation";

export async function GET() {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  const { workspace } = await ensureDemoWorkspace();
  const moodboard = await getMoodboard(workspace.id);
  return NextResponse.json({ moodboard });
}

export async function POST(request: Request) {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  try {
    const body = await request.json();
    const { workspace } = await ensureDemoWorkspace();
    if (body.action === "delete") {
      const moodboard = await removeMoodItem(workspace.id, body.id);
      return NextResponse.json({ moodboard });
    }
    const title = requiredString(body.title, "Title", 200);
    const moodboard = await addMoodItem(workspace.id, {
      title,
      url: optionalString(body.url, 500),
      notes: optionalString(body.notes, 2000),
      tag: optionalString(body.tag, 40),
    });
    return NextResponse.json({ moodboard });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
