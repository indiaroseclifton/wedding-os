import Link from "next/link";
import { VISUAL_ROOMS, money } from "@/lib/visual-rooms";
import type { WeekItem } from "@/lib/this-week";
import type { Suggestion } from "@/lib/smart-home";

export function HomeDashboard({
  days,
  coverUrl,
  weekItems,
  spent,
  cap,
  brief,
  next,
  suggestions,
}: {
  days: number | null;
  coverUrl: string;
  weekItems: WeekItem[];
  spent: number;
  cap: number;
  brief: string;
  next: WeekItem | null;
  suggestions: Suggestion[];
}) {
  const pct = cap > 0 ? Math.min(100, Math.round((spent / cap) * 100)) : 0;
  const headline =
    days == null ? "Set the date" : days === 0 ? "Today" : days > 0 ? String(days) : String(Math.abs(days));
  const sub = days == null ? "Add your date in Settings" : days === 0 ? "It’s the day" : days > 0 ? "DAYS TO GO" : "DAYS AGO";

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[1.6rem]">
        <img src={coverUrl} alt="" className="h-56 w-full object-cover object-center sm:h-72" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-black/15 to-transparent" />
        <div className="absolute inset-y-0 left-6 flex flex-col justify-center text-ivory sm:left-10">
          <p className="font-serif text-[clamp(3.5rem,10vw,5.5rem)] leading-none tracking-tight">{headline}</p>
          <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.28em] text-ivory/85">{sub}</p>
        </div>
      </section>

      <section className="rounded-2xl border border-line bg-surface p-5">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-moss">This morning</p>
        <p className="mt-2 max-w-2xl text-base leading-7 text-ink">{brief}</p>
        {next && (
          <Link
            href={next.href}
            className="mt-4 inline-flex rounded-full bg-moss px-5 py-2.5 text-sm font-medium text-ivory"
          >
            {next.cta}
          </Link>
        )}
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-line bg-surface p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">This Week</h2>
            <Link href="/checklist" className="text-[11px] font-medium uppercase tracking-wide text-muted">
              View all
            </Link>
          </div>
          <ul className="mt-4 space-y-3">
            {weekItems.slice(0, 4).map((item) => (
              <li key={item.id}>
                <Link href={item.href} className="flex items-start justify-between gap-3 text-sm">
                  <span className="flex items-start gap-2">
                    <span className="mt-0.5 inline-block h-4 w-4 rounded border border-line" />
                    {item.title}
                  </span>
                  <span className="shrink-0 text-[11px] text-muted">
                    {item.urgency === "now" ? "Today" : item.urgency === "week" ? "This week" : "Soon"}
                  </span>
                </Link>
              </li>
            ))}
            {!weekItems.length && <li className="text-sm text-muted">You’re clear this week.</li>}
          </ul>
        </article>

        <article className="rounded-2xl border border-line bg-surface p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Budget Overview</h2>
          </div>
          <p className="mt-4 font-serif text-4xl tracking-tight">{money(spent)}</p>
          <p className="mt-1 text-sm text-muted">of {cap ? money(cap) : "no cap yet"}</p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-line">
            <div className="h-full rounded-full bg-moss" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-2 text-right text-[11px] text-muted">{pct}%</p>
        </article>
      </div>

      {suggestions.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold">For you</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {suggestions.map((s) => (
              <Link
                key={s.id}
                href={s.href}
                className="rounded-2xl border border-line bg-surface p-4 hover:border-moss/30"
              >
                <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-moss">{s.kind}</p>
                <p className="mt-1 text-sm font-medium">{s.title}</p>
                <p className="mt-1 text-xs leading-5 text-muted">{s.detail}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Your Rooms</h2>
          <Link href="/rooms" className="text-[11px] font-medium uppercase tracking-wide text-muted">
            View all
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {VISUAL_ROOMS.map((room) => (
            <Link key={room.href} href={room.href} className="group text-center">
              <div className="overflow-hidden rounded-2xl">
                <img
                  src={room.photo}
                  alt=""
                  className="aspect-square w-full object-cover transition duration-500 group-hover:scale-105"
                />
              </div>
              <p className="mt-1.5 text-[11px] font-medium">{room.label}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
