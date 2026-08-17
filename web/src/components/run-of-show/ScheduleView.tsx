import {
  type Audience,
  type RunSlot,
  audienceLabel,
  audiencesOf,
  formatRange,
  slotTitle,
  slotVisible,
} from "@/lib/data/run-of-show";

export function ScheduleView({
  slots,
  view = "all",
  showNotes = true,
  showAudience = false,
}: {
  slots: RunSlot[];
  view?: Audience | "all";
  showNotes?: boolean;
  showAudience?: boolean;
}) {
  const rows = slots.filter((s) => slotVisible(s, view));
  if (!rows.length) {
    return <p className="text-sm text-muted">Nothing on this view yet.</p>;
  }
  return (
    <ol className="space-y-0">
      {rows.map((s, i) => (
        <li key={s.id} className="flex gap-4 print:break-inside-avoid">
          <div className="flex w-[4.75rem] shrink-0 flex-col items-start">
            <span className="font-serif text-sm tabular-nums leading-none text-ink">
              {formatRange(s.time, s.endTime)}
            </span>
            {i < rows.length - 1 && <span className="ml-2 mt-2 h-full min-h-6 w-px flex-1 bg-line" />}
          </div>
          <div className="min-w-0 flex-1 pb-6">
            <p className="font-serif text-2xl leading-tight tracking-tight text-balance">{slotTitle(s, view)}</p>
            <p className="mt-1 text-sm text-muted">
              {[s.location, s.lead, s.assignee ? s.assignee : ""].filter(Boolean).join(" · ")}
            </p>
            {showNotes && view !== "guests" && s.notes && (
              <p className="mt-1 text-sm text-ink-soft text-pretty">{s.notes}</p>
            )}
            {s.diySlug && <p className="mt-1 text-xs text-moss">DIY · {s.diySlug}</p>}
            {s.confirmedBy && s.confirmedBy.length > 0 && (
              <p className="mt-1 text-xs text-moss">Confirmed: {s.confirmedBy.join(", ")}</p>
            )}
            {s.comments && s.comments.length > 0 && view !== "guests" && (
              <ul className="mt-1 space-y-0.5 text-xs text-ink-soft">
                {s.comments.map((c) => (
                  <li key={c.id}>
                    <span className="font-medium">{c.author}:</span> {c.body}
                  </li>
                ))}
              </ul>
            )}
            {showAudience && (
              <p className="mt-1 text-[11px] uppercase tracking-wide text-muted">
                {audiencesOf(s).map(audienceLabel).join(" · ")}
              </p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
