"use client";

import Link from "next/link";
import { ProductPreview } from "@/components/landing/ProductPreview";
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
        <header className="flex items-center justify-between px-5 py-4 sm:px-8">
          <p className="flex items-center gap-2 text-sm font-medium tracking-tight">
            <BrandMark size={22} />
            Wedding OS
          </p>
          <Link
            href="/login"
            className="rounded-full bg-ink px-4 py-2 text-xs font-medium text-paper"
          >
            Sign in
          </Link>
        </header>

        <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 pb-16 pt-6 sm:px-8 lg:grid-cols-2 lg:gap-16 lg:pt-10">
          <motion.div variants={stagger} initial="hidden" animate="show">
            <motion.p
              variants={fadeUp}
              className="text-[11px] font-medium uppercase tracking-[0.22em] text-moss"
            >
              Hire or make it yourself
            </motion.p>
            <motion.h1
              variants={fadeUp}
              className="mt-4 text-4xl leading-[1.05] tracking-tight text-ink sm:text-5xl"
            >
              Plan the wedding you’re actually throwing
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="mt-4 max-w-md text-base leading-7 text-ink-soft"
            >
              One coordination hub — vendors, guests, the day itself — plus DIY playbooks so you
              don’t disappear into YouTube.
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
                className="rounded-full border border-line px-5 py-2.5 text-sm font-medium"
              >
                Try the demo
              </Link>
            </motion.div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <ProductPreview />
          </motion.div>
        </section>

        <motion.section
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          className="mx-auto grid max-w-6xl gap-4 px-5 pb-20 sm:grid-cols-3 sm:px-8"
        >
          {CARDS.map((c) => (
            <motion.article
              key={c.k}
              variants={fadeUp}
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 380, damping: 28 }}
              className="overflow-hidden rounded-xl border border-line bg-surface"
            >
              <div className="aspect-[16/10] overflow-hidden">
                <img src={c.src} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="p-4">
                <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-moss">{c.k}</p>
                <h2 className="mt-1 text-base font-medium tracking-tight">{c.t}</h2>
                <p className="mt-2 text-sm leading-6 text-ink-soft">{c.d}</p>
              </div>
            </motion.article>
          ))}
        </motion.section>
      </div>
    </MotionRoot>
  );
}
