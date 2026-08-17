"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { money } from "@/lib/visual-rooms";
import type { WeekItem } from "@/lib/this-week";

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
  season = "planning",
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
  season?: "planning" | "after";
}) {
  const router = useRouter();
  const [open, setOpen] = useState(weekItems.slice(0, 4));
  const first = names.split(" & ")[0] || names;
  const headline = days == null ? "—" : String(Math.abs(days));
  const sub = days == null ? "Set the date" : days === 0 ? "It’s the day" : days > 0 ? "days to go" : "days ago";
  const pct = cap > 0 ? Math.min(100, Math.round((spent / cap) * 100)) : 0;
  const yes = guestResponded;
  const pending = Math.max(0, guestTotal - guestResponded);

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
    <div className="space-y-6 px-4 py-6 sm:px-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="kicker">Vowfolk</p>
          <h1 className="mt-2 font-serif text-[clamp(2.2rem,5vw,3.2rem)] leading-none tracking-tight">
            Welcome back, {first}
          </h1>
          <p className="home-script mt-2">
            {season === "after" ? tagline || "The three months." : "Let’s create a day that feels like you."}
          </p>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <article className="panel overflow-hidden">
          <div className="grid sm:grid-cols-2">
            <div className="p-6">
              <p className="kicker">Your wedding</p>
              {dateLine ? <p className="mt-3 font-serif text-2xl tracking-tight">{dateLine}</p> : null}
              <p className="mt-6 font-serif text-6xl leading-none tabular-nums">{headline}</p>
              <p className="mt-1 text-sm text-muted">{sub}</p>
              <Link href={season === "after" ? "/after" : "/planning"} className="btn btn-primary mt-6">
                {season === "after" ? "Today’s card" : "View our plan"}
              </Link>
            </div>
            <div className="relative min-h-[14rem]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/tablescape.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
            </div>
          </div>
        </article>

        <aside className="panel p-6">
          <p className="kicker">{season === "after" ? "The three months" : "Next up"}</p>
          {open[0] ? (
            <Link href={open[0].href} className="mt-3 block">
              <p className="font-serif text-2xl leading-tight">{open[0].title}</p>
              <p className="mt-1 text-sm text-muted">{open[0].detail}</p>
            </Link>
          ) : (
            <p className="mt-4 text-sm text-muted">You’re clear this week.</p>
          )}
          <ul className="mt-4 space-y-2">
            {open.slice(1, 4).map((row) => (
              <li key={row.id} className="flex items-center gap-3 border-t border-line pt-2">
                <button
                  type="button"
                  onClick={() => dismiss(row.id)}
                  aria-label={`Done: ${row.title}`}
                  className="h-4 w-4 shrink-0 rounded-full border border-line"
                />
                <Link href={row.href} className="truncate text-sm">
                  {row.title}
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/guests" className="panel p-5">
          <p className="kicker">Guests</p>
          <p className="mt-2 font-serif text-4xl tabular-nums">{guestTotal}</p>
          <p className="mt-1 text-sm text-muted">{yes} responded · {pending} pending</p>
        </Link>
        <Link href="/budget" className="panel p-5">
          <p className="kicker">Budget</p>
          <p className="mt-2 font-serif text-4xl">{money(spent)}</p>
          <p className="mt-1 text-sm text-muted">{pct}% of {cap ? money(cap) : "—"}</p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-line">
            <div className="h-full rounded-full bg-sage" style={{ width: `${pct}%` }} />
          </div>
        </Link>
        <Link href="/vendors" className="panel p-5">
          <p className="kicker">Vendors</p>
          <p className="mt-2 font-serif text-4xl tabular-nums">{vendorBooked}</p>
          <p className="mt-1 text-sm text-muted">{vendorPending} still open</p>
        </Link>
        <Link href={nextUp[0]?.href || "/studio"} className="panel p-5">
          <p className="kicker">Studio</p>
          <p className="mt-2 font-serif text-2xl leading-tight">Make the day</p>
          <p className="mt-1 text-sm text-muted">Flowers, tables, signs, boxes</p>
        </Link>
      </div>
    </div>
  );
}
