import { daysUntil } from "@/lib/this-week";
import type { WeekItem } from "@/lib/this-week";
import { hasMailingAddress, isPendingRsvp } from "@/lib/data/guest-mail";
import { effectiveStatus, type PaymentItem } from "@/lib/data/payments-store";
import type { StoredGuest } from "@/lib/data/store";
import type { StoredVendor } from "@/lib/data/vendors-store";
import type { VendorSend } from "@/lib/data/sends-store";
import { shapeCard } from "@/lib/shape";

export type SpotlightCard = {
  id: string;
  kicker: string;
  alert?: boolean;
  title: string;
  detail: string;
  href: string;
  cta: string;
  secondary?: string;
  snoozeId?: string;
};

export type AlsoItem = {
  id: string;
  title: string;
  when: string;
  href: string;
};

export function prettyLongDate(iso?: string) {
  if (!iso) return "";
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function fridayLabel() {
  const day = new Date().getDay();
  return day === 5 || day === 4 ? "By Friday" : "This week";
}

export function buildSpotlight(input: {
  guests: StoredGuest[];
  vendors: StoredVendor[];
  payments: PaymentItem[];
  sends: VendorSend[];
  weekItems: WeekItem[];
  spent: number;
  cap: number;
  weddingDate?: string;
  gatheringDate?: string;
  shape?: string;
  coverUrl: string;
}) {
  const pending = input.guests.filter((g) => isPendingRsvp(g.rsvp));
  const missingAddr = input.guests.filter((g) => g.rsvp === "YES" && !hasMailingAddress(g));
  const yeses = input.guests.filter((g) => g.rsvp === "YES").length;
  const sentIds = new Set(input.sends.filter((s) => s.status === "SENT").map((s) => s.vendorId));
  const booked = input.vendors.filter((v) => ["BOOKED", "PAID_DEPOSIT", "DONE"].includes(v.status));
  const noPacket = booked.filter((v) => !sentIds.has(v.id));

  const openPay = input.payments.filter((p) => effectiveStatus(p) !== "PAID");
  const overdue = openPay
    .filter((p) => effectiveStatus(p) === "OVERDUE" || (daysUntil(p.dueDate) ?? 1) < 0)
    .sort((a, b) => (a.dueDate || "").localeCompare(b.dueDate || ""));
  const nextPay = overdue[0] || openPay.sort((a, b) => (a.dueDate || "9999").localeCompare(b.dueDate || "9999"))[0];

  const cards: SpotlightCard[] = [];

  if (nextPay) {
    const late = (daysUntil(nextPay.dueDate) ?? 0) < 0 || effectiveStatus(nextPay) === "OVERDUE";
    const d = daysUntil(nextPay.dueDate);
    cards.push({
      id: "pay",
      kicker: late ? "Overdue" : d != null && d <= 2 ? "Due soon" : "Money",
      alert: late,
      title: nextPay.label || "Payment",
      detail: [
        late ? "Due yesterday" : d != null ? `Due in ${d} day${d === 1 ? "" : "s"}` : "Open",
        nextPay.amount ? `$${nextPay.amount.toLocaleString()}` : "",
        nextPay.vendorName,
      ]
        .filter(Boolean)
        .join(" · "),
      href: "/payments",
      cta: "Pay it",
      secondary: "Snooze",
      snoozeId: "pay-overdue",
    });
  } else {
    cards.push({
      id: "pay",
      kicker: "Ledger",
      title: "Nothing due",
      detail: "The books are quiet.",
      href: "/payments",
      cta: "Open ledger",
    });
  }

  if (pending.length) {
    cards.push({
      id: "rsvp",
      kicker: fridayLabel(),
      title: `${pending.length} RSVP${pending.length === 1 ? "" : "s"} out`,
      detail: missingAddr.length
        ? `${missingAddr.length} yes${missingAddr.length === 1 ? "" : "es"} missing an address`
        : "Nudge from the list — links are ready.",
      href: "/guests",
      cta: "Nudge them",
    });
  } else if (missingAddr.length) {
    cards.push({
      id: "rsvp",
      kicker: "Addresses",
      title: `${missingAddr.length} yes missing an address`,
      detail: "You’ll want these for thank-yous.",
      href: "/guests",
      cta: "Ask them",
    });
  } else {
    cards.push({
      id: "rsvp",
      kicker: "Guests",
      title: input.guests.length ? "List is current" : "Add the list",
      detail: input.guests.length ? "No open RSVPs." : "Home only works once people have names.",
      href: input.guests.length ? "/guests" : "/guests/new",
      cta: input.guests.length ? "Open guests" : "Add a guest",
    });
  }

  if (noPacket.length) {
    cards.push({
      id: "send",
      kicker: "This week",
      title: `${noPacket.length} no packet`,
      detail: noPacket
        .slice(0, 3)
        .map((v) => v.category || v.name)
        .join(", ")
        .toLowerCase(),
      href: "/send",
      cta: "Send packets",
    });
  } else {
    cards.push({
      id: "send",
      kicker: "Send",
      title: booked.length ? "Packets are out" : "No one booked yet",
      detail: booked.length ? "Refresh if the room or kitchen changed." : "Hire someone, then send once.",
      href: booked.length ? "/send" : "/vendors",
      cta: booked.length ? "Open send" : "Vendors",
    });
  }

  const used = new Set(["pay-overdue", "pay-week", "rsvp", "address", "send-packets"]);
  const alsoOpen: AlsoItem[] = input.weekItems
    .filter((i) => !used.has(i.id))
    .slice(0, 5)
    .map((i) => ({
      id: i.id,
      title: i.title,
      when: i.urgency === "now" ? "Now" : i.urgency === "week" ? "This week" : "Soon",
      href: i.href,
    }));

  const card = shapeCard(input.shape);

  return {
    cards,
    alsoOpen,
    replies: yeses,
    guestCount: input.guests.length,
    vendorCount: input.vendors.length,
    shapeTitle: card.title,
    dateLabel: prettyLongDate(input.weddingDate),
  };
}
