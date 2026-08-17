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
      <section className="home-hero">
        <img
          src={coverUrl}
          alt=""
          className="home-hero-img absolute inset-0 h-full w-full object-cover object-[center_30%]"
        />
        <div className="home-hero-wash absolute inset-0" />
        <div className="absolute inset-x-0 bottom-0 px-6 pb-28 pt-24 sm:px-10 sm:pb-32">
          <p className="kicker kicker-soft">{shapeTitle}</p>
          <div className="mt-1 flex flex-wrap items-end gap-x-5 gap-y-1">
            <p className="font-serif text-[clamp(6rem,15vw,8.75rem)] leading-[0.78] tracking-[-0.055em] text-ink">
              {headline}
            </p>
            <div className="mb-2 min-w-0">
              <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-ink/50">{sub}</p>
              {dateLabel ? (
                <p className="mt-0.5 font-serif text-[clamp(1.6rem,4vw,2.35rem)] leading-none tracking-tight text-ink">
                  {dateLabel}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <div className="home-cards">
        <div className="lift grid overflow-hidden rounded-[1.15rem] bg-surface sm:grid-cols-3">
          {cards.map((card, i) => (
            <article
              key={card.id}
              className={`flex min-h-[13.5rem] flex-col justify-between gap-6 px-6 py-6 sm:px-7 sm:py-7 ${
                i > 0 ? "border-t border-line/80 sm:border-l sm:border-t-0" : ""
              }`}
            >
              <div>
                <p
                  className={`text-[10px] font-medium uppercase tracking-[0.2em] ${
                    card.alert ? "text-clay" : "text-muted"
                  }`}
                >
                  {card.alert ? <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-clay" /> : null}
                  {card.kicker}
                </p>
                <h2 className="mt-2.5 font-serif text-[1.7rem] leading-[1.15] tracking-tight">{card.title}</h2>
                <p className="mt-1.5 text-[13px] leading-5 text-muted">{card.detail}</p>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                {card.alert || card.id === "pay" ? (
                  <>
                    <Link
                      href={card.href}
                      className="inline-flex h-9 items-center rounded-md bg-moss px-3.5 text-[13px] font-medium text-moss-fg"
                    >
                      {card.cta}
                    </Link>
                    {card.secondary ? (
                      <button
                        type="button"
                        onClick={() => (card.snoozeId ? dismiss(card.snoozeId) : undefined)}
                        className="text-[13px] text-ink-soft"
                      >
                        {card.secondary}
                      </button>
                    ) : null}
                  </>
                ) : (
                  <Link href={card.href} className="text-[13px] font-medium text-ink underline underline-offset-[5px]">
                    {card.cta}
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>

      <section className="home-rest">
        <div className="span-8">
          <p className="kicker">Also open</p>
          {!onboarded ? (
            <p className="mt-3 text-sm text-muted">
              <Link href="/onboard" className="underline underline-offset-4">
                What kind of day is it?
              </Link>
              <span> The desk follows that.</span>
            </p>
          ) : null}
          {open.length === 0 ? (
            <p className="mt-6 text-sm text-muted">You’re clear. When something is due, it lands here.</p>
          ) : (
            <ul className="mt-1 divide-y divide-line">
              {open.map((row) => (
                <li key={row.id} className="desk-row py-3.5">
                  <button
                    type="button"
                    onClick={() => dismiss(row.id)}
                    aria-label={`Done: ${row.title}`}
                    className="h-[15px] w-[15px] shrink-0 rounded-[3px] border border-ink/25 hover:border-moss"
                  />
                  <Link href={row.href} className="min-w-0 text-[15px] text-ink">
                    {row.title}
                  </Link>
                  <span className="text-xs text-muted">{row.when}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <aside className="span-4 space-y-10 border-t border-line pt-8 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-1">
          <div>
            <p className="kicker">Ledger</p>
            <p className="mt-2 font-serif text-[3.25rem] leading-none tracking-tight">{money(spent)}</p>
            <p className="mt-2 text-sm text-muted">committed of {cap ? money(cap) : "—"}</p>
            <div className="mt-5 h-px bg-line">
              <div className="h-px bg-moss" style={{ width: `${Math.max(pct, 2)}%` }} />
            </div>
          </div>
          <div>
            <p className="kicker">Replies</p>
            <p className="mt-2 font-serif text-[3.25rem] leading-none tracking-tight">{replies}</p>
            <p className="mt-2 text-sm text-muted">yes so far</p>
          </div>
        </aside>
      </section>
    </div>
  );
}
