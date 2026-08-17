import { NextResponse } from "next/server";
import { requireCoupleApi } from "@/lib/auth/access";
import { ensureDemoWorkspace, ensureRsvpTokens } from "@/lib/data/workspace";
import { getSite } from "@/lib/data/site-store";
import { getWorkspaceMeta, updateGuest } from "@/lib/data/store";
import {
  canAddressNudge,
  canInviteEmail,
  canNudge,
} from "@/lib/data/guest-mail";
import { sendAppEmail, requestOrigin } from "@/lib/email/send";
import { nudgeCopy, type NudgeKind } from "@/lib/email/nudge";
import { DEMO_WORKSPACE } from "@/lib/data/workspace";

type Kind = NudgeKind;

export async function GET() {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  const { workspace } = await ensureDemoWorkspace();
  const guests = await ensureRsvpTokens(workspace.id);
  return NextResponse.json({
    rsvp: guests.filter((g) => canNudge(g)).map(brief),
    address: guests.filter((g) => canAddressNudge(g)).map(brief),
    saveTheDate: guests.filter((g) => canInviteEmail(g, "save_the_date")).map(brief),
    invited: guests.filter((g) => canInviteEmail(g, "invited")).map(brief),
  });
}

function brief(g: { id: string; name: string; email?: string }) {
  return { id: g.id, name: g.name, email: g.email };
}

export async function POST(request: Request) {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  const { workspace } = await ensureDemoWorkspace();
  const [guests, site, meta] = await Promise.all([
    ensureRsvpTokens(workspace.id),
    getSite(workspace.id),
    getWorkspaceMeta(workspace.id, DEMO_WORKSPACE.name),
  ]);
  if (!site.published) {
    return NextResponse.json({ error: "Publish the guest site first." }, { status: 400 });
  }
  const body = await request.json().catch(() => ({}));
  const kind = (body.kind || "rsvp") as Kind;
  const onlyIds = Array.isArray(body.guestIds) ? new Set(body.guestIds.map(String)) : null;
  const ready = guests.filter((g) => {
    if (onlyIds && !onlyIds.has(g.id)) return false;
    if (kind === "address") return canAddressNudge(g);
    if (kind === "save_the_date") return canInviteEmail(g, "save_the_date");
    if (kind === "invited") return canInviteEmail(g, "invited");
    return canNudge(g);
  });
  if (!ready.length) {
    return NextResponse.json({ sent: 0, failed: 0, error: "No one to email." }, { status: 400 });
  }

  const origin = requestOrigin(request);
  const names = meta.coupleNames || meta.name || "us";
  let sent = 0;
  let failed = 0;
  const now = new Date().toISOString();

  for (const g of ready) {
    const link = `${origin}/w/${site.siteToken}/rsvp?guest=${g.rsvpToken}`;
    const copy = nudgeCopy(kind, names, g, link);
    const result = await sendAppEmail({
      to: g.email as string,
      subject: copy.subject,
      text: copy.text,
      html: copy.html,
    });
    if (result.ok) {
      sent += 1;
      if (kind === "address") await updateGuest(g.id, { lastAddressNudgedAt: now });
      else if (kind === "save_the_date") await updateGuest(g.id, { saveTheDateAt: now });
      else if (kind === "invited") {
        await updateGuest(g.id, {
          inviteEmailedAt: now,
          rsvp: g.rsvp === "UNKNOWN" ? "INVITED" : g.rsvp,
        });
      } else {
        await updateGuest(g.id, {
          lastNudgedAt: now,
          nudgeCount: (g.nudgeCount || 0) + 1,
        });
      }
    } else failed += 1;
  }
  return NextResponse.json({ sent, failed });
}
