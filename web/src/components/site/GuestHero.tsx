"use client";

import { motion, fadeUp, stagger } from "@/components/motion";

export function GuestHero({
  names,
  date,
  location,
  coverUrl,
}: {
  names: string;
  date?: string | null;
  location?: string;
  coverUrl?: string;
}) {
  return (
    <div className={`relative overflow-hidden ${coverUrl ? "h-[56vh] min-h-[300px]" : "min-h-[240px] bg-champagne/40"}`}>
      {coverUrl ? (
        <>
          <motion.img
            src={coverUrl}
            alt=""
            initial={{ scale: 1.08 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-paper via-paper/25 to-ink/30" />
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-b from-champagne/50 to-paper" />
      )}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className={`relative px-5 pb-8 text-center ${coverUrl ? "absolute inset-x-0 bottom-0" : "pt-16"}`}
      >
        <motion.p variants={fadeUp} className="kicker kicker-moss">
          You're invited
        </motion.p>
        <motion.h1 variants={fadeUp} className="mt-3 font-serif text-5xl tracking-tight text-ink">
          {names}
        </motion.h1>
        {date && (
          <motion.p variants={fadeUp} className="mt-3 text-sm text-ink-soft">
            {date}
          </motion.p>
        )}
        {location && (
          <motion.p variants={fadeUp} className="text-sm text-ink-soft">
            {location}
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}
