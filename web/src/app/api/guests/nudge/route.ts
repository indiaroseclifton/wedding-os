import { NextResponse } from "next/server";
import { requireCoupleApi } from "@/lib/auth/access";
import { ensureDemoWorkspace, ensureRsvpTokens } from "@/lib/data/workspace";
import { getSite } from "@/lib/data/site-store";
import { getWorkspaceMeta, updateGuest } from "@/lib/data/store";
import { canNudge, nudgeBlockReason } from "@/lib/data/guest-mail";
import { sendAppEmail, requestOrigin } from "@/lib/email/send";
import { DEMO_WORKSPACE } from "@/lib/data/workspace";

export async function GET() {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  const { workspace } = await ensureDemoWorkspace();
  const guests = await ensureRsvpTokens(workspace.id);
  const ready = guests.filter((g) => canNudge(g));
  return NextResponse.json({
    ready: ready.map((g) => ({ id: g.id, name: g.name, email: g.email })),
    skipped: guests
      .filter((g) => !canNudge(g))
      .map((g) => ({ id: g.id, name: g.name, reason: nudgeBlockReason(g) })),
  });
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
  if (!site.published || !site.rsvpOpen) {
    return NextResponse.json(
      { error: "Publish the guest site and keep RSVP open first." },
      { status: 400 }
    );
  }
  const body = await request.json().catch(() => ({}));
  const onlyIds = Array.isArray(body.guestIds) ? new Set(body.guestIds.map(String)) : null;
  const targets = guests.filter((g) => canNudge(g) && (!onlyIds || onlyIds.has(g.id)));
  if (!targets.length) {
    return NextResponse.json({ sent: 0, failed: 0, error: "No one to nudge." }, { status: 400 });
  }

  const origin = requestOrigin(request);
  const names = meta.coupleNames || meta.name || "us";
  let sent = 0;
  let failed = 0;
  const now = new Date().toISOString();

  for (const g of targets) {
    const link = `${origin}/w/${site.siteToken}/rsvp?guest=${g.rsvpToken}`;
    const result = await sendAppEmail({
      to: g.email as string,
      subject: `${names} — a reminder to RSVP`,
      text: `Hi ${g.name.split(" ")[0]},\n\nPlease RSVP here:\n${link}\n`,
      html: `<p>Hi ${g.name.split(" ")[0]},</p>
<p>Could you RSVP for <strong>${names}</strong>?</p>
<p><a href="${link}">Open your RSVP</a></p>
<p style="color:#64748b;font-size:13px">${link}</p>`,
    });
    if (result.ok) {
      sent += 1;
      await updateGuest(g.id, { lastNudgedAt: now });
    } else {
      failed += 1;
    }
  }

  return NextResponse.json({ sent, failed });
}
