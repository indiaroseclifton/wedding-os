import Link from "next/link";
import { VISUAL_ROOMS, money } from "@/lib/visual-rooms";
import type { WeekItem } from "@/lib/this-week";
import type { Suggestion } from "@/lib/smart-home";
import { PayWidget, RsvpWidget, ThisWeekWidget } from "@/components/this-week/HomeDesk";

const QUICK = [
  { href: "/guests/new", label: "Add guest", line: "One name, or a plus-one", photo: "/brand/setting.jpg" },
  { href: "/guests", label: "Nudge RSVPs", line: "Who hasn’t replied", photo: "/brand/garden.jpg" },
  { href: "/vendors/new", label: "Add vendor", line: "Someone you already hired", photo: "/brand/flowers.jpg" },
  { href: "/payments", label: "Log a payment", line: "Deposit or balance", photo: "/brand/candles.jpg" },
  { href: "/diy", label: "DIY studio", line: "Flowers, tables, lists", photo: "/brand/flowers.jpg" },
  { href: "/music", label: "Must-play", line: "Preview and lock a song", photo: "/brand/candles.jpg" },
] as const;

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

      <section className="glass-panel rounded-2xl p-5">
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

      <section>
        <h2 className="mb-3 text-sm font-semibold">Quick actions</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {QUICK.map((q) => (
            <Link
              key={q.href}
              href={q.href}
              className="group overflow-hidden rounded-2xl border border-white/50 bg-surface/50 backdrop-blur-xl"
            >
              <div className="aspect-[5/3] overflow-hidden">
                <img
                  src={q.photo}
                  alt=""
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-3">
                <p className="text-sm font-medium">{q.label}</p>
                <p className="mt-0.5 text-[11px] leading-4 text-muted">{q.line}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <ThisWeekWidget items={weekItems} />

        <article className="glass-panel rounded-2xl p-5">
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

      <div className="grid gap-4 sm:grid-cols-2">
        <RsvpWidget />
        <PayWidget />
      </div>

      {suggestions.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold">For you</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {suggestions.map((s) => (
              <Link
                key={s.id}
                href={s.href}
                className="glass-panel rounded-2xl p-4 hover:border-moss/30"
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
