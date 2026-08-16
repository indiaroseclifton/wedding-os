"use client";

import Link from "next/link";
import { motion, fadeUp, stagger } from "@/components/motion";
import type { WeekItem, WeekUrgency } from "@/lib/this-week";

const URGENCY: Record<WeekUrgency, { label: string; className: string }> = {
  now: { label: "Do now", className: "bg-[#c45c4a]/20 text-[#f3c4bb]" },
  week: { label: "This week", className: "bg-white/10 text-[#eadec8]" },
  soon: { label: "Soon", className: "bg-white/5 text-white/55" },
};

export function CinematicDash({
  name,
  couple,
  location,
  days,
  date,
  weekCount,
  items,
  tiles,
}: {
  name: string;
  couple?: string;
  location?: string;
  days: number | null;
  date?: string;
  weekCount: number;
  items: WeekItem[];
  tiles: { href: string; label: string; value: string }[];
}) {
  const headline =
    days == null ? "Set the date" : days === 0 ? "Today" : days > 0 ? String(days) : String(Math.abs(days));
  const sub =
    days == null
      ? "Add names and a date in Settings."
      : days === 0
        ? "It’s the day."
        : days > 0
          ? "days until you walk in"
          : "days since";

  return (
    <div className="space-y-6">
      <section className="relative min-h-[72vh] overflow-hidden rounded-[1.75rem]">
        <motion.img
          src="/brand/candles.jpg"
          alt=""
          initial={{ scale: 1.14 }}
          animate={{ scale: 1 }}
          transition={{ duration: 8, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/20" />
        <div className="relative flex min-h-[72vh] flex-col justify-end px-6 pb-8 pt-16 sm:px-10 sm:pb-10">
          <motion.div variants={stagger} initial="hidden" animate="show">
            <motion.p
              variants={fadeUp}
              className="text-[11px] font-medium uppercase tracking-[0.32em] text-[#eadec8]/80"
            >
              {name}
            </motion.p>
            <motion.p
              variants={fadeUp}
              className="mt-4 font-serif text-[clamp(5rem,18vw,9.5rem)] leading-[0.85] tracking-[-0.05em] text-[#f6f1e8]"
            >
              {headline}
            </motion.p>
            <motion.p variants={fadeUp} className="mt-4 max-w-md text-base text-white/75">
              {sub}
              {couple ? ` · ${couple}` : ""}
              {location ? ` · ${location}` : ""}
              {date ? ` · ${date}` : ""}
              {weekCount > 0 ? ` · ${weekCount} live this week` : ""}
            </motion.p>
            <motion.div variants={fadeUp} className="mt-6 flex flex-wrap gap-2">
              <Link
                href="/settings"
                className="rounded-full bg-[#eadec8] px-4 py-2 text-xs font-medium text-[#1a1814]"
              >
                Wedding details
              </Link>
              <Link
                href="/people"
                className="rounded-full border border-white/25 px-4 py-2 text-xs font-medium text-white"
              >
                Invite someone
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <motion.ul
        variants={stagger}
        initial="hidden"
        animate="show"
        className="space-y-2"
      >
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
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#1c3d32]/10 bg-[#1c3d32] px-5 py-4 text-[#f6f1e8] transition hover:-translate-y-0.5 hover:bg-[#244a3d]"
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

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 gap-2 sm:grid-cols-4"
      >
        {tiles.map((t) => (
          <motion.div key={t.label} variants={fadeUp}>
            <Link
              href={t.href}
              className="block rounded-2xl border border-line bg-surface px-4 py-4 hover:border-moss/30"
            >
              <p className="font-serif text-3xl tracking-tight">{t.value}</p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-muted">{t.label}</p>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
