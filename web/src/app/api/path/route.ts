import { NextResponse } from "next/server";
import { requireCoupleApi } from "@/lib/auth/access";
import { ensureDemoWorkspace } from "@/lib/data/workspace";
import {
  getPath,
  PATH_CATEGORIES,
  setPathChoice,
  setPieceChoice,
  type PathChoice,
  type PieceChoice,
} from "@/lib/data/path-store";
import { DIY_PIECES } from "@/lib/diy/mix";

const CHOICES = new Set(["undecided", "hire", "diy", "mix"]);
const PIECES = new Set(["undecided", "hire", "make", "skip"]);

export async function GET() {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  const { workspace } = await ensureDemoWorkspace();
  const path = await getPath(workspace.id);
  return NextResponse.json({ path, categories: PATH_CATEGORIES, pieces: DIY_PIECES });
}

export async function POST(request: Request) {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  const body = await request.json();
  const { workspace } = await ensureDemoWorkspace();
  if (body.pieceId) {
    const choice = String(body.choice || "undecided");
    if (!PIECES.has(choice)) return NextResponse.json({ error: "Invalid choice" }, { status: 400 });
    const path = await setPieceChoice(workspace.id, String(body.pieceId), choice as PieceChoice);
    return NextResponse.json({ path, pieces: DIY_PIECES });
  }
  const choice = String(body.choice || "");
  if (!CHOICES.has(choice)) {
    return NextResponse.json({ error: "Invalid choice" }, { status: 400 });
  }
  const path = await setPathChoice(workspace.id, String(body.category), choice as PathChoice);
  return NextResponse.json({ path });
}
