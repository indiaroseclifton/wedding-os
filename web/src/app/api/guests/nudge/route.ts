import { NextResponse } from "next/server";
import { requireCoupleApi } from "@/lib/auth/access";
import { ensureDemoWorkspace, ensureRsvpTokens } from "@/lib/data/workspace";
import { getSite } from "@/lib/data/site-store";
import { getWorkspaceMeta, updateGuest } from "@/lib/data/store";
import {
  canAddressNudge,
  canInviteEmail,
  canNudge,
  isSilentYes,
} from "@/lib/data/guest-mail";
import { sendAppEmail, requestOrigin } from "@/lib/email/send";
import { DEMO_WORKSPACE } from "@/lib/data/workspace";

type Kind = "rsvp" | "address" | "save_the_date" | "invited";

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
    const copy = copyFor(kind, names, g.name, link, g.rsvp, isSilentYes(g));
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

function copyFor(
  kind: Kind,
  names: string,
  guestName: string,
  link: string,
  rsvp?: string,
  silent?: boolean
) {
  const first = guestName.split(" ")[0];
  if (kind === "address") {
    return {
      subject: `${names} — mailing address`,
      text: `Hi ${first},\n\nCould you add a mailing address for thank-yous?\n${link}\n`,
      html: `<p>Hi ${first},</p><p>Could you add a mailing address for thank-yous?</p><p><a href="${link}">Open your RSVP</a></p>`,
    };
  }
  if (kind === "save_the_date") {
    return {
      subject: `${names} — save the date`,
      text: `Hi ${first},\n\nSave the date for ${names}.\n${link}\n`,
      html: `<p>Hi ${first},</p><p>Save the date for <strong>${names}</strong>.</p><p><a href="${link}">Wedding details</a></p>`,
    };
  }
  if (kind === "invited") {
    return {
      subject: `${names} — you’re invited`,
      text: `Hi ${first},\n\nYou’re invited. Please RSVP:\n${link}\n`,
      html: `<p>Hi ${first},</p><p>You’re invited. Please RSVP for <strong>${names}</strong>.</p><p><a href="${link}">RSVP here</a></p>`,
    };
  }
  if (silent) {
    return {
      subject: `${names} — still coming?`,
      text: `Hi ${first},\n\nYou RSVP’d yes. If anything changed, please tell us so we don’t hold a seat and a plate.\n${link}\n`,
      html: `<p>Hi ${first},</p><p>You RSVP’d yes. If anything changed, please tell us so we don’t hold a seat and a plate.</p><p><a href="${link}">Confirm here</a></p>`,
    };
  }
  if (rsvp === "MAYBE") {
    return {
      subject: `${names} — we need a real answer`,
      text: `Hi ${first},\n\nWe still have you as a maybe. Catering needs a yes or no — can you reply?\n${link}\n`,
      html: `<p>Hi ${first},</p><p>We still have you as a maybe. Catering needs a yes or no — can you reply?</p><p><a href="${link}">RSVP here</a></p>`,
    };
  }
  return {
    subject: `${names} — a reminder to RSVP`,
    text: `Hi ${first},\n\nPlease RSVP here:\n${link}\n`,
    html: `<p>Hi ${first},</p><p>Could you RSVP for <strong>${names}</strong>?</p><p><a href="${link}">Open your RSVP</a></p>`,
  };
}
