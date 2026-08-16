"use client";

import Link from "next/link";
import { motion, fadeUp, stagger } from "@/components/motion";
import { VISUAL_ROOMS, firstNames, prettyWeddingDate } from "@/lib/visual-rooms";
import type { WeekItem, WeekUrgency } from "@/lib/this-week";

const URGENCY: Record<WeekUrgency, { label: string; className: string }> = {
  now: { label: "Do now", className: "bg-[#c45c4a]/20 text-[#f3c4bb]" },
  week: { label: "This week", className: "bg-white/10 text-[#eadec8]" },
  soon: { label: "Soon", className: "bg-white/5 text-white/55" },
};

export function CinematicDash({
  hello,
  coupleNames,
  location,
  days,
  date,
  weekCount,
  coverUrl,
  items,
}: {
  hello: string;
  coupleNames?: string;
  location?: string;
  days: number | null;
  date?: string;
  weekCount: number;
  coverUrl: string;
  items: WeekItem[];
}) {
  const names = firstNames(coupleNames, "You two");
  const pretty = prettyWeddingDate(date);
  const headline =
    days == null ? "Soon" : days === 0 ? "Today" : days > 0 ? String(days) : String(Math.abs(days));
  const sub =
    days == null
      ? "Set your date — this number becomes yours."
      : days === 0
        ? "It’s your day."
        : days > 0
          ? "days until you walk in"
          : "days since you walked in";

  return (
    <div className="space-y-6">
      <section className="relative min-h-[78vh] overflow-hidden rounded-[1.75rem]">
        <motion.img
          src={coverUrl}
          alt=""
          initial={{ scale: 1.12 }}
          animate={{ scale: 1 }}
          transition={{ duration: 8, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/15" />
        <div className="relative flex min-h-[78vh] flex-col justify-end px-5 pb-6 pt-16 sm:px-8 sm:pb-8">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="glass max-w-xl rounded-[1.4rem] p-6 sm:p-8"
          >
            <motion.p
              variants={fadeUp}
              className="text-[11px] font-medium uppercase tracking-[0.28em] text-[#eadec8]/85"
            >
              {hello}
            </motion.p>
            <motion.h1 variants={fadeUp} className="mt-2 font-serif text-3xl tracking-tight sm:text-4xl">
              {names}
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="mt-3 font-serif text-[clamp(4rem,14vw,7rem)] leading-[0.85] tracking-[-0.05em]"
            >
              {headline}
            </motion.p>
            <motion.p variants={fadeUp} className="mt-3 text-sm text-white/75">
              {sub}
              {pretty ? ` · ${pretty}` : ""}
              {location ? ` · ${location}` : ""}
              {weekCount > 0 ? ` · ${weekCount} live` : ""}
            </motion.p>
            <motion.div variants={fadeUp} className="mt-6 flex flex-wrap gap-2">
              <Link
                href="/settings"
                className="rounded-full bg-[#eadec8] px-4 py-2 text-xs font-medium text-[#1a1814]"
              >
                This is us
              </Link>
              <Link
                href="/media"
                className="rounded-full border border-white/25 px-4 py-2 text-xs font-medium text-white"
              >
                Change the photo
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <div>
        <p className="mb-3 font-serif text-2xl">Your rooms</p>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          {VISUAL_ROOMS.map((room) => (
            <Link
              key={room.href}
              href={room.href}
              className="group relative aspect-[4/3] overflow-hidden rounded-2xl"
            >
              <img
                src={room.photo}
                alt=""
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-3 text-[#f6f1e8]">
                <p className="font-serif text-xl">{room.label}</p>
                <p className="text-[11px] text-white/70">{room.line}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <motion.ul variants={stagger} initial="hidden" animate="show" className="space-y-2">
        {items.length === 0 ? (
          <li className="rounded-2xl border border-line bg-surface px-5 py-6 text-sm text-ink-soft">
            You’re clear. When something is due, it lands here.
          </li>
        ) : (
          items.map((item) => {
            const u = URGENCY[item.urgency];
            return (
              <motion.li key={item.id} variants={fadeUp}>
                <Link
                  href={item.href}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-moss px-5 py-4 text-moss-fg transition hover:-translate-y-0.5"
                >
                  <div className="min-w-0">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${u.className}`}>
                      {u.label}
                    </span>
                    <p className="mt-1.5 font-serif text-xl tracking-tight">{item.title}</p>
                    <p className="mt-0.5 text-xs text-white/55">{item.detail}</p>
                  </div>
                  <span className="rounded-full bg-[#eadec8] px-3 py-1.5 text-[11px] font-medium text-[#1a1814]">
                    {item.cta}
                  </span>
                </Link>
              </motion.li>
            );
          })
        )}
      </motion.ul>
    </div>
  );
}
