"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { HowToButton } from "@/components/v2/HowToPop";
import { FLOOR_PLANNER } from "@/lib/print-center";

const JOBS = [
  {
    id: "floor-sheets",
    title: "Floor sheets",
    line: "The room as paper. Sent here from Floor Planner.",
    href: "/floorplan",
  },
  {
    id: "cards",
    title: "Cards",
    line: "Place cards, menus, programs.",
    href: "/studio/cards",
  },
  {
    id: "signs",
    title: "Signs",
    line: "Welcome, seating, bar, restrooms.",
    href: "/studio/signage",
  },
];

export default function PrintCenterPage() {
  const from = useSearchParams().get("from");
  const fromPlanner = from === "floorplan";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted">Studio</p>
          <h1 className="font-serif text-4xl tracking-tight">Print Center</h1>
          <p className="mt-2 max-w-xl text-sm text-muted">
            {fromPlanner
              ? "Floor Planner sent this over. Choose the sheet and send it to the printer."
              : "Sheets, cards, and signs. Floor Planner opens this when you print."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <HowToButton id="print-center" />
          <Link href={FLOOR_PLANNER.href} className="rounded-full border border-line px-3 py-1.5 text-xs">
            Floor Planner
          </Link>
        </div>
      </div>

      {fromPlanner ? (
        <p className="rounded-[1.2rem] border border-line bg-moss-soft px-4 py-3 text-sm">
          Incoming from Floor Planner. Floor sheets first.
        </p>
      ) : null}

      <ul className="grid gap-3 sm:grid-cols-3">
        {JOBS.map((job) => (
          <li key={job.id}>
            <Link
              href={job.href}
              className={`block rounded-[1.4rem] border bg-surface p-5 ${
                fromPlanner && job.id === "floor-sheets" ? "border-ink" : "border-line"
              }`}
            >
              <p className="font-serif text-2xl">{job.title}</p>
              <p className="mt-2 text-sm text-muted">{job.line}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
