import { NextResponse } from "next/server";
import { requireCoupleApi } from "@/lib/auth/access";
import { ensureDemoWorkspace } from "@/lib/data/workspace";
import {
  addMediaItem,
  getMedia,
  removeMediaItem,
} from "@/lib/data/media-store";
import { requiredString, optionalString, ValidationError } from "@/lib/validation";

export async function GET() {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  const { workspace } = await ensureDemoWorkspace();
  const media = await getMedia(workspace.id);
  return NextResponse.json({ media });
}

export async function POST(request: Request) {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  try {
    const body = await request.json();
    const { workspace } = await ensureDemoWorkspace();
    if (body.action === "delete") {
      const media = await removeMediaItem(workspace.id, body.id);
      return NextResponse.json({ media });
    }
    const title = requiredString(body.title, "Title", 200);
    const url = requiredString(body.url, "URL", 500);
    const media = await addMediaItem(workspace.id, {
      title,
      url,
      kind: body.kind,
      source: optionalString(body.source, 80),
      notes: optionalString(body.notes, 2000),
    });
    return NextResponse.json({ media });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
