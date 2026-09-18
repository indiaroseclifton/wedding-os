import Link from "next/link";
import { money } from "@/lib/budget-envelopes";
import { phaseCopy, type BudgetPhaseId } from "@/lib/budget-plan";

export function BudgetStatus({
  phase,
  budget,
  now,
  agreed,
}: {
  phase: BudgetPhaseId;
  budget: number;
  now: number;
  agreed: number;
}) {
  const copy = phaseCopy(phase);
  const against = budget || agreed || 1;
  const pct = Math.min(100, Math.round((agreed / against) * 100));
  const delta = budget ? budget - agreed : null;

  return (
    <Link
      href="/budget"
      className="block rounded-[1.6rem] border border-line bg-paper p-6 shadow-[0_18px_40px_-28px_rgba(28,26,22,0.35)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted">Budget</p>
          <h2 className="mt-1 font-serif text-3xl">{copy.label}</h2>
          <p className="mt-1 max-w-sm text-sm text-muted">{copy.line}</p>
        </div>
        <p className="font-serif text-3xl tabular-nums">{budget ? money(budget) : "—"}</p>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.16em] text-muted">Now</p>
          <p className="mt-1 font-serif text-2xl tabular-nums">{money(now)}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.16em] text-muted">Agreed</p>
          <p className="mt-1 font-serif text-2xl tabular-nums">{money(agreed)}</p>
        </div>
      </div>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-line">
        <div className={`h-full ${delta != null && delta < 0 ? "bg-clay" : "bg-moss"}`} style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-2 text-sm text-muted">
        {delta == null
          ? "Set the budget to watch the plan against the number."
          : delta >= 0
            ? `${money(delta)} remains against the budget.`
            : `${money(Math.abs(delta))} over the budget.`}
      </p>
    </Link>
  );
}
