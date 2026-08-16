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
    return <p className="text-sm text-slate-500">Nothing on this view yet.</p>;
  }
  return (
    <ol className="space-y-0">
      {rows.map((s, i) => (
        <li key={s.id} className="flex gap-3 print:break-inside-avoid">
          <div className="flex w-[4.5rem] flex-col items-start">
            <span className="text-xs font-semibold tabular-nums text-slate-900">
              {formatRange(s.time, s.endTime)}
            </span>
            {i < rows.length - 1 && (
              <span className="mt-1 ml-2 h-full min-h-[1.25rem] w-px flex-1 bg-slate-200" />
            )}
          </div>
          <div className="flex-1 pb-4">
            <p className="text-sm font-medium text-slate-900">{slotTitle(s, view)}</p>
            <p className="text-xs text-slate-500">
              {[s.location, s.lead, s.assignee ? `assigned: ${s.assignee}` : ""].filter(Boolean).join(" · ")}
            </p>
            {showNotes && view !== "guests" && s.notes && (
              <p className="mt-1 text-xs text-slate-600">{s.notes}</p>
            )}
            {s.diySlug && (
              <p className="mt-1 text-[11px] text-emerald-700">DIY · {s.diySlug}</p>
            )}
            {s.confirmedBy && s.confirmedBy.length > 0 && (
              <p className="mt-1 text-[11px] text-emerald-700">Confirmed: {s.confirmedBy.join(", ")}</p>
            )}
            {s.comments && s.comments.length > 0 && view !== "guests" && (
              <ul className="mt-1 space-y-0.5 text-[11px] text-slate-600">
                {s.comments.map((c) => (
                  <li key={c.id}>
                    <span className="font-medium">{c.author}:</span> {c.body}
                  </li>
                ))}
              </ul>
            )}
            {showAudience && (
              <p className="mt-1 text-[11px] uppercase tracking-wide text-slate-400">
                {audiencesOf(s).map(audienceLabel).join(" · ")}
              </p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
