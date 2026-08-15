import { NextResponse } from "next/server";
import { requireCoupleApi } from "@/lib/auth/access";
import {
  addTable,
  ensureDemoWorkspace,
  getWorkspaceTables,
  getWorkspaceGuests,
} from "@/lib/data/workspace";
import { requiredString, ValidationError } from "@/lib/validation";

export async function GET() {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  const { workspace } = await ensureDemoWorkspace();
  const [tables, guests] = await Promise.all([
    getWorkspaceTables(workspace.id),
    getWorkspaceGuests(workspace.id),
  ]);
  return NextResponse.json({ tables, guests });
}

export async function POST(request: Request) {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  try {
    const body = await request.json();
    const name = requiredString(body.name, "Table name", 80);
    const { workspace } = await ensureDemoWorkspace();
    const table = await addTable({
      workspaceId: workspace.id,
      name,
      capacity: typeof body.capacity === "number" ? body.capacity : 8,
      shape: body.shape,
      notes: body.notes,
    });
    return NextResponse.json({ table });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create table" }, { status: 500 });
  }
}
