export function ProductPreview() {
  return (
    <div className="glass overflow-hidden rounded-[1.4rem]">
      <div className="flex items-end justify-between border-b border-white/10 px-5 py-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-champagne/80">This week</p>
          <p className="mt-1 font-serif text-xl">Avery & Jordan</p>
        </div>
        <p className="font-serif text-5xl leading-none tracking-tight">142</p>
      </div>
      <ul className="divide-y divide-white/10">
        {[
          { tag: "Do now", title: "Florist deposit", detail: "Due yesterday · $800" },
          { tag: "This week", title: "12 RSVPs still out", detail: "Nudge before Friday" },
          { tag: "This week", title: "Hydrate the DIY flowers", detail: "Playbook · 3 days out" },
          { tag: "Soon", title: "Confirm hotel block", detail: "Cutoff in 11 days" },
        ].map((row) => (
          <li key={row.title} className="px-5 py-3.5">
            <p className="text-[10px] uppercase tracking-[0.16em] text-champagne/70">{row.tag}</p>
            <p className="mt-1 font-serif text-lg leading-tight">{row.title}</p>
            <p className="text-xs text-white/55">{row.detail}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
