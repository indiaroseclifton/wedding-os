import { NextResponse } from "next/server";
import { requireCoupleApi, requireSession } from "@/lib/auth/access";
import { ensureDemoWorkspace } from "@/lib/data/workspace";
import { createPoll, listPolls } from "@/lib/data/polls-store";
import { requiredString, ValidationError } from "@/lib/validation";

export async function GET() {
  const access = await requireSession();
  if (!access.ok) return access.response;
  const { workspace } = await ensureDemoWorkspace();
  const polls = await listPolls(workspace.id);
  return NextResponse.json({ polls });
}

export async function POST(request: Request) {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  try {
    const body = await request.json();
    const title = requiredString(body.title, "Title", 200);
    const options = String(body.optionsText || "")
      .split("\n")
      .map((s: string) => s.trim())
      .filter(Boolean);
    if (options.length < 2) {
      return NextResponse.json({ error: "Add at least two options" }, { status: 400 });
    }
    const { workspace } = await ensureDemoWorkspace();
    const poll = await createPoll({
      workspaceId: workspace.id,
      title,
      description: body.description,
      options,
      mode: body.mode === "RANKED" ? "RANKED" : "SINGLE",
    });
    return NextResponse.json({ poll });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
