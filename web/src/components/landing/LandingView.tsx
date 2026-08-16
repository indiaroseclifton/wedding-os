"use client";

import Link from "next/link";
import { BrandMark } from "@/components/brand/BrandMark";
import { ProductPreview } from "@/components/landing/ProductPreview";
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
      <div className="min-h-screen bg-night text-ivory">
        <section className="relative min-h-screen overflow-hidden">
          <motion.img
            src="/brand/tablescape.jpg"
            alt=""
            initial={{ scale: 1.16 }}
            animate={{ scale: 1 }}
            transition={{ duration: 10, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 h-full w-full object-cover object-[center_28%]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />

          <header className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-5 py-5 sm:px-10">
            <p className="flex items-center gap-2 font-serif text-lg tracking-tight">
              <BrandMark className="text-champagne" />
              Wedding OS
            </p>
            <Link
              href="/login"
              className="rounded-full bg-champagne px-4 py-2 text-xs font-medium text-night"
            >
              Sign in
            </Link>
          </header>

          <div className="relative mx-auto grid min-h-screen max-w-6xl items-end gap-10 px-5 pb-12 pt-28 sm:px-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:pb-16">
            <motion.div variants={stagger} initial="hidden" animate="show">
              <motion.p
                variants={fadeUp}
                className="text-[11px] font-medium uppercase tracking-[0.34em] text-champagne"
              >
                Hire or make it yourself
              </motion.p>
              <motion.h1
                variants={fadeUp}
                className="mt-5 font-serif text-[clamp(3.2rem,8vw,6.4rem)] leading-[0.92] tracking-[-0.04em]"
              >
                The wedding
                <br />
                you’re actually
                <br />
                throwing.
              </motion.h1>
              <motion.p variants={fadeUp} className="mt-6 max-w-md text-base leading-7 text-white/70">
                Coordination that looks like the day. Vendors, DIY, guests, and the hour-by-hour —
                one stage.
              </motion.p>
              <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/login"
                  className="rounded-full bg-champagne px-6 py-2.5 text-sm font-medium text-night"
                >
                  Open your wedding
                </Link>
                <Link
                  href="/login"
                  className="rounded-full border border-white/30 px-6 py-2.5 text-sm font-medium text-white"
                >
                  Try the demo
                </Link>
              </motion.div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="lg:mt-16"
            >
              <ProductPreview />
            </motion.div>
          </div>
        </section>

        <motion.section
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="mx-auto grid max-w-6xl gap-4 px-5 py-16 sm:grid-cols-3 sm:px-10"
        >
          {CARDS.map((c) => (
            <motion.article
              key={c.k}
              variants={fadeUp}
              whileHover={{ y: -6 }}
              className="group relative aspect-[4/5] overflow-hidden rounded-[1.5rem]"
            >
              <img
                src={c.src}
                alt=""
                className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <p className="text-[11px] uppercase tracking-[0.22em] text-champagne">{c.k}</p>
                <h2 className="mt-1 font-serif text-2xl leading-tight">{c.t}</h2>
                <p className="mt-2 text-sm leading-6 text-white/70">{c.d}</p>
              </div>
            </motion.article>
          ))}
        </motion.section>
      </div>
    </MotionRoot>
  );
}
