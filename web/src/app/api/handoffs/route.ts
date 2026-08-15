import { NextResponse } from "next/server";
import { requireCoupleApi } from "@/lib/auth/access";
import { ensureDemoWorkspace } from "@/lib/data/workspace";
import {
  createPackage,
  listPackages,
  type HandoffTemplate,
} from "@/lib/data/handoffs-store";
import { requiredString, optionalString, ValidationError } from "@/lib/validation";

const TEMPLATES = new Set(["DAY_OF", "DJ", "PHOTOGRAPHER"]);

export async function GET() {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  const { workspace } = await ensureDemoWorkspace();
  const packages = await listPackages(workspace.id);
  return NextResponse.json({ packages });
}

export async function POST(request: Request) {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  try {
    const body = await request.json();
    const template = body.template as string;
    if (!TEMPLATES.has(template)) {
      return NextResponse.json({ error: "Invalid template" }, { status: 400 });
    }
    const title = requiredString(body.title, "Title", 200);
    const { workspace } = await ensureDemoWorkspace();
    const pkg = await createPackage({
      workspaceId: workspace.id,
      template: template as HandoffTemplate,
      title,
      recipientName: optionalString(body.recipientName, 120),
      recipientEmail: optionalString(body.recipientEmail, 200),
    });
    return NextResponse.json({ package: pkg });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create package" }, { status: 500 });
  }
}
