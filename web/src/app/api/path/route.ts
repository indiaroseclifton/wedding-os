import { NextResponse } from "next/server";
import { requireCoupleApi } from "@/lib/auth/access";
import { ensureDemoWorkspace } from "@/lib/data/workspace";
import { getPath, PATH_CATEGORIES, setPathChoice, type PathChoice } from "@/lib/data/path-store";

const CHOICES = new Set(["undecided", "hire", "diy", "mix"]);

export async function GET() {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  const { workspace } = await ensureDemoWorkspace();
  const path = await getPath(workspace.id);
  return NextResponse.json({ path, categories: PATH_CATEGORIES });
}

export async function POST(request: Request) {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  const body = await request.json();
  const choice = String(body.choice || "");
  if (!CHOICES.has(choice)) {
    return NextResponse.json({ error: "Invalid choice" }, { status: 400 });
  }
  const { workspace } = await ensureDemoWorkspace();
  const path = await setPathChoice(workspace.id, String(body.category), choice as PathChoice);
  return NextResponse.json({ path });
}
