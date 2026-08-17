"use client";

import Link from "next/link";
import { useState } from "react";
import type { WeekItem } from "@/lib/this-week";

export function SundayCard({ next, brief }: { next: WeekItem | null; brief: string }) {
  const [gone, setGone] = useState(false);
  if (!next || gone) {
    return <p className="max-w-xl text-base leading-7 text-ink">{brief}</p>;
  }
  return (
    <div className="max-w-xl space-y-3">
      <p className="kicker kicker-moss">This hour</p>
      <p className="font-serif text-3xl leading-tight">{next.title}</p>
      <p className="text-sm leading-6 text-ink-soft">{next.detail || brief}</p>
      <div className="flex flex-wrap gap-2">
        <Link
          href={next.href}
          className="inline-flex min-h-11 items-center rounded-full bg-moss px-5 text-sm font-medium text-ivory"
        >
          {next.cta}
        </Link>
        <button
          type="button"
          onClick={async () => {
            await fetch("/api/this-week", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id: next.id }),
            });
            setGone(true);
          }}
          className="min-h-11 rounded-full border border-line px-4 text-sm"
        >
          Not this week
        </button>
      </div>
    </div>
  );
}
