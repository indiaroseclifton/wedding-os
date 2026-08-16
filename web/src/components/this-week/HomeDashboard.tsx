"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { money } from "@/lib/visual-rooms";
import type { SpotlightCard, AlsoItem } from "@/lib/home-spotlight";

export function HomeDashboard({
  days,
  coverUrl,
  dateLabel,
  shapeTitle,
  cards,
  alsoOpen,
  spent,
  cap,
  replies,
  onboarded,
  firstWalkDone,
}: {
  days: number | null;
  coverUrl: string;
  dateLabel: string;
  shapeTitle: string;
  cards: SpotlightCard[];
  alsoOpen: AlsoItem[];
  spent: number;
  cap: number;
  replies: number;
  onboarded?: boolean;
  firstWalkDone?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(alsoOpen);
  const headline =
    days == null ? "—" : days === 0 ? "0" : days > 0 ? String(days) : String(Math.abs(days));
  const sub = days == null ? "Set the date" : days === 0 ? "It’s the day" : days > 0 ? "Days to go" : "Days ago";
  const pct = cap > 0 ? Math.min(100, Math.round((spent / cap) * 100)) : 0;

  async function dismiss(id: string) {
    setOpen((rows) => rows.filter((r) => r.id !== id));
    await fetch("/api/this-week", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    router.refresh();
  }

  return (
    <div className="home-desk">
      {!onboarded && (
        <aside className="mx-5 mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-moss px-4 py-3 text-sm text-moss-fg sm:mx-8">
          <p>What kind of day — then the desk builds around it.</p>
          <Link href="/onboard" className="min-h-11 rounded-full bg-ivory px-4 py-2 text-xs font-medium text-moss">
            Start setup
          </Link>
        </aside>
      )}
      {onboarded && !firstWalkDone && (
        <aside className="mx-5 mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-surface/80 px-4 py-3 text-sm sm:mx-8">
          <p>Names, one vendor, publish the site. Ten minutes.</p>
          <Link href="/start" className="min-h-11 rounded-full bg-moss px-4 py-2 text-xs font-medium text-moss-fg">
            First wedding
          </Link>
        </aside>
      )}

      <section className="relative min-h-[28rem] overflow-hidden sm:min-h-[32rem]">
        <img src={coverUrl} alt="" className="home-hero-img absolute inset-0 h-full w-full object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-paper via-paper/25 to-transparent" />
        <div className="relative z-10 flex min-h-[28rem] flex-col justify-end px-5 pb-36 pt-16 sm:min-h-[32rem] sm:px-10 sm:pb-40">
          <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-ink/70">{shapeTitle}</p>
          <div className="mt-2 flex flex-wrap items-end gap-4">
            <p className="font-serif text-[clamp(5.5rem,16vw,9rem)] leading-[0.8] tracking-[-0.05em] text-ink">
              {headline}
            </p>
            <div className="mb-3">
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-ink-soft">{sub}</p>
              {dateLabel ? <p className="mt-1 font-serif text-2xl text-ink sm:text-3xl">{dateLabel}</p> : null}
            </div>
          </div>
        </div>

        <div className="absolute inset-x-4 bottom-0 z-20 translate-y-1/3 sm:inset-x-8">
          <div className="grid overflow-hidden rounded-[1.25rem] border border-line/80 bg-surface shadow-[0_24px_60px_-28px_rgba(20,16,10,0.35)] sm:grid-cols-3">
            {cards.map((card, i) => (
              <article
                key={card.id}
                className={`flex flex-col justify-between gap-5 p-5 sm:p-6 ${
                  i > 0 ? "border-t border-line sm:border-l sm:border-t-0" : ""
                }`}
              >
                <div>
                  <p
                    className={`text-[10px] font-medium uppercase tracking-[0.2em] ${
                      card.alert ? "text-clay" : "text-muted"
                    }`}
                  >
                    {card.alert ? "● " : ""}
                    {card.kicker}
                  </p>
                  <h2 className="mt-2 font-serif text-[1.65rem] leading-tight tracking-tight">{card.title}</h2>
                  <p className="mt-1.5 text-sm text-muted">{card.detail}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    href={card.href}
                    className="inline-flex min-h-10 items-center rounded-lg bg-moss px-3.5 text-sm font-medium text-moss-fg"
                  >
                    {card.cta}
                  </Link>
                  {card.secondary && card.snoozeId ? (
                    <button
                      type="button"
                      onClick={() => dismiss(card.snoozeId!)}
                      className="text-sm text-ink-soft underline-offset-4 hover:underline"
                    >
                      {card.secondary}
                    </button>
                  ) : card.secondary ? (
                    <Link href={card.href} className="text-sm text-ink-soft underline-offset-4 hover:underline">
                      {card.secondary}
                    </Link>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-28 grid gap-10 px-5 pb-16 sm:px-8 lg:grid-cols-[minmax(0,1fr)_16rem] lg:gap-12">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted">Also open</p>
          {open.length === 0 ? (
            <p className="mt-6 text-sm text-muted">You’re clear. When something is due, it lands here.</p>
          ) : (
            <ul className="mt-2 divide-y divide-line">
              {open.map((row) => (
                <li key={row.id} className="flex items-center gap-3 py-3.5">
                  <button
                    type="button"
                    onClick={() => dismiss(row.id)}
                    aria-label={`Done: ${row.title}`}
                    className="h-4 w-4 shrink-0 rounded-sm border border-ink/30 hover:border-moss hover:bg-moss-soft"
                  />
                  <Link href={row.href} className="min-w-0 flex-1 text-[15px] text-ink">
                    {row.title}
                  </Link>
                  <span className="shrink-0 text-xs text-muted">{row.when}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <aside className="space-y-10 border-t border-line pt-8 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted">Ledger</p>
            <p className="mt-2 font-serif text-5xl tracking-tight">{money(spent)}</p>
            <p className="mt-1 text-sm text-muted">committed of {cap ? money(cap) : "—"}</p>
            <div className="mt-4 h-px bg-line">
              <div className="h-0.5 bg-moss" style={{ width: `${pct}%` }} />
            </div>
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted">Replies</p>
            <p className="mt-2 font-serif text-5xl tracking-tight">{replies}</p>
            <p className="mt-1 text-sm text-muted">yes so far</p>
          </div>
        </aside>
      </section>
    </div>
  );
}
