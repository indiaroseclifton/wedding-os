"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion, fadeUp, stagger } from "@/components/motion";
import { money } from "@/lib/visual-rooms";
import { VISUAL_ROOMS } from "@/lib/visual-rooms";
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
  coverUrl,
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
  const photo = coverUrl || "/brand/tablescape.jpg";

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
    <div className="pb-10">
      <section className="relative min-h-[78vh] overflow-hidden">
        <motion.img
          src={photo}
          alt=""
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 12, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 h-full w-full object-cover object-[center_30%]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/30" />
        <div className="relative mx-auto flex min-h-[78vh] max-w-6xl flex-col justify-end px-5 pb-10 pt-16 sm:px-10 sm:pb-14">
          <motion.div variants={stagger} initial="hidden" animate="show" className="max-w-xl text-ivory">
            <motion.p variants={fadeUp} className="text-[11px] font-medium uppercase tracking-[0.34em] text-champagne">
              Plan it. Make it. Celebrate it.
            </motion.p>
            <motion.h1
              variants={fadeUp}
              className="mt-4 font-serif text-[clamp(3rem,8vw,5.6rem)] leading-[0.92] tracking-[-0.04em]"
            >
              Welcome back,
              <br />
              {first}.
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-4 text-base text-white/70">
              {season === "after" ? tagline || "The three months." : "Let’s create a day that feels like you."}
            </motion.p>
            <motion.p variants={fadeUp} className="mt-6 font-serif text-[clamp(4rem,12vw,7rem)] leading-none tracking-[-0.05em]">
              {headline}
            </motion.p>
            <motion.p variants={fadeUp} className="mt-2 text-sm uppercase tracking-[0.18em] text-white/65">
              {sub}
              {dateLine ? `  ·  ${dateLine}` : ""}
            </motion.p>
            <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-3">
              <Link
                href={season === "after" ? "/after" : "/planning"}
                className="rounded-full bg-champagne px-6 py-2.5 text-sm font-medium text-night"
              >
                {season === "after" ? "Today’s card" : "Open Before"}
              </Link>
              <Link href="/diy/studio/floral" className="rounded-full border border-white/30 px-6 py-2.5 text-sm font-medium text-white">
                Flower Studio
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-8 px-5 py-10 sm:px-10">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-muted">The rooms</p>
          <h2 className="mt-2 font-serif text-3xl tracking-tight sm:text-4xl">Before. Studio. The day. After.</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {VISUAL_ROOMS.map((room) => (
              <Link key={room.href} href={room.href} className="group relative aspect-[4/5] overflow-hidden rounded-[1.4rem]">
                <img src={room.photo} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 text-ivory">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-champagne">{room.label}</p>
                  <p className="mt-1 font-serif text-2xl leading-tight">{room.line}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <aside className="rounded-[1.4rem] border border-line bg-surface p-6">
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted">{season === "after" ? "The three months" : "This week"}</p>
            {open[0] ? (
              <Link href={open[0].href} className="mt-3 block">
                <p className="font-serif text-3xl leading-tight">{open[0].title}</p>
                <p className="mt-2 text-sm text-muted">{open[0].detail}</p>
              </Link>
            ) : (
              <p className="mt-4 text-sm text-muted">You’re clear this week.</p>
            )}
            <ul className="mt-5 space-y-2">
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

          <div className="grid grid-cols-2 gap-3">
            <Link href="/guests" className="rounded-[1.4rem] border border-line bg-surface p-5">
              <p className="text-[11px] uppercase tracking-[0.16em] text-muted">Guests</p>
              <p className="mt-2 font-serif text-4xl tabular-nums">{guestTotal}</p>
              <p className="mt-1 text-xs text-muted">{guestResponded} in · {Math.max(0, guestTotal - guestResponded)} out</p>
            </Link>
            <Link href="/budget" className="rounded-[1.4rem] border border-line bg-surface p-5">
              <p className="text-[11px] uppercase tracking-[0.16em] text-muted">Budget</p>
              <p className="mt-2 font-serif text-3xl">{money(spent)}</p>
              <div className="mt-3 h-1 overflow-hidden rounded-full bg-line">
                <div className="h-full bg-sage" style={{ width: `${pct}%` }} />
              </div>
            </Link>
            <Link href="/vendors" className="rounded-[1.4rem] border border-line bg-surface p-5">
              <p className="text-[11px] uppercase tracking-[0.16em] text-muted">Vendors</p>
              <p className="mt-2 font-serif text-4xl tabular-nums">{vendorBooked}</p>
              <p className="mt-1 text-xs text-muted">{vendorPending} still open</p>
            </Link>
            <Link href={nextUp[0]?.href || "/diy/studio/floral"} className="rounded-[1.4rem] border border-line bg-surface p-5">
              <p className="text-[11px] uppercase tracking-[0.16em] text-muted">Studio</p>
              <p className="mt-2 font-serif text-2xl leading-tight">Make the centerpiece</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
