import type { DecisionStatus, TaskStatus, PackageStatus } from "@/types/domain";

type Status = DecisionStatus | TaskStatus | PackageStatus | string;

const labels: Record<string, string> = {
  EXPLORING: "Exploring",
  DECIDED: "Decided",
  NEEDS_REVISIT: "Needs revisit",
  NOT_STARTED: "Not started",
  IN_PROGRESS: "In progress",
  DONE: "Done",
  BLOCKED: "Blocked",
  DRAFT: "Draft",
  SHARED: "Shared",
  ACTIVE: "Active",
  PENDING: "Pending",
};

const tones: Record<string, string> = {
  EXPLORING: "bg-amber-50 text-amber-800 ring-amber-200",
  DECIDED: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  NEEDS_REVISIT: "bg-orange-50 text-orange-800 ring-orange-200",
  NOT_STARTED: "bg-slate-50 text-slate-700 ring-slate-200",
  IN_PROGRESS: "bg-sky-50 text-sky-800 ring-sky-200",
  DONE: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  BLOCKED: "bg-rose-50 text-rose-800 ring-rose-200",
  DRAFT: "bg-slate-50 text-slate-700 ring-slate-200",
  SHARED: "bg-indigo-50 text-indigo-800 ring-indigo-200",
  ACTIVE: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  PENDING: "bg-amber-50 text-amber-800 ring-amber-200",
};

export function StatusBadge({ status }: { status: Status }) {
  const label = labels[status] ?? status;
  const tone = tones[status] ?? "bg-slate-50 text-slate-700 ring-slate-200";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${tone}`}
    >
      {label}
    </span>
  );
}
