export function ProductPreview() {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_20px_50px_-24px_rgba(18,17,15,0.35)]">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-moss">This week</p>
          <p className="text-sm font-medium tracking-tight">Avery & Jordan</p>
        </div>
        <p className="text-2xl font-medium tracking-tight">142</p>
      </div>
      <ul className="divide-y divide-line">
        {[
          { tag: "Do now", tagClass: "bg-rose-50 text-rose-800", title: "Florist deposit", detail: "Due yesterday · $800" },
          { tag: "This week", tagClass: "bg-moss-soft text-moss", title: "12 RSVPs still out", detail: "Nudge before Friday" },
          { tag: "This week", tagClass: "bg-moss-soft text-moss", title: "Hydrate the DIY flowers", detail: "Playbook · 3 days out" },
          { tag: "Soon", tagClass: "bg-slate-100 text-slate-600", title: "Confirm hotel block", detail: "Cutoff in 11 days" },
        ].map((row) => (
          <li key={row.title} className="flex items-start justify-between gap-3 px-4 py-3">
            <div>
              <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${row.tagClass}`}>
                {row.tag}
              </span>
              <p className="mt-1 text-sm font-medium">{row.title}</p>
              <p className="text-xs text-muted">{row.detail}</p>
            </div>
            <span className="shrink-0 rounded-lg bg-moss px-2.5 py-1.5 text-[11px] font-medium text-moss-fg">
              Open
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
