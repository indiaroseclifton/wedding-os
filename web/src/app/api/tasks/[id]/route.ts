import { NextResponse } from "next/server";
import { requireTaskAccess, requireCoupleApi } from "@/lib/auth/access";
import { patchTask } from "@/lib/data/workspace";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const access = await requireTaskAccess(id);
  if (!access.ok) return access.response;
  return NextResponse.json({ task: access.task });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const access = await requireTaskAccess(id);
  if (!access.ok) return access.response;

  const body = await request.json();
  const allowed = ["title", "description", "ownerId", "ownerName", "status", "dueDate", "decisionId"] as const;
  const patch: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) patch[key] = body[key];
  }

  const task = await patchTask(id, patch as Parameters<typeof patchTask>[1]);
  if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ task });
}
