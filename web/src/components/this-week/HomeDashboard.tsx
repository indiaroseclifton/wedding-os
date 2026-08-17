"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/icons";
import { money } from "@/lib/visual-rooms";
import type { WeekItem } from "@/lib/this-week";

const STRIP = [
  { href: "/guests", label: "Guests", icon: "users" },
  { href: "/vendors", label: "Vendors", icon: "bag" },
  { href: "/planning", label: "Planning", icon: "calendar" },
  { href: "/day-of", label: "The Day", icon: "plate" },
  { href: "/budget", label: "Budget", icon: "dollar" },
  { href: "/registry", label: "Registry", icon: "gift" },
] as const;

function whenFor(item: WeekItem, i: number) {
  if (item.urgency === "now") return i === 0 ? "Today" : "Now";
  if (item.urgency === "week") return i === 1 ? "Tomorrow" : i === 2 ? "2 days" : "This week";
  return i === 3 ? "Oct 20" : "Soon";
}

export function HomeDashboard({
  names,
  dateLine,
  tagline,
  days,
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
  coverUrl?: string;
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
      <img src="/brand/flowers.jpg" alt="" className="home-bloom" />
      <div className="home-bloom-wash" />

      <div className="home-grid">
        <div className="home-hero">
          <h1 className="font-serif text-[clamp(2.55rem,4.4vw,3.4rem)] leading-none tracking-[-0.038em] text-ink">
            {names}
          </h1>
          {dateLine ? <p className="kicker mt-3">{dateLine}</p> : null}
          <p className="home-count mt-4">{headline}</p>
          <p className="home-days mt-1">{sub}</p>
          <p className="home-script mt-4">{tagline || "The adventure begins…"}</p>
          <Link
            href="/planning"
            className="mt-5 inline-flex h-10 items-center rounded-full bg-moss px-5 text-[13px] font-medium tracking-wide text-moss-fg"
          >
            View our plan
          </Link>
        </div>

        <aside className="home-week panel px-5 py-5">
          <div className="flex items-center justify-between">
            <p className="kicker">This week</p>
            <Link href="/checklist" className="text-[12px] text-muted hover:text-ink">
              View all
            </Link>
          </div>
          <ul className="mt-1">
            {open.length === 0 ? (
              <li className="py-4 text-sm text-muted">You’re clear this week.</li>
            ) : (
              open.map((row, i) => (
                <li key={row.id} className="desk-row py-[0.7rem]">
                  <button
                    type="button"
                    onClick={() => dismiss(row.id)}
                    aria-label={`Done: ${row.title}`}
                    className="relative h-[17px] w-[17px] shrink-0 rounded-full border border-ink/18 after:absolute after:left-1/2 after:top-1/2 after:h-11 after:w-11 after:-translate-x-1/2 after:-translate-y-1/2 hover:border-moss"
                  />
                  <Link href={row.href} className="min-w-0 truncate text-[14px] text-ink">
                    {row.title}
                  </Link>
                  <span className="shrink-0 text-[12px] text-muted">{whenFor(row, i)}</span>
                </li>
              ))
            )}
          </ul>
          <div className="mt-2 border-t border-line pt-4">
            <p className="kicker">Budget overview</p>
            <p className="mt-2 font-serif text-[2.2rem] leading-none tracking-tight">{money(spent)}</p>
            <p className="mt-1 text-sm text-muted">of {cap ? money(cap) : "—"}</p>
            <div className="mt-3 flex items-center gap-3">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
                <div className="h-full rounded-full bg-moss" style={{ width: `${pct}%` }} />
              </div>
              <span className="text-[12px] tabular-nums text-muted">{pct}%</span>
            </div>
          </div>
        </aside>

        <nav className="home-strip panel grid grid-cols-3 divide-x divide-line/80 sm:grid-cols-6">
          {STRIP.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex min-h-[4.85rem] flex-col items-center justify-center gap-1.5 text-moss/75 hover:text-ink"
            >
              <Icon name={item.icon} className="h-[22px] w-[22px]" />
              <span className="text-[12px] tracking-wide">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="home-stats grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Link href="/guests" className="home-stat panel">
            <div className="flex items-start justify-between">
              <p className="kicker">Guests</p>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-paper text-moss">
                <Icon name="users" />
              </span>
            </div>
            <div>
              <p className="font-serif text-[2.05rem] leading-none tracking-tight">{guestTotal}</p>
              <p className="mt-1 text-sm text-muted">Invited</p>
              <div className="mt-3 flex items-center justify-between border-t border-line pt-2.5 text-sm">
                <span>{guestResponded} Responded</span>
                <span className="text-muted">›</span>
              </div>
            </div>
          </Link>

          <Link href="/vendors" className="home-stat panel">
            <div className="flex items-start justify-between">
              <p className="kicker">Vendors</p>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-paper text-moss">
                <Icon name="leaf" />
              </span>
            </div>
            <div>
              <p className="font-serif text-[2.05rem] leading-none tracking-tight">{vendorBooked}</p>
              <p className="mt-1 text-sm text-muted">Booked</p>
              <div className="mt-3 flex items-center justify-between border-t border-line pt-2.5 text-sm">
                <span>{vendorPending} Pending</span>
                <span className="text-muted">›</span>
              </div>
            </div>
          </Link>

          <Link href="/budget" className="home-stat panel">
            <div className="flex items-start justify-between">
              <p className="kicker">Budget</p>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-paper text-moss">
                <Icon name="dollar" />
              </span>
            </div>
            <div>
              <p className="font-serif text-[2.05rem] leading-none tracking-tight">{money(spent)}</p>
              <p className="mt-1 text-sm text-muted">of {cap ? money(cap) : "—"}</p>
              <div className="mt-3 border-t border-line pt-2.5">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
                    <div className="h-full rounded-full bg-moss" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-[12px] tabular-nums text-muted">{pct}%</span>
                </div>
              </div>
            </div>
          </Link>

          <Link href={nextUp[0]?.href || "/checklist"} className="home-stat panel">
            <div className="flex items-start justify-between">
              <p className="kicker">Next up</p>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-paper text-moss">
                <Icon name="calendar" />
              </span>
            </div>
            <div className="space-y-2.5">
              {(nextUp.length ? nextUp : [{ when: "Soon", title: "Nothing dated yet", href: "/checklist" }])
                .slice(0, 2)
                .map((n) => (
                  <div key={n.title}>
                    <p className="font-medium leading-tight text-ink">{n.when}</p>
                    <p className="text-sm text-muted">{n.title}</p>
                  </div>
                ))}
            </div>
          </Link>
        </div>

        <section className="home-rooms panel p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="kicker">Your rooms</p>
            <Link href="/rooms" className="text-[12px] text-muted hover:text-ink">
              View all
            </Link>
          </div>
          <Link href="/rooms" className="group block overflow-hidden rounded-xl">
            <img
              src="/brand/rooms/guests.jpg"
              alt=""
              className="aspect-[16/9] w-full object-cover transition duration-700 group-hover:scale-[1.04]"
            />
          </Link>
          <div className="mt-2.5 grid grid-cols-3 gap-2">
            {[
              { src: "/brand/rooms/planning.jpg", href: "/planning" },
              { src: "/brand/rooms/day.jpg", href: "/day-of" },
              { src: "/brand/rooms/vendors.jpg", href: "/vendors" },
            ].map((r) => (
              <Link key={r.src} href={r.href} className="group overflow-hidden rounded-lg">
                <img src={r.src} alt="" className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-[1.05]" />
              </Link>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
