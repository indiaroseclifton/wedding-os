import { getWorkspaceGuests, getWorkspaceTasks } from "@/lib/data/workspace";
import { listVendors } from "@/lib/data/vendors-store";
import { listPackages } from "@/lib/data/handoffs-store";
import { listSends } from "@/lib/data/sends-store";
import { getSeatingPlan } from "@/lib/data/seating-plan-store";
import { listPayments } from "@/lib/data/payments-store";
import { getDayOf } from "@/lib/data/dayof-store";
import { getChecklist } from "@/lib/data/checklist-store";
import { getBudget } from "@/lib/data/budget-store";
import { flagCount } from "@/lib/data/contract-review";
import { PLAYBOOKS } from "@/lib/data/diy-playbooks";
import { hasMailingAddress, isPendingRsvp } from "@/lib/data/guest-mail";
import { getDismissedWeek } from "@/lib/data/week-dismiss-store";
import type { StoredTask } from "@/lib/data/store";

export type WeekUrgency = "now" | "week" | "soon";

export type WeekItem = {
  id: string;
  urgency: WeekUrgency;
  title: string;
  detail: string;
  href: string;
  cta: string;
};

export function daysUntil(date?: string, today = new Date()) {
  if (!date) return null;
  const due = new Date(`${date}T00:00:00`);
  if (Number.isNaN(due.getTime())) return null;
  const start = new Date(today);
  start.setHours(0, 0, 0, 0);
  return Math.round((due.getTime() - start.getTime()) / 86400000);
}

function isOverdue(dueDate?: string, today = new Date()) {
  const d = daysUntil(dueDate, today);
  return d != null && d < 0;
}

function inWeek(dueDate?: string, today = new Date()) {
  const d = daysUntil(dueDate, today);
  return d != null && d >= 0 && d <= 7;
}

function currentPhases(days: number | null) {
  if (days == null) return ["12-18"];
  if (days < 0) return ["after"];
  if (days <= 7) return ["week", "1"];
  if (days <= 35) return ["1", "week"];
  if (days <= 90) return ["2-3"];
  if (days <= 150) return ["4-5"];
  if (days <= 240) return ["6-8"];
  if (days <= 330) return ["9-11"];
  return ["12-18"];
}

function weekday(today = new Date()) {
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][today.getDay()];
}

function taskOpen(t: StoredTask) {
  return t.status !== "DONE";
}

