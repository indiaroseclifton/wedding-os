export function ProductPreview() {
  return (
    <div className="overflow-hidden rounded-[1.4rem] border border-white/15 bg-black/35 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.65)] backdrop-blur-md">
      <div className="flex items-end justify-between border-b border-white/10 px-5 py-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-[#eadec8]/80">This week</p>
          <p className="mt-1 font-serif text-xl text-[#f6f1e8]">Avery & Jordan</p>
        </div>
        <p className="font-serif text-5xl leading-none tracking-tight text-[#f6f1e8]">142</p>
      </div>
      <ul className="divide-y divide-white/10">
        {[
          { tag: "Do now", title: "Florist deposit", detail: "Due yesterday · $800" },
          { tag: "This week", title: "12 RSVPs still out", detail: "Nudge before Friday" },
          { tag: "This week", title: "Hydrate the DIY flowers", detail: "Playbook · 3 days out" },
          { tag: "Soon", title: "Confirm hotel block", detail: "Cutoff in 11 days" },
        ].map((row) => (
          <li key={row.title} className="flex items-start justify-between gap-3 px-5 py-3.5">
            <div>
              <p className="text-[10px] uppercase tracking-[0.16em] text-[#eadec8]/70">{row.tag}</p>
              <p className="mt-1 font-serif text-lg leading-tight text-[#f6f1e8]">{row.title}</p>
              <p className="text-xs text-white/50">{row.detail}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
