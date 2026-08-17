"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { DECOR_TRENDS, TREND_TAGS, money, scaleTrend } from "@/lib/decor-trends";

export default function DecorTrendsPage() {
  const [tag, setTag] = useState<string>("all");
  const [open, setOpen] = useState<string | null>(DECOR_TRENDS[0]?.id ?? null);
  const [tables, setTables] = useState(10);

  const list = useMemo(
    () => (tag === "all" ? DECOR_TRENDS : DECOR_TRENDS.filter((t) => t.tags.includes(tag))),
    [tag]
  );

  return (
    <div className="space-y-6 pb-16">
      <div>
        <p className="kicker kicker-moss">DIY · 2026</p>
        <h1 className="mt-1 font-serif text-4xl">What’s actually in.</h1>
        <p className="mt-2 max-w-xl text-sm text-muted">
          Event decoration this year — meadow aisles, fruit on the table, lamps instead of
          candelabras — and the honest DIY version of each, so you don’t watch eight hours of
          YouTube.
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setTag("all")}
          className={`rounded-full px-3 py-1.5 text-xs ${
            tag === "all" ? "bg-moss text-moss-fg" : "border border-line"
          }`}
        >
          All
        </button>
        {TREND_TAGS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTag(t)}
            className={`rounded-full px-3 py-1.5 text-xs ${
              tag === t ? "bg-moss text-moss-fg" : "border border-line"
            }`}
          >
            {t.replace("-", " ")}
          </button>
        ))}
      </div>

      <label className="flex max-w-sm flex-wrap items-center gap-3 text-xs">
        <span className="text-muted">Tables (for per-table looks)</span>
        <input
          type="range"
          min={4}
          max={24}
          value={tables}
          onChange={(e) => setTables(Number(e.target.value))}
          className="flex-1"
        />
        <span className="font-medium">{tables}</span>
      </label>
      <p className="text-[11px] text-muted">US 2026 grocery / wholesale vs florist. Your city moves this.</p>

      <ul className="space-y-3">
        {list.map((t) => {
          const on = open === t.id;
          const $ = scaleTrend(t, tables);
          return (
            <li key={t.id} className="overflow-hidden rounded-2xl border border-line bg-surface">
              <button
                type="button"
                onClick={() => setOpen(on ? null : t.id)}
                className="grid w-full gap-0 text-left sm:grid-cols-[11rem_minmax(0,1fr)]"
              >
                <img src={t.photo} alt="" className="aspect-[16/10] h-full w-full object-cover sm:aspect-auto" />
                <span className="p-4">
                  <span className="kicker kicker-moss">{t.year}</span>
                  <span className="mt-1 block font-serif text-2xl">{t.name}</span>
                  <span className="mt-1 block text-sm text-muted">{t.line}</span>
                  <span className="mt-2 block text-xs">
                    DIY {money($.diyLow)}–{money($.diyHigh)}
                    {t.price.hireHigh > 0 ? (
                      <span className="text-muted">
                        {" "}
                        · hire {money($.hireLow)}–{money($.hireHigh)}
                      </span>
                    ) : (
                      <span className="text-muted"> · you keep it</span>
                    )}
                    {t.price.unit === "table" ? <span className="text-muted"> · {tables} tables</span> : null}
                  </span>
                </span>
              </button>
              {on && (
                <div className="space-y-3 border-t border-line px-4 py-4 text-sm">
                  <p>{t.why}</p>
                  <p className="rounded-xl bg-paper px-3 py-2 text-xs">
                    {t.price.note}
                    {$.saveLow > 200 ? (
                      <span className="mt-1 block text-moss">
                        Doing it yourself is usually at least {money($.saveLow)} less than hiring the low end.
                      </span>
                    ) : null}
                  </p>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <p>
                      <span className="block kicker kicker-moss">DIY it</span>
                      {t.diy}
                    </p>
                    <p>
                      <span className="block kicker">Hire it</span>
                      {t.hire}
                    </p>
                    <p>
                      <span className="block kicker">Skip</span>
                      {t.skip}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {t.tools.map((tool) => (
                      <Link
                        key={tool.href}
                        href={tool.href}
                        className="rounded-full border border-line px-3 py-1.5 text-xs"
                      >
                        {tool.label}
                      </Link>
                    ))}
                    <Link
                      href={`/diy/studio/floral?story=${t.palette}`}
                      className="rounded-full bg-moss px-3 py-1.5 text-xs text-ivory"
                    >
                      Open {t.palette} palette
                    </Link>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
