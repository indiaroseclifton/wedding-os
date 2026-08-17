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
  EXPLORING: "bg-moss-soft text-moss ring-moss/20",
  DECIDED: "bg-moss-soft text-moss ring-moss/20",
  NEEDS_REVISIT: "bg-clay-soft text-clay ring-clay/25",
  NOT_STARTED: "bg-paper text-ink-soft ring-line",
  IN_PROGRESS: "bg-moss-soft text-moss ring-moss/20",
  DONE: "bg-moss-soft text-moss ring-moss/20",
  BLOCKED: "bg-clay-soft text-clay ring-clay/25",
  DRAFT: "bg-paper text-ink-soft ring-line",
  SHARED: "bg-moss-soft text-moss ring-moss/20",
  ACTIVE: "bg-moss-soft text-moss ring-moss/20",
  PENDING: "bg-moss-soft text-moss ring-moss/20",
};

export function StatusBadge({ status }: { status: Status }) {
  const label = labels[status] ?? status;
  const tone = tones[status] ?? "bg-paper text-ink-soft ring-line";

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${tone}`}>
      {label}
    </span>
  );
}
