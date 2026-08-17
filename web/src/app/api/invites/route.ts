import { NextResponse } from "next/server";
import { requireCoupleApi } from "@/lib/auth/access";
import {
  addInvite,
  ensureDemoWorkspace,
  getWorkspaceInvites,
  getWorkspaceMembers,
} from "@/lib/data/workspace";
import { sendAppEmail, requestOrigin } from "@/lib/email/send";
import { optionalString, ValidationError } from "@/lib/validation";
import type { WorkspaceRole } from "@/lib/data/store";

const INVITE_ROLES: WorkspaceRole[] = ["COUPLE", "PLANNER", "WEDDING_PARTY", "FAMILY", "DIY_HELPER", "VENDOR", "VIEWER"];

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
    const requestedRole = String(body.role || "WEDDING_PARTY") as WorkspaceRole;
    const invite = await addInvite({
      workspaceId: workspace.id,
      email: optionalString(body.email, 200),
      name: optionalString(body.name, 120),
      role: INVITE_ROLES.includes(requestedRole) ? requestedRole : "WEDDING_PARTY",
    });
    const invitePath = `/invite/${invite.token}`;
    let emailed = false;
    let emailError: string | undefined;
    if (invite.email) {
      const origin = requestOrigin(request);
      const link = `${origin}${invitePath}`;
      const result = await sendAppEmail({
        to: invite.email,
        subject: `You're invited to help plan ${workspace.name}`,
        text: `${invite.name || "Hey"} — open this link to join the Vowfolk team workspace:\n${link}`,
        html: `<p>${invite.name || "Hey"} — you're invited to help plan <strong>${workspace.name}</strong>.</p>
<p><a href="${link}">Open your invite</a></p>
<p style="color:#64748b;font-size:13px">If the button doesn't work: ${link}</p>`,
      });
      emailed = result.ok;
      if (!result.ok) emailError = result.error;
    }
    return NextResponse.json({
      invite,
      invitePath,
      emailed,
      emailError,
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create invite" }, { status: 500 });
  }
}