export async function loadThisWeek(
  workspaceId: string,
  weddingDate?: string,
  today = new Date()
) {
  const [tasks, guests, vendors, packages, payments, dayOf, checklist, budget, sends, seatingPlan] =
    await Promise.all([
      getWorkspaceTasks(workspaceId),
      getWorkspaceGuests(workspaceId),
      listVendors(workspaceId),
      listPackages(workspaceId),
      listPayments(workspaceId),
      getDayOf(workspaceId),
      getChecklist(workspaceId),
      getBudget(workspaceId),
      listSends(workspaceId),
      getSeatingPlan(workspaceId),
    ]);

  const days = daysUntil(weddingDate, today);
  const items: WeekItem[] = [];

  if (!weddingDate) {
    items.push({
      id: "set-date",
      urgency: "now",
      title: "Set the wedding date",
      detail: "Home, checklist, and DIY week only work once the date is in Settings.",
      href: "/settings",
      cta: "Add date",
    });
  }

  const overduePay = payments.filter((p) => p.status !== "PAID" && (p.status === "OVERDUE" || isOverdue(p.dueDate, today)));
  if (overduePay.length) {
    const total = overduePay.reduce((s, p) => s + (p.amount || 0), 0);
    items.push({
      id: "pay-overdue",
      urgency: "now",
      title: `${overduePay.length} overdue payment${overduePay.length === 1 ? "" : "s"}`,
      detail: `$${total.toLocaleString()} sitting unpaid.`,
      href: "/payments",
      cta: "Open payments",
    });
  }

  const weekPay = payments.filter((p) => p.status !== "PAID" && inWeek(p.dueDate, today));
  if (weekPay.length) {
    items.push({
      id: "pay-week",
      urgency: "week",
      title: `${weekPay.length} payment${weekPay.length === 1 ? "" : "s"} due this week`,
      detail: weekPay.map((p) => `${p.label}${p.dueDate ? ` · ${p.dueDate}` : ""}`).join(" · "),
      href: "/payments",
      cta: "Pay or mark paid",
    });
  }

  const flagged = vendors.filter((v) => flagCount(v.contractReview) > 0);
  if (flagged.length) {
    const n = flagged.reduce((s, v) => s + flagCount(v.contractReview), 0);
    items.push({
      id: "contract-flags",
      urgency: "now",
      title: `${n} contract flag${n === 1 ? "" : "s"} to ask about`,
      detail: flagged.map((v) => v.name).join(", "),
      href: `/vendors/${flagged[0].id}`,
      cta: "Review contract",
    });
  }

  const sentIds = new Set(sends.filter((s) => s.status === "SENT").map((s) => s.vendorId));
  const unsentBooked = vendors.filter(
    (v) => ["BOOKED", "PAID_DEPOSIT", "DONE"].includes(v.status) && !sentIds.has(v.id)
  );
  if (unsentBooked.length) {
    items.push({
      id: "send-packets",
      urgency: days != null && days <= 21 ? "now" : "week",
      title: `${unsentBooked.length} booked vendor${unsentBooked.length === 1 ? "" : "s"} without a packet`,
      detail: unsentBooked.map((v) => v.name).join(" · "),
      href: "/send",
      cta: "Send packets",
    });
  }

  const openQs = sends.flatMap((s) => (s.questions || []).filter((q) => !q.answer));
  if (openQs.length) {
    items.push({
      id: "vendor-questions",
      urgency: "now",
      title: `${openQs.length} vendor question${openQs.length === 1 ? "" : "s"} waiting`,
      detail: openQs.map((q) => q.body).slice(0, 2).join(" · "),
      href: "/send",
      cta: "Answer",
    });
  }

  const chasePending = guests.filter((g) => g.rsvp === "UNKNOWN" || g.rsvp === "INVITED" || g.rsvp === "MAYBE");
  if (chasePending.length >= 3) {
    items.push({
      id: "chase-rsvp",
      urgency: days != null && days <= 35 ? "now" : "week",
      title: `${chasePending.length} still haven’t answered`,
      detail: "A click is not a seat. Chase them.",
      href: "/guests/chase",
      cta: "Open the chase",
    });
  }

  const silentAsk = vendors.filter((v) =>
    (v.asks || []).some((a) => !a.answer && Date.now() - new Date(a.at).getTime() > 7 * 86400000)
  );
  if (silentAsk.length) {
    items.push({
      id: "ask-silent",
      urgency: "now",
      title: `${silentAsk.length} vendor${silentAsk.length === 1 ? "" : "s"} silent on the first ask`,
      detail: silentAsk.map((v) => v.name).join(" · "),
      href: "/send/ask",
      cta: "See the asks",
    });
  }

  if (days != null && days < 0) {
    items.push({
      id: "after-now",
      urgency: "now",
      title: "The three months have started",
      detail: "Thank-yous, leftover flowers, mark the team.",
      href: "/after",
      cta: "Open After",
    });
  }

  const coming = guests.filter((g) => g.rsvp !== "NO");
  const unseated = coming.filter((g) => !g.tableLabel);
  if (coming.length >= 8 && unseated.length >= 4) {
    items.push({
      id: "seat-people",
      urgency: days != null && days <= 21 ? "now" : "week",
      title: `${unseated.length} guests still need a table`,
      detail: seatingPlan.constraints.length
        ? `${seatingPlan.constraints.length} seating rule${seatingPlan.constraints.length === 1 ? "" : "s"} on the chart`
        : "Auto-seat leftovers, then freeze before you send the venue.",
      href: "/seating",
      cta: "Open seating",
    });
  }

  const overdueTasks = tasks.filter((t) => taskOpen(t) && isOverdue(t.dueDate, today));
  if (overdueTasks.length) {
    items.push({
      id: "tasks-overdue",
      urgency: "now",
      title: `${overdueTasks.length} overdue task${overdueTasks.length === 1 ? "" : "s"}`,
      detail: overdueTasks.slice(0, 3).map((t) => t.title).join(" · "),
      href: "/tasks",
      cta: "Open tasks",
    });
  }

  const weekTasks = tasks.filter((t) => taskOpen(t) && inWeek(t.dueDate, today));
  if (weekTasks.length) {
    items.push({
      id: "tasks-week",
      urgency: "week",
      title: `${weekTasks.length} task${weekTasks.length === 1 ? "" : "s"} due this week`,
      detail: weekTasks.slice(0, 3).map((t) => t.title).join(" · "),
      href: "/tasks",
      cta: "Do these",
    });
  }

  const pending = guests.filter((g) => isPendingRsvp(g.rsvp));
  const showRsvp = guests.length > 0 && (days == null || days <= 150);
  if (showRsvp && pending.length) {
    items.push({
      id: "rsvp",
      urgency: days != null && days <= 45 ? "now" : "week",
      title: `${pending.length} guest${pending.length === 1 ? "" : "s"} haven’t RSVP’d`,
      detail: "Nudge from the list — personal links are already there.",
      href: "/guests",
      cta: "Nudge RSVPs",
    });
  }

  const missingAddr = guests.filter((g) => g.rsvp === "YES" && !hasMailingAddress(g));
  if (missingAddr.length) {
    items.push({
      id: "address",
      urgency: "week",
      title: `${missingAddr.length} yes missing a mailing address`,
      detail: "You’ll want these for thank-yous.",
      href: "/guests",
      cta: "Ask for addresses",
    });
  }

  const slots = dayOf.schedule || [];
  if (days != null && days <= 45 && slots.length) {
    const holes = slots.filter((s) => !s.lead?.trim() && !s.assignee?.trim());
    if (holes.length) {
      items.push({
        id: "ros-leads",
        urgency: days <= 14 ? "now" : "week",
        title: `${holes.length} run-of-show beat${holes.length === 1 ? "" : "s"} have no lead`,
        detail: holes.slice(0, 3).map((s) => s.title).join(" · "),
        href: "/run-of-show",
        cta: "Assign leads",
      });
    }
    if (!(dayOf.rainSchedule || []).length) {
      items.push({
        id: "rain",
        urgency: days <= 14 ? "now" : "soon",
        title: "No rain plan yet",
        detail: "Copy the main timeline and change locations before the week of.",
        href: "/run-of-show",
        cta: "Add rain plan",
      });
    }
  }

  if (days != null && days <= 21) {
    const unreceived = packages.filter((p) => p.status === "SHARED" && !p.receivedAt);
    if (unreceived.length) {
      items.push({
        id: "handoffs",
        urgency: days <= 7 ? "now" : "week",
        title: `${unreceived.length} packet${unreceived.length === 1 ? "" : "s"} not marked received`,
        detail: unreceived.map((p) => p.title).join(" · "),
        href: "/send",
        cta: "Open Send",
      });
    }
  }

  const diySlugs = new Set<string>();
  for (const line of budget.lines) {
    if (line.path !== "diy") continue;
    const hay = `${line.category} ${line.label}`.toLowerCase();
    for (const p of PLAYBOOKS) {
      if (hay.includes(p.slug.replace("-", " ")) || hay.includes(p.title.toLowerCase())) {
        diySlugs.add(p.slug);
      }
    }
  }
  if (days != null && days <= 14) {
    if (!vendors.some((v) => /flower|florist/i.test(`${v.category} ${v.name}`))) {
      diySlugs.add("flowers");
    }
    if (!vendors.some((v) => /decor|rental/i.test(`${v.category} ${v.name}`))) {
      diySlugs.add("table-decor");
    }
  }

  const todayName = weekday(today);
  if (days != null && days <= 14) {
    for (const slug of diySlugs) {
      const book = PLAYBOOKS.find((p) => p.slug === slug);
      if (!book?.weekTasks?.length) continue;
      const todayBeat = book.weekTasks.find((t) => t.day === todayName);
      const rest = book.weekTasks.filter((t) => t.day !== todayName);
      if (todayBeat) {
        items.push({
          id: `diy-today-${slug}`,
          urgency: "now",
          title: `${book.title}: ${todayBeat.what}`,
          detail: "Today’s DIY beat — this is the YouTube-replacement.",
          href: `/diy/${slug}`,
          cta: "Open playbook",
        });
      } else if (rest[0]) {
        items.push({
          id: `diy-week-${slug}`,
          urgency: "week",
          title: `${book.title} this week`,
          detail: rest.map((t) => `${t.day}: ${t.what}`).join(" · "),
          href: `/diy/${slug}`,
          cta: "Open playbook",
        });
      }
    }
  }

  const phases = currentPhases(days);
  const openCheck = checklist.items.filter((i) => !i.done && phases.includes(i.phase));
  for (const item of openCheck.slice(0, 2)) {
    items.push({
      id: `check-${item.id}`,
      urgency: phases[0] === "week" || phases[0] === "1" ? "week" : "soon",
      title: item.title,
      detail: "From the planning checklist.",
      href: "/checklist",
      cta: "Mark it",
    });
  }

  const rank: Record<WeekUrgency, number> = { now: 0, week: 1, soon: 2 };
  items.sort((a, b) => rank[a.urgency] - rank[b.urgency]);
  const dismissed = new Set(await getDismissedWeek(workspaceId));
  const visible = items.filter((i) => !dismissed.has(i.id));

  const now = visible.filter((i) => i.urgency === "now").length;
  const week = visible.filter((i) => i.urgency === "week").length;

  return {
    days,
    items: visible.slice(0, 12),
    now,
    week,
    counts: {
      pendingRsvp: pending.length,
      missingAddr: missingAddr.length,
      overduePay: overduePay.length,
      flags: flagged.reduce((s, v) => s + flagCount(v.contractReview), 0),
    },
  };
}
