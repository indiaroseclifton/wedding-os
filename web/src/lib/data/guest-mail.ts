import type { StoredGuest } from "./store";

const RSVP_COOLDOWN_MS = 5 * 24 * 60 * 60 * 1000;
const SECOND_COOLDOWN_MS = 10 * 24 * 60 * 60 * 1000;
const ADDRESS_COOLDOWN_MS = 5 * 24 * 60 * 60 * 1000;

export function hasMailingAddress(g: Pick<StoredGuest, "address" | "city">) {
  return Boolean(g.address?.trim() && g.city?.trim());
}

export function formatMailingAddress(
  g: Pick<StoredGuest, "address" | "city" | "region" | "postal">
) {
  return [g.address, g.city, g.region, g.postal].map((p) => p?.trim()).filter(Boolean).join(", ");
}

export function isPendingRsvp(rsvp: string) {
  return rsvp === "UNKNOWN" || rsvp === "INVITED";
}

function hasRealEmail(g: StoredGuest) {
  if (!g.email || !g.email.includes("@")) return false;
  if (g.email.endsWith("@example.com") || g.email.endsWith(".example")) return false;
  return true;
}

export function canNudge(g: StoredGuest, now = Date.now()) {
  if (!hasRealEmail(g) || !g.rsvpToken || !isPendingRsvp(g.rsvp)) return false;
  if (!g.lastNudgedAt) return true;
  const t = new Date(g.lastNudgedAt).getTime();
  if (!Number.isFinite(t)) return true;
  const wait = (g.nudgeCount || 0) >= 1 ? SECOND_COOLDOWN_MS : RSVP_COOLDOWN_MS;
  return now - t >= wait;
}

export function canAddressNudge(g: StoredGuest, now = Date.now()) {
  if (!hasRealEmail(g) || !g.rsvpToken) return false;
  if (g.rsvp !== "YES") return false;
  if (hasMailingAddress(g)) return false;
  if (!g.lastAddressNudgedAt) return true;
  const t = new Date(g.lastAddressNudgedAt).getTime();
  return !Number.isFinite(t) || now - t >= ADDRESS_COOLDOWN_MS;
}

export function canInviteEmail(g: StoredGuest, kind: "save_the_date" | "invited") {
  if (!hasRealEmail(g) || !g.rsvpToken) return false;
  if (kind === "save_the_date") return !g.saveTheDateAt;
  return !g.inviteEmailedAt;
}

export function nudgeBlockReason(g: StoredGuest, now = Date.now()) {
  if (!isPendingRsvp(g.rsvp)) return "already replied";
  if (!hasRealEmail(g)) return "no email";
  if (!g.rsvpToken) return "no link";
  if (g.lastNudgedAt) {
    const t = new Date(g.lastNudgedAt).getTime();
    const wait = (g.nudgeCount || 0) >= 1 ? SECOND_COOLDOWN_MS : RSVP_COOLDOWN_MS;
    if (Number.isFinite(t) && now - t < wait) return "nudged recently";
  }
  return null;
}
