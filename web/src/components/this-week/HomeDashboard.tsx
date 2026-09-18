"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BudgetStatus } from "@/components/v2/BudgetStatus";
import { money } from "@/lib/visual-rooms";
import type { BudgetPhaseId } from "@/lib/budget-plan";
import type { WeekItem } from "@/lib/this-week";

type ActiveProject = { title: string; stage: string; progress: number; cost: number; href: string };
type NextPayment = { label: string; amount: number; dueDate?: string } | null;

export function HomeDashboard({
  names,
  dateLine,
  tagline,
  days,
  weekItems,
  spent,
  cap,
  agreed,
  phase,
  guestTotal,
  guestResponded,
  vendorBooked,
  vendorPending,
  nextUp,
  nextPayment,
  activeProject,
  season = "planning",
  coverUrl,
}: {
  days: number | null;
  coverUrl?: string;
  names: string;
  dateLine: string;
  tagline?: string;
  weekItems: WeekItem[];
  spent: number;
  cap: number;
  agreed: number;
  phase: BudgetPhaseId;
  guestTotal: number;
  guestResponded: number;
  vendorBooked: number;
  vendorPending: number;
  nextUp: { when: string; title: string; href: string }[];
  nextPayment: NextPayment;
  activeProject: ActiveProject | null;
  season?: "planning" | "after";
}) {
  const router = useRouter();
  const [open, setOpen] = useState(weekItems.slice(0, 5));
  const first = names.split(" & ")[0] || names;
  const headline =
    days == null ? "Set the date" : days === 0 ? "Today is the day" : days > 0 ? `${days} days to go` : `${Math.abs(days)} days ago`;
  const photo = coverUrl || "/brand/tablescape.jpg";

  async function dismiss(id: string) {
    setOpen((rows) => rows.filter((row) => row.id !== id));
    await fetch("/api/this-week", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    router.refresh();
  }

  return (
    <div className="pb-12">
      <section className="relative min-h-[22rem] overflow-hidden border-b border-line">
        <img src={photo} alt="" className="absolute inset-0 h-full w-full object-cover object-[center_40%]" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/20" />
        <div className="relative mx-auto flex min-h-[22rem] max-w-6xl items-end px-5 pb-9 pt-20 sm:px-10">
          <div className="max-w-2xl text-ivory">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-champagne">Home</p>
            <h1 className="mt-3 font-serif text-[clamp(2.8rem,7vw,5.2rem)] leading-[0.94] tracking-[-0.04em]">
              Welcome back, {first}.
            </h1>
            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
              <p className="font-serif text-2xl">{headline}</p>
              {dateLine ? <p className="text-xs uppercase tracking-[0.15em] text-white/80">{dateLine}</p> : null}
            </div>
            <p className="mt-3 max-w-xl text-sm text-white/80">
              {season === "after" ? tagline || "The three months." : tagline || "Turn the next decision into a finished handoff."}
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-8 px-5 py-8 sm:px-10">
        <section id="attention" aria-labelledby="attention-title" className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[1.4rem] border border-line bg-surface p-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="kicker kicker-moss">{season === "after" ? "The three months" : "Needs attention"}</p>
                <h2 id="attention-title" className="mt-2 font-serif text-3xl">
                  The next five decisions
                </h2>
              </div>
              <Link href={season === "after" ? "/after" : "/planning"} className="text-sm font-medium underline underline-offset-4">
                Open overview
              </Link>
            </div>
            {open.length ? (
              <ol className="mt-5 divide-y divide-line">
                {open.map((row, index) => (
                  <li key={row.id} className="grid grid-cols-[2rem_minmax(0,1fr)_2.75rem] items-center gap-3 py-3">
                    <span className="font-serif text-xl text-muted">{String(index + 1).padStart(2, "0")}</span>
                    <Link href={row.href} className="min-w-0">
                      <span className="block font-medium">{row.title}</span>
                      <span className="mt-0.5 block truncate text-sm text-muted">{row.detail}</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => dismiss(row.id)}
                      aria-label={`Mark ${row.title} done`}
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-line text-sm hover:bg-paper"
                    >
                      ✓
                    </button>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-6 rounded-2xl bg-moss-soft p-5 text-sm">Nothing is asking for you right now.</p>
            )}
          </div>

          <div className="space-y-4">
            <Link href={activeProject?.href || "/studio"} className="block rounded-[1.4rem] bg-ink p-6 text-ivory">
              <p className="text-xs uppercase tracking-[0.18em] text-champagne">Active Studio build</p>
              <h2 className="mt-3 font-serif text-3xl leading-tight">{activeProject?.title || "Start from a photo"}</h2>
              {activeProject ? (
                <>
                  <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/20">
                    <div className="h-full bg-sage" style={{ width: `${activeProject.progress}%` }} />
                  </div>
                  <div className="mt-2 flex justify-between text-xs text-white/75">
                    <span>{activeProject.stage.replaceAll("_", " ")}</span>
                    <span>
                      {activeProject.progress}% · {money(activeProject.cost)}
                    </span>
                  </div>
                </>
              ) : (
                <p className="mt-3 text-sm text-white/75">Upload a look, confirm the recipe, then source, build and pack it.</p>
              )}
            </Link>
            <Link href={nextPayment ? "/payments" : "/budget"} className="block rounded-[1.4rem] border border-line bg-surface p-5">
              <p className="kicker">Next payment</p>
              <p className="mt-2 font-serif text-2xl">{nextPayment ? money(nextPayment.amount) : "Nothing due"}</p>
              <p className="mt-1 text-sm text-muted">
                {nextPayment
                  ? `${nextPayment.label}${nextPayment.dueDate ? ` · ${nextPayment.dueDate}` : ""}`
                  : "Open Budget when a payment is scheduled."}
              </p>
            </Link>
          </div>
        </section>

        <BudgetStatus phase={phase} budget={cap} now={spent} agreed={agreed} />

        <section aria-labelledby="readiness-title">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="kicker">Readiness</p>
              <h2 id="readiness-title" className="mt-2 font-serif text-3xl">
                One source of truth
              </h2>
            </div>
            {nextUp[0] ? (
              <Link href={nextUp[0].href} className="text-sm underline underline-offset-4">
                {nextUp[0].when}: {nextUp[0].title}
              </Link>
            ) : null}
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Link href="/guests" className="rounded-[1.4rem] border border-line bg-surface p-5">
              <p className="kicker">Guest replies</p>
              <p className="mt-2 font-serif text-4xl tabular-nums">
                {guestResponded}
                <span className="text-xl text-muted"> / {guestTotal}</span>
              </p>
              <p className="mt-1 text-sm text-muted">invitation records replied</p>
            </Link>
            <Link href="/vendors" className="rounded-[1.4rem] border border-line bg-surface p-5">
              <p className="kicker">Vendor team</p>
              <p className="mt-2 font-serif text-4xl tabular-nums">{vendorBooked}</p>
              <p className="mt-1 text-sm text-muted">{vendorPending} active leads</p>
            </Link>
            <Link href="/together" className="rounded-[1.4rem] border border-line bg-surface p-5">
              <p className="kicker">Together</p>
              <p className="mt-2 font-serif text-2xl leading-tight">Owners, calls and handoffs</p>
              <p className="mt-2 text-sm text-muted">See who needs to weigh in.</p>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
