import type { StoredGuest } from "@/lib/data/store";
import { isSilentYes } from "@/lib/data/guest-mail";

export type NudgeKind = "rsvp" | "address" | "save_the_date" | "invited";

export function nudgeCopy(
  kind: NudgeKind,
  names: string,
  guest: Pick<StoredGuest, "name" | "rsvp" | "rsvpAt">,
  link: string
) {
  const first = guest.name.split(" ")[0];
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
  if (isSilentYes(guest)) {
    return {
      subject: `${names} — still coming?`,
      text: `Hi ${first},\n\nYou RSVP’d yes. If anything changed, please tell us so we don’t hold a seat and a plate.\n${link}\n`,
      html: `<p>Hi ${first},</p><p>You RSVP’d yes. If anything changed, please tell us so we don’t hold a seat and a plate.</p><p><a href="${link}">Confirm here</a></p>`,
    };
  }
  if (guest.rsvp === "MAYBE") {
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

export function isFollowUp(g: StoredGuest) {
  return (g.nudgeCount || 0) >= 1 || g.rsvp === "MAYBE" || isSilentYes(g);
}
