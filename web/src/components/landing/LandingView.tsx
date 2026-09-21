"use client";

import Link from "next/link";
import { ProductPreview } from "@/components/landing/ProductPreview";
import { MarketingNav } from "@/components/landing/MarketingNav";
import { motion, fadeUp, stagger, MotionRoot } from "@/components/motion";
import { DIRECTORY_CATEGORIES } from "@/lib/data/vendor-directory";

const ROOMS = [
  {
    src: "/brand/rooms/planning.jpg",
    k: "Plan",
    t: "The week, not a checklist tab",
    d: "Vision, vendors, packets, budget.",
  },
  {
    src: "/brand/rooms/guests.jpg",
    k: "People",
    t: "The list and the letter",
    d: "RSVP, seating, what they actually open.",
  },
  {
    src: "/brand/vision/linen-day.jpg",
    k: "Studio",
    t: "Let’s make the centerpiece",
    d: "Stems, tables, signs, boxes. Quantities, not inspiration.",
  },
  {
    src: "/brand/rooms/day.jpg",
    k: "The day",
    t: "A call sheet they can hold",
    d: "Then ninety days of thank-yous.",
  },
];

export function LandingView({ signedIn }: { signedIn?: boolean }) {
  return (
    <MotionRoot>
      <div className="min-h-screen bg-night text-ivory">
        <section className="relative min-h-screen overflow-hidden">
          <motion.img
            src="/brand/tablescape.jpg"
            alt=""
            initial={{ scale: 1.12 }}
            animate={{ scale: 1 }}
            transition={{ duration: 12, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 h-full w-full object-cover object-[center_30%]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/25" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/35" />
          <MarketingNav signedIn={signedIn} />

          <div className="relative mx-auto grid min-h-screen max-w-6xl items-end gap-10 px-5 pb-12 pt-28 sm:px-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:pb-16">
            <motion.div variants={stagger} initial="hidden" animate="show">
              <motion.p
                variants={fadeUp}
                className="text-[11px] font-medium uppercase tracking-[0.34em] text-champagne"
              >
                Made for DIY weddings.
              </motion.p>
              <motion.h1
                variants={fadeUp}
                className="mt-5 font-serif text-[clamp(3.2rem,8vw,6.4rem)] leading-[0.92] tracking-[-0.04em]"
              >
                Not another
                <br />
                wedding planner.
                <br />
                Make the day.
              </motion.h1>
              <motion.p
                variants={fadeUp}
                className="mt-6 max-w-md text-base leading-7 text-white/70"
              >
                Design the flowers, set the table and make the details your own.
                Vowfolk Studio connects your wedding mockups to materials,
                helpers, build dates and boxes.
              </motion.p>
              <motion.div
                variants={fadeUp}
                className="mt-8 flex flex-wrap gap-3"
              >
                <Link
                  href={signedIn ? "/studio" : "/login?next=/studio"}
                  className="rounded-full bg-champagne px-6 py-2.5 text-sm font-medium text-night"
                >
                  {signedIn ? "Open Studio" : "Start making"}
                </Link>
                <Link
                  href="/discover/vendors"
                  className="rounded-full border border-white/30 px-6 py-2.5 text-sm font-medium text-white"
                >
                  Browse vendors
                </Link>
              </motion.div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.7 }}
            >
              <ProductPreview />
            </motion.div>
          </div>
        </section>

        <section className="border-t border-white/10 bg-[#0c0e0b] px-5 py-16 sm:px-10">
          <div className="mx-auto max-w-6xl">
            <p className="text-[11px] uppercase tracking-[0.28em] text-champagne">
              The rooms
            </p>
            <h2 className="mt-3 max-w-xl font-serif text-4xl leading-tight sm:text-5xl">
              Make the day. Bring it all together.
            </h2>
            <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {ROOMS.map((c) => (
                <article
                  key={c.k}
                  className="group relative aspect-[4/5] overflow-hidden rounded-[1.4rem]"
                >
                  <img
                    src={c.src}
                    alt=""
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-champagne">
                      {c.k}
                    </p>
                    <h3 className="mt-1 font-serif text-2xl leading-tight">
                      {c.t}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-white/65">
                      {c.d}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-white/10 px-5 py-16 sm:px-10">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.28em] text-champagne">
                  Discovery
                </p>
                <h2 className="mt-3 font-serif text-4xl">
                  Find the team. Then keep them here.
                </h2>
              </div>
              <Link
                href="/discover/vendors"
                className="text-sm text-champagne underline"
              >
                All vendors
              </Link>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
              {DIRECTORY_CATEGORIES.slice(0, 12).map((c) => (
                <Link
                  key={c}
                  href={`/discover/vendors?category=${encodeURIComponent(c)}`}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-4 text-sm hover:bg-white/10"
                >
                  {c}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="grid border-t border-white/10 lg:grid-cols-2">
          <div className="relative min-h-[22rem]">
            <img
              src="/brand/vision/linen-day.jpg"
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
          <div className="flex flex-col justify-center px-6 py-16 sm:px-12">
            <p className="text-[11px] uppercase tracking-[0.28em] text-champagne">
              Studio
            </p>
            <h2 className="mt-3 font-serif text-4xl">
              Let’s make the centerpiece.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-7 text-white/65">
              Start with a reference photo. Shape a measured mockup, scale the
              recipe, account for spares and turn the approved design into a
              shared build and setup plan.
            </p>
            <Link
              href={signedIn ? "/studio" : "/login"}
              className="mt-6 text-sm text-champagne underline"
            >
              Open Studio
            </Link>
          </div>
        </section>

        <section className="border-t border-white/10 px-5 py-20 text-center sm:px-10">
          <p className="text-[11px] uppercase tracking-[0.28em] text-champagne">
            Free while we build
          </p>
          <h2 className="mx-auto mt-3 max-w-lg font-serif text-4xl">
            A wedding made by you. A plan made together.
          </h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href={signedIn ? "/dashboard" : "/login"}
              className="rounded-full bg-champagne px-6 py-2.5 text-sm font-medium text-night"
            >
              {signedIn ? "Back to your wedding" : "Create your wedding"}
            </Link>
            <Link
              href="/pricing"
              className="rounded-full border border-white/25 px-6 py-2.5 text-sm"
            >
              Pricing
            </Link>
          </div>
        </section>
      </div>
    </MotionRoot>
  );
}
