"use client";

import Link from "next/link";
import { BrandMark } from "@/components/brand/BrandMark";
import { motion, fadeUp, stagger, MotionRoot } from "@/components/motion";

const CARDS = [
  {
    src: "/brand/setting.jpg",
    k: "Coordinate",
    t: "This week, not 40 tabs",
    d: "Payments, RSVPs, contracts, and holes in the day — one hallway.",
  },
  {
    src: "/brand/flowers.jpg",
    k: "DIY",
    t: "Flowers without the spiral",
    d: "Sources, recipes, shopping lists sized to your tables.",
  },
  {
    src: "/brand/garden.jpg",
    k: "The day",
    t: "A call sheet guests can open",
    d: "Run of show, seating, and a guest site that looks like you.",
  },
];

export function LandingView() {
  return (
    <MotionRoot>
    <div className="min-h-screen bg-paper text-ink">
      <header className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-5 py-4 sm:px-8">
        <p className="flex items-center gap-2 font-serif text-lg tracking-tight text-moss-fg">
          <BrandMark className="text-moss-fg" />
          Wedding OS
        </p>
        <Link
          href="/login"
          className="rounded-full bg-moss-fg/95 px-4 py-2 text-xs font-medium text-ink"
        >
          Sign in
        </Link>
      </header>

      <section className="relative min-h-[88vh] overflow-hidden">
        <motion.img
          src="/brand/tablescape.jpg"
          alt=""
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 h-full w-full object-cover object-[center_30%]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/25 to-ink/20" />
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="relative mx-auto flex min-h-[88vh] max-w-3xl flex-col justify-end px-5 pb-16 pt-28 sm:px-8 sm:pb-20"
        >
          <motion.p
            variants={fadeUp}
            className="text-[11px] font-medium uppercase tracking-[0.28em] text-moss-fg/80"
          >
            Hire or make it yourself
          </motion.p>
          <motion.h1
            variants={fadeUp}
            className="mt-3 font-serif text-5xl leading-[1.05] tracking-tight text-moss-fg text-balance sm:text-6xl"
          >
            Plan the wedding you’re actually throwing
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="mt-4 max-w-md text-base leading-7 text-moss-fg/85 text-pretty"
          >
            One coordination hub — vendors, guests, the day itself — plus DIY playbooks so you don’t
            disappear into YouTube.
          </motion.p>
          <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/login"
              className="rounded-full bg-moss px-5 py-2.5 text-sm font-medium text-moss-fg"
            >
              Open your wedding
            </Link>
            <Link
              href="/login"
              className="rounded-full border border-moss-fg/40 px-5 py-2.5 text-sm font-medium text-moss-fg"
            >
              Try the demo
            </Link>
          </motion.div>
        </motion.div>
      </section>

      <motion.section
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.25 }}
        className="mx-auto grid max-w-5xl gap-4 px-5 py-16 sm:grid-cols-3 sm:px-8"
      >
        {CARDS.map((c) => (
          <motion.article
            key={c.k}
            variants={fadeUp}
            whileHover={{ y: -4 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            className="overflow-hidden rounded-xl border border-line bg-surface"
          >
            <div className="aspect-[4/3] overflow-hidden">
              <img src={c.src} alt="" className="h-full w-full object-cover" />
            </div>
            <div className="p-4">
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-moss">{c.k}</p>
              <h2 className="mt-1 font-serif text-xl">{c.t}</h2>
              <p className="mt-2 text-sm leading-6 text-ink-soft">{c.d}</p>
            </div>
          </motion.article>
        ))}
      </motion.section>
    </div>
    </MotionRoot>
  );
}
