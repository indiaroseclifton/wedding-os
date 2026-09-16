export function ShopSources() {
  const sources = [
    { name: "Amazon", href: "https://www.amazon.com/s?k=wedding+floral+supplies", line: "Tape, chicken wire, vessels" },
    { name: "Alibaba", href: "https://www.alibaba.com/trade/search?SearchText=wedding+table+decor", line: "Wholesale stems and linens" },
    { name: "Grocery floral", href: "https://www.google.com/maps/search/florist+wholesale+or+grocery+floral/", line: "Same-week bunches" },
    { name: "Restaurant depot / restaurant supply", href: "https://www.google.com/maps/search/restaurant+depot/", line: "Vases, votives, bulk glass" },
  ];
  return (
    <section className="rounded-2xl border border-line bg-surface p-5">
      <p className="kicker">Buy here</p>
      <h2 className="mt-1 font-serif text-2xl">Sources, not a cart</h2>
      <p className="mt-2 text-sm text-muted">Opens the store. We do not check you out.</p>
      <ul className="mt-4 divide-y divide-line">
        {sources.map((s) => (
          <li key={s.name} className="flex items-center justify-between gap-3 py-3 text-sm">
            <div>
              <p className="font-medium">{s.name}</p>
              <p className="text-xs text-muted">{s.line}</p>
            </div>
            <a href={s.href} target="_blank" rel="noreferrer" className="text-xs underline">
              Open
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
