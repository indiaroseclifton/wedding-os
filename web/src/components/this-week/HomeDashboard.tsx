"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/icons";
import { VISUAL_ROOMS, money } from "@/lib/visual-rooms";
import type { WeekItem } from "@/lib/this-week";

const STRIP = [
  { href: "/guests", label: "Guests", icon: "users" },
  { href: "/vendors", label: "Vendors", icon: "bag" },
  { href: "/planning", label: "Planning", icon: "calendar" },
  { href: "/day-of", label: "The Day", icon: "sun" },
  { href: "/budget", label: "Budget", icon: "wallet" },
  { href: "/registry", label: "Registry", icon: "gift" },
] as const;

function whenFor(item: WeekItem, i: number) {
  if (item.urgency === "now") return i === 0 ? "Today" : "Now";
  if (item.urgency === "week") return i === 1 ? "Tomorrow" : "This week";
  return "Soon";
}

export function HomeDashboard({
  days,
  coverUrl,
  names,
  dateLine,
  tagline,
  weekItems,
  spent,
  cap,
  guestTotal,
  guestResponded,
  vendorBooked,
  vendorPending,
  nextUp,
}: {
  days: number | null;
  coverUrl: string;
  names: string;
  dateLine: string;
  tagline?: string;
  weekItems: WeekItem[];
  spent: number;
  cap: number;
  guestTotal: number;
  guestResponded: number;
  vendorBooked: number;
  vendorPending: number;
  nextUp: { when: string; title: string; href: string }[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(weekItems.slice(0, 4));
  const headline = days == null ? "—" : days === 0 ? "0" : String(Math.abs(days));
  const sub = days == null ? "Set the date" : days === 0 ? "It’s the day" : days > 0 ? "days to go" : "days ago";
  const pct = cap > 0 ? Math.min(100, Math.round((spent / cap) * 100)) : 0;
  const rooms = VISUAL_ROOMS;
  const heroRoom = rooms[0];

  async function dismiss(id: string) {
    setOpen((rows) => rows.filter((r) => r.id !== id));
    await fetch("/api/this-week", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    router.refresh();
  }

  return (
    <div className="home-stage">
      <img src={coverUrl} alt="" className="home-bloom" />
      <div className="home-bloom-wash" />

      <div className="home-grid">
        <div className="min-w-0 space-y-5">
          <div className="pt-1">
            <h1 className="font-serif text-[clamp(2.6rem,5vw,3.6rem)] leading-none tracking-[-0.035em] text-ink">
              {names}
            </h1>
            {dateLine ? <p className="kicker mt-3">{dateLine}</p> : null}
            <p className="display mt-5 text-moss">{headline}</p>
            <p className="title -mt-1 text-ink">{sub}</p>
            <p className="mt-3 font-serif text-[1.35rem] italic leading-none text-ink-soft">
              {tagline || "The adventure begins…"}
            </p>
            <Link href="/planning" className="btn btn-primary mt-6 rounded-full px-6">
              View our plan
            </Link>
          </div>

          <div className="panel grid grid-cols-3 divide-x divide-line sm:grid-cols-6">
            {STRIP.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex min-h-20 flex-col items-center justify-center gap-1.5 py-4 text-ink-soft hover:text-ink"
              >
                <Icon name={item.icon} className="h-5 w-5" />
                <span className="text-xs">{item.label}</span>
              </Link>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Link href="/guests" className="panel flex flex-col justify-between p-5">
              <div className="flex items-start justify-between">
                <p className="kicker">Guests</p>
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-paper text-moss">
                  <Icon name="users" />
                </span>
              </div>
              <div>
                <p className="figure">{guestTotal}</p>
                <p className="text-sm text-muted">Invited</p>
                <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-sm">
                  <span className="text-ink">{guestResponded} Responded</span>
                  <span className="text-muted">›</span>
                </div>
              </div>
            </Link>

            <Link href="/vendors" className="panel flex flex-col justify-between p-5">
              <div className="flex items-start justify-between">
                <p className="kicker">Vendors</p>
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-paper text-moss">
                  <Icon name="leaf" />
                </span>
              </div>
              <div>
                <p className="figure">{vendorBooked}</p>
                <p className="text-sm text-muted">Booked</p>
                <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-sm">
                  <span className="text-ink">{vendorPending} Pending</span>
                  <span className="text-muted">›</span>
                </div>
              </div>
            </Link>

            <Link href="/budget" className="panel flex flex-col justify-between p-5">
              <div className="flex items-start justify-between">
                <p className="kicker">Budget</p>
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-paper text-moss">
                  <Icon name="dollar" />
                </span>
              </div>
              <div>
                <p className="figure">{money(spent)}</p>
                <p className="text-sm text-muted">of {cap ? money(cap) : "—"}</p>
                <div className="mt-4 border-t border-line pt-3">
                  <div className="flex items-center gap-3">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
                      <div className="h-full rounded-full bg-moss" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs tabular-nums text-muted">{pct}%</span>
                  </div>
                </div>
              </div>
            </Link>

            <Link href={nextUp[0]?.href || "/checklist"} className="panel flex flex-col justify-between p-5">
              <div className="flex items-start justify-between">
                <p className="kicker">Next up</p>
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-paper text-moss">
                  <Icon name="calendar" />
                </span>
              </div>
              <div className="space-y-3">
                {(nextUp.length ? nextUp : [{ when: "Soon", title: "Nothing dated yet", href: "/checklist" }])
                  .slice(0, 2)
                  .map((n) => (
                    <div key={n.title} className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-ink">{n.when}</p>
                        <p className="text-sm text-muted">{n.title}</p>
                      </div>
                      <span className="text-muted">›</span>
                    </div>
                  ))}
              </div>
            </Link>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="panel p-5">
            <div className="flex items-center justify-between">
              <p className="kicker">This week</p>
              <Link href="/checklist" className="text-xs text-muted hover:text-ink">
                View all
              </Link>
            </div>
            <ul className="mt-3 divide-y divide-line">
              {open.length === 0 ? (
                <li className="py-4 text-sm text-muted">You’re clear this week.</li>
              ) : (
                open.map((row, i) => (
                  <li key={row.id} className="desk-row py-2.5">
                    <button
                      type="button"
                      onClick={() => dismiss(row.id)}
                      aria-label={`Done: ${row.title}`}
                      className="relative h-5 w-5 shrink-0 rounded-full border border-ink/25 after:absolute after:left-1/2 after:top-1/2 after:h-11 after:w-11 after:-translate-x-1/2 after:-translate-y-1/2 hover:border-moss"
                    />
                    <Link href={row.href} className="min-w-0 text-sm text-ink">
                      {row.title}
                    </Link>
                    <span className="text-xs text-muted">{whenFor(row, i)}</span>
                  </li>
                ))
              )}
            </ul>
            <div className="mt-5 border-t border-line pt-4">
              <p className="kicker">Budget overview</p>
              <p className="figure mt-2 text-ink">{money(spent)}</p>
              <p className="text-sm text-muted">of {cap ? money(cap) : "—"}</p>
              <div className="mt-3 flex items-center gap-3">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-line">
                  <div className="h-full rounded-full bg-moss" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-xs tabular-nums text-muted">{pct}%</span>
              </div>
            </div>
          </div>

          <section className="panel p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="kicker">Your rooms</p>
              <Link href="/rooms" className="text-xs text-muted hover:text-ink">
                View all
              </Link>
            </div>
            <Link href={heroRoom.href} className="group block overflow-hidden rounded-2xl">
              <img
                src={heroRoom.photo}
                alt=""
                className="aspect-[16/9] w-full object-cover transition duration-700 group-hover:scale-[1.04]"
              />
            </Link>
            <div className="mt-3 grid grid-cols-3 gap-3">
              {rooms.slice(1, 4).map((r) => (
                <Link key={r.href} href={r.href} className="group overflow-hidden rounded-xl">
                  <img
                    src={r.photo}
                    alt={r.label}
                    className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-[1.05]"
                  />
                </Link>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
