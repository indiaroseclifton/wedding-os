import { AFTER_BEATS, AFTER_DAYS, afterPhase, cardPace, type AfterBeat } from "@/lib/after-arc";
import { formatMailingAddress, hasMailingAddress } from "@/lib/data/guest-mail";
import type { StoredGuest } from "@/lib/data/store";
import type { ThankYou } from "@/lib/data/thanks-store";
import type { StoredVendor } from "@/lib/data/vendors-store";
import { cardPrompt as writeCard } from "@/lib/after-copy";

export type AfterCard = ThankYou & {
  addressLine?: string;
  missingAddress: boolean;
};

export type AfterBeatState = AfterBeat & { state: "now" | "soon" | "done" | "wait" };

export function shouldThank(g: StoredGuest) {
  if (g.showed === false) return false;
  if (g.rsvp === "NO") return false;
  if (g.rsvp === "YES") return true;
  return g.showed === true;
}

export function buildAfterDesk(input: {
  weddingDate?: string;
  guests: StoredGuest[];
  vendors: StoredVendor[];
  items: ThankYou[];
  names?: string;
}) {
  const { daysAgo, daysLeft, current } = afterPhase(input.weddingDate);
  const byId = new Map(input.guests.map((g) => [g.id, g]));
  const byName = new Map(input.guests.map((g) => [g.name.trim().toLowerCase(), g]));

  const cards: AfterCard[] = input.items.map((item) => {
    const guest = (item.guestId && byId.get(item.guestId)) || byName.get(item.guestName.trim().toLowerCase());
    const addressLine = guest ? formatMailingAddress(guest) : item.notes;
    return {
      ...item,
      addressLine: addressLine || undefined,
      missingAddress: guest ? !hasMailingAddress(guest) : !addressLine,
    };
  });

  const open = cards.filter((c) => c.status !== "SENT");
  const sent = cards.filter((c) => c.status === "SENT");
  const missing = open.filter((c) => c.missingAddress);
  const unmarked = input.vendors.filter((v) => !v.gutMark);
  const noShow = input.guests.filter((g) => g.rsvp === "YES" && g.showed === false);
  const seedable = input.guests.filter(shouldThank).filter((g) => {
    const key = g.name.trim().toLowerCase();
    return !input.items.some((i) => i.guestId === g.id || i.guestName.trim().toLowerCase() === key);
  });

  const beats: AfterBeatState[] = AFTER_BEATS.map((b) => {
    if (daysAgo == null || daysAgo < 0) return { ...b, state: "wait" };
    let done = false;
    if (b.id === "cards" || b.id === "deadline") done = open.length === 0 && cards.length > 0;
    if (b.id === "reviews") done = unmarked.length === 0 && input.vendors.length > 0;
    if (b.id === "returns") done = daysAgo > b.toDay;
    if (done) return { ...b, state: "done" };
    if (daysAgo >= b.fromDay && daysAgo <= b.toDay) return { ...b, state: "now" };
    if (daysAgo < b.fromDay) return { ...b, state: "soon" };
    return { ...b, state: "soon" };
  });

  const pct =
    daysAgo == null || daysAgo < 0
      ? 0
      : Math.min(100, Math.round((Math.max(0, daysAgo) / AFTER_DAYS) * 100));

  return {
    daysAgo,
    daysLeft,
    pct,
    current,
    beats,
    open,
    sent,
    nextWrite: open.slice(0, 5),
    missing,
    unmarked,
    noShow,
    seedable,
    pace: cardPace(open.length, daysLeft),
    names: input.names || "us",
  };
}

export function cardPrompt(card: AfterCard, names: string) {
  return writeCard(card, names);
}
