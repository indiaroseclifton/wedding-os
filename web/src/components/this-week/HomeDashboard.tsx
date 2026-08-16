import Link from "next/link";
import { VISUAL_ROOMS, money } from "@/lib/visual-rooms";
import type { WeekItem } from "@/lib/this-week";
import type { Suggestion } from "@/lib/smart-home";
import { PayWidget, RsvpWidget, ThisWeekWidget } from "@/components/this-week/HomeDesk";
import { RoomTile } from "@/components/layout/RoomTile";
import { ToolTable } from "@/components/layout/ToolTable";
import { SundayCard } from "@/components/this-week/SundayCard";

const QUICK = [
  { href: "/guests/new", label: "Add a guest" },
  { href: "/guests", label: "Nudge RSVPs" },
  { href: "/vendors/new", label: "Add a vendor" },
  { href: "/payments", label: "Log a payment" },
  { href: "/diy", label: "DIY studio" },
  { href: "/music", label: "DJ cues" },
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
  onboarded,
  firstWalkDone,
}: {
  days: number | null;
  coverUrl: string;
  weekItems: WeekItem[];
  spent: number;
  cap: number;
  brief: string;
  next: WeekItem | null;
  suggestions: Suggestion[];
  onboarded?: boolean;
  firstWalkDone?: boolean;
}) {
  const pct = cap > 0 ? Math.min(100, Math.round((spent / cap) * 100)) : 0;
  const headline =
    days == null ? "Set the date" : days === 0 ? "Today" : days > 0 ? String(days) : String(Math.abs(days));
  const sub = days == null ? "Add your date in Settings" : days === 0 ? "It’s the day" : days > 0 ? "days to go" : "days ago";
  const lead = VISUAL_ROOMS.filter((r) => r.rank === "lead");
  const support = VISUAL_ROOMS.filter((r) => r.rank !== "lead");

  return (
    <div className="space-y-10">
      {!onboarded && (
        <aside className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-moss px-4 py-3 text-sm text-ivory">
          <p>Four questions and the desk builds around your wedding.</p>
          <Link href="/onboard" className="min-h-11 rounded-full bg-ivory px-4 py-2 text-xs font-medium text-moss">
            Start setup
          </Link>
        </aside>
      )}
      {onboarded && !firstWalkDone && (
        <aside className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-surface/70 px-4 py-3 text-sm">
          <p>Names, one vendor, publish the site. Ten minutes.</p>
          <Link href="/start" className="min-h-11 rounded-full bg-moss px-4 py-2 text-xs font-medium text-ivory">
            First wedding
          </Link>
        </aside>
      )}

      <section className="relative overflow-hidden rounded-[1.8rem]">
        <img src={coverUrl} alt="" className="h-[22rem] w-full object-cover object-center sm:h-[26rem]" />
        <div className="absolute inset-0 bg-gradient-to-t from-paper via-paper/55 to-paper/10" />
        <div className="absolute inset-x-0 bottom-0 space-y-4 p-6 sm:p-10">
          <p className="font-serif text-[clamp(4.5rem,14vw,8rem)] leading-none tracking-tight text-ink">{headline}</p>
          <p className="text-sm uppercase tracking-[0.22em] text-ink-soft">{sub}</p>
          <SundayCard next={next} brief={brief} />
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ThisWeekWidget items={weekItems} />
        </div>
        <article className="glass-panel rounded-2xl p-5">
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted">Spent</p>
          <p className="mt-2 font-serif text-4xl tracking-tight tabular-nums">{money(spent)}</p>
          <p className="mt-1 text-sm text-muted">of {cap ? money(cap) : "no cap yet"}</p>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-line">
            <div className="h-full rounded-full bg-moss" style={{ width: `${pct}%` }} />
          </div>
        </article>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <RsvpWidget />
        <PayWidget />
      </section>

      <section>
        <p className="mb-3 text-[11px] uppercase tracking-[0.18em] text-muted">Do next</p>
        <div className="flex flex-wrap gap-2">
          {QUICK.map((q) => (
            <Link
              key={q.href}
              href={q.href}
              className="min-h-11 rounded-full border border-line bg-surface/50 px-4 py-2 text-sm backdrop-blur"
            >
              {q.label}
            </Link>
          ))}
        </div>
      </section>

      {suggestions.length > 0 && (
        <section>
          <p className="mb-3 text-[11px] uppercase tracking-[0.18em] text-muted">For you</p>
          <ul className="divide-y divide-line/80">
            {suggestions.slice(0, 3).map((s) => (
              <li key={s.id}>
                <Link href={s.href} className="flex items-baseline justify-between gap-4 py-3">
                  <span>
                    <span className="block text-sm font-medium">{s.title}</span>
                    <span className="text-xs text-muted">{s.detail}</span>
                  </span>
                  <span className="shrink-0 text-[10px] uppercase tracking-wide text-moss">{s.kind}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <ToolTable />

      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted">Rooms</p>
            <h2 className="font-serif text-3xl">Where you work</h2>
          </div>
          <Link href="/rooms" className="text-xs text-muted underline">
            All rooms
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {lead.map((room) => (
            <RoomTile key={room.href} {...room} />
          ))}
        </div>
        <div className="mt-3 grid grid-cols-3 gap-3">
          {support.map((room) => (
            <Link key={room.href} href={room.href} className="group">
              <div className="relative overflow-hidden rounded-xl">
                <img src={room.photo} alt="" className="aspect-[4/3] w-full object-cover opacity-45 saturate-50" />
                <div className="absolute inset-0 bg-gradient-to-t from-paper/90 to-paper/10" />
                <p className="absolute inset-x-0 bottom-2 px-2 font-serif text-lg text-ink">{room.label}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
