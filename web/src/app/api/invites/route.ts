import { NextResponse } from "next/server";
import { requireCoupleApi } from "@/lib/auth/access";
import {
  addInvite,
  ensureDemoWorkspace,
  getWorkspaceInvites,
  getWorkspaceMembers,
} from "@/lib/data/workspace";
import { optionalString, ValidationError } from "@/lib/validation";

export async function GET() {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  const { workspace } = await ensureDemoWorkspace();
  const [invites, members] = await Promise.all([
    getWorkspaceInvites(workspace.id),
    getWorkspaceMembers(workspace.id),
  ]);
  return NextResponse.json({ invites, members });
}

export async function POST(request: Request) {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  try {
    const body = await request.json();
    const { workspace } = await ensureDemoWorkspace();
    const invite = await addInvite({
      workspaceId: workspace.id,
      email: optionalString(body.email, 200),
      name: optionalString(body.name, 120),
      role: body.role === "COUPLE" ? "COUPLE" : "WEDDING_PARTY",
    });
    return NextResponse.json({
      invite,
      invitePath: `/invite/${invite.token}`,
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create invite" }, { status: 500 });
  }
}
