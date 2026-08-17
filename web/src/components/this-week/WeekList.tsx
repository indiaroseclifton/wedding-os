"use client";

import Link from "next/link";
import { motion, fadeUp, stagger } from "@/components/motion";
import type { WeekItem, WeekUrgency } from "@/lib/this-week";

const URGENCY: Record<WeekUrgency, { label: string; className: string }> = {
  now: { label: "Do now", className: "bg-clay-soft text-clay" },
  week: { label: "This week", className: "bg-moss-soft text-moss" },
  soon: { label: "Soon", className: "bg-paper text-muted" },
};

export function WeekList({ items }: { items: WeekItem[] }) {
  if (!items.length) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-line bg-surface p-5 text-sm text-ink-soft"
      >
        You’re clear. When a payment is due, an RSVP is missing, or flowers need hydrating, it
        shows up here.
      </motion.div>
    );
  }

  return (
    <motion.ul
      variants={stagger}
      initial="hidden"
      animate="show"
      className="divide-y divide-line rounded-xl border border-line bg-surface"
    >
      {items.map((item) => {
        const u = URGENCY[item.urgency];
        return (
          <motion.li
            key={item.id}
            variants={fadeUp}
            className="flex flex-wrap items-start justify-between gap-3 px-4 py-4"
          >
            <div className="min-w-0">
              <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${u.className}`}>
                {u.label}
              </span>
              <p className="mt-1.5 text-sm font-medium text-ink">{item.title}</p>
              <p className="mt-0.5 text-xs text-muted">{item.detail}</p>
            </div>
            <Link
              href={item.href}
              className="shrink-0 rounded-lg bg-moss px-3 py-2 text-xs font-medium text-moss-fg"
            >
              {item.cta}
            </Link>
          </motion.li>
        );
      })}
    </motion.ul>
  );
}

export function StatTiles({
  tiles,
}: {
  tiles: { href: string; label: string; value: string }[];
}) {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 gap-3 sm:grid-cols-4"
    >
      {tiles.map((c) => (
        <motion.div key={c.label} variants={fadeUp}>
          <Link
            href={c.href}
            className="block rounded-xl border border-line bg-surface p-4 hover:border-moss/30"
          >
            <p className="text-3xl font-medium tracking-tight text-ink">{c.value}</p>
            <p className="mt-1 text-xs text-muted">{c.label}</p>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
}
