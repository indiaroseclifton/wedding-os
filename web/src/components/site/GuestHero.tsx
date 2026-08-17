"use client";

import type { ReactNode } from "react";
import { motion, fadeUp, stagger } from "@/components/motion";

export function GuestHero({
  names,
  date,
  location,
  coverUrl,
  mode = "invite",
  night = false,
  compact = false,
  children,
}: {
  names: string;
  date?: string | null;
  location?: string;
  coverUrl?: string;
  mode?: "invite" | "announce";
  night?: boolean;
  compact?: boolean;
  children?: ReactNode;
}) {
  const height = compact
    ? "h-[28vh] min-h-[160px]"
    : coverUrl
      ? "h-[42vh] min-h-[240px] sm:h-[52vh]"
      : "min-h-[220px] bg-champagne/40";
  const fade = night
    ? "bg-gradient-to-t from-[#141311] via-[#141311]/40 to-ink/40"
    : "bg-gradient-to-t from-paper via-paper/25 to-ink/30";

  return (
    <div className={`relative overflow-hidden ${height} ${!coverUrl && night ? "bg-[#1c1a16]" : ""}`}>
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
          <div className={`absolute inset-0 ${fade}`} />
        </>
      ) : (
        <div className={`absolute inset-0 ${night ? "bg-[#1c1a16]" : "bg-gradient-to-b from-champagne/50 to-paper"}`} />
      )}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className={`relative px-5 text-center ${coverUrl || compact ? "absolute inset-x-0 bottom-0 pb-6" : "pt-16 pb-8"}`}
      >
        <motion.p variants={fadeUp} className={`kicker ${night ? "text-champagne" : "kicker-moss"}`}>
          {mode === "announce" ? "We got married" : "You're invited"}
        </motion.p>
        <motion.h1
          variants={fadeUp}
          className={`mt-2 font-serif tracking-tight ${night ? "text-[#f3efe6]" : "text-ink"} ${
            compact ? "text-3xl" : "text-[clamp(2.1rem,8vw,3.4rem)]"
          }`}
        >
          {names}
        </motion.h1>
        {!compact && date && (
          <motion.p variants={fadeUp} className={`mt-2 text-sm ${night ? "text-[#f3efe6]/80" : "text-ink-soft"}`}>
            {date}
          </motion.p>
        )}
        {!compact && location && (
          <motion.p variants={fadeUp} className={`text-sm ${night ? "text-[#f3efe6]/80" : "text-ink-soft"}`}>
            {location}
          </motion.p>
        )}
        {children ? <motion.div variants={fadeUp} className="mt-5">{children}</motion.div> : null}
      </motion.div>
    </div>
  );
}
