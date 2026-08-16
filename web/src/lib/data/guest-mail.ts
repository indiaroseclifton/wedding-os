import type { StoredGuest } from "./store";

const COOLDOWN_MS = 5 * 24 * 60 * 60 * 1000;

export function hasMailingAddress(g: Pick<StoredGuest, "address" | "city">) {
  return Boolean(g.address?.trim() && g.city?.trim());
}

export function formatMailingAddress(g: Pick<StoredGuest, "address" | "city" | "region" | "postal">) {
  return [g.address, g.city, g.region, g.postal].map((p) => p?.trim()).filter(Boolean).join(", ");
}

export function isPendingRsvp(rsvp: string) {
  return rsvp === "UNKNOWN" || rsvp === "INVITED";
}

export function canNudge(g: StoredGuest, now = Date.now()) {
  if (!g.email || !g.email.includes("@")) return false;
  if (g.email.endsWith("@example.com") || g.email.endsWith(".example")) return false;
  if (!isPendingRsvp(g.rsvp)) return false;
  if (g.lastNudgedAt) {
    const t = new Date(g.lastNudgedAt).getTime();
    if (Number.isFinite(t) && now - t < COOLDOWN_MS) return false;
  }
  return Boolean(g.rsvpToken);
}

export function nudgeBlockReason(g: StoredGuest, now = Date.now()) {
  if (!isPendingRsvp(g.rsvp)) return "already replied";
  if (!g.email) return "no email";
  if (g.email.endsWith("@example.com") || g.email.endsWith(".example")) return "demo email";
  if (g.lastNudgedAt) {
    const t = new Date(g.lastNudgedAt).getTime();
    if (Number.isFinite(t) && now - t < COOLDOWN_MS) return "nudged recently";
  }
  if (!g.rsvpToken) return "no link";
  return null;
}
