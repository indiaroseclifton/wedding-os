import { getPath, PATH_CATEGORIES } from "@/lib/data/path-store";
import { listVendors } from "@/lib/data/vendors-store";
import { getBudget } from "@/lib/data/budget-store";
import { getWorkspaceGuests } from "@/lib/data/workspace";
import { isPendingRsvp } from "@/lib/data/guest-mail";
import type { WeekItem } from "@/lib/this-week";
import { isBooked } from "@/lib/send/status";

export type Suggestion = {
  id: string;
  kind: "diy" | "budget" | "vendor" | "guest";
  title: string;
  detail: string;
  href: string;
};

export function morningBrief(items: WeekItem[], days: number | null) {
  const now = items.filter((i) => i.urgency === "now");
  const week = items.filter((i) => i.urgency === "week");
  const parts = [...now, ...week].slice(0, 3).map((i) => i.title.replace(/\.$/, ""));
  if (!parts.length) {
    return days != null && days > 0
      ? `You’re clear. ${days} days out — nothing is late.`
      : "You’re clear this week.";
  }
  return `${parts.join(". ")}.`;
}

export function nextBestAction(items: WeekItem[]): WeekItem | null {
  return items.find((i) => i.urgency === "now") || items[0] || null;
}

export async function loadSuggestions(
  workspaceId: string,
  days: number | null,
  spent: number,
  cap: number
): Promise<Suggestion[]> {
  const [path, vendors, budget, guests] = await Promise.all([
    getPath(workspaceId),
    listVendors(workspaceId),
    getBudget(workspaceId),
    getWorkspaceGuests(workspaceId),
  ]);

  const out: Suggestion[] = [];
  const booked = (re: RegExp) =>
    vendors.some((v) => re.test(`${v.category} ${v.name}`) && isBooked(v.status));

  if (days != null && days > 60 && !booked(/photo|photograph/i)) {
    out.push({
      id: "book-photo",
      kind: "vendor",
      title: "No photographer booked",
      detail:
        days > 180
          ? "This is the usual window. Good ones go first."
          : `${days} days left — book before weekends disappear.`,
      href: "/vendors/browse?category=Photographer",
    });
  }

  if (days != null && days > 90 && !booked(/venue|estate|barn|hall/i)) {
    out.push({
      id: "book-venue",
      kind: "vendor",
      title: "Venue still open",
      detail: "Date and place unlock the rest of the hallway.",
      href: "/vendors/browse?category=Venue",
    });
  }

  const flowerPath = path.choices.flowers;
  if (flowerPath === "diy" || (!flowerPath && !booked(/flower|florist/i) && days != null && days <= 120)) {
    out.push({
      id: "diy-flowers",
      kind: "diy",
      title: "You’re on the hook for flowers",
      detail: "Wholesale vs grocery, buckets for your table count, hydrate 3 days out.",
      href: "/diy/flowers",
    });
  }

  if (path.choices.tables === "diy") {
    out.push({
      id: "diy-tables",
      kind: "diy",
      title: "Table décor is DIY",
      detail: "Candles, linen, and what actually shows in photos — sized to your tables.",
      href: "/diy/table-decor",
    });
  }

  const undecided = PATH_CATEGORIES.filter((c) => !path.choices[c.id] || path.choices[c.id] === "undecided");
  if (undecided.length && (days == null || days > 30)) {
    out.push({
      id: "path-gaps",
      kind: "diy",
      title: `${undecided.length} categor${undecided.length === 1 ? "y" : "ies"} still hire-or-make`,
      detail: undecided
        .slice(0, 3)
        .map((c) => c.label)
        .join(", "),
      href: "/decisions/path",
    });
  }

  const flowerLine = budget.lines.filter((l) => /flower|floral/i.test(`${l.category} ${l.label}`));
  const flowerSpend = flowerLine.reduce((s, l) => s + (l.planned || l.actual || 0), 0);
  if (cap > 0 && flowerSpend / cap > 0.14) {
    out.push({
      id: "budget-florals",
      kind: "budget",
      title: "Florals are a big slice",
      detail: `${Math.round((flowerSpend / cap) * 100)}% of cap. Typical is 8–12% — fine if you meant it, or DIY the bulk.`,
      href: "/budget",
    });
  } else if (cap > 0 && spent / cap > 0.8) {
    out.push({
      id: "budget-hot",
      kind: "budget",
      title: "You’re over 80% of the cap",
      detail: "Next booking should be a no, a DIY, or a raise in Settings.",
      href: "/budget",
    });
  }

  const pendingA = guests.filter((g) => g.side === "A" && isPendingRsvp(g.rsvp)).length;
  const pendingB = guests.filter((g) => g.side === "B" && isPendingRsvp(g.rsvp)).length;
  if (pendingA + pendingB >= 6 && Math.max(pendingA, pendingB) >= 2 * Math.min(pendingA, pendingB || 1)) {
    const heavy = pendingA > pendingB ? "side A" : "side B";
    out.push({
      id: "rsvp-side",
      kind: "guest",
      title: `Most missing RSVPs are ${heavy}`,
      detail: `${pendingA} on A · ${pendingB} on B. Nudge that side first.`,
      href: "/guests",
    });
  }

  return out.slice(0, 4);
}
