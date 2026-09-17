import Link from "next/link";

export function StudioOpeners() {
  return (
    <section className="grid gap-3 sm:grid-cols-2">
      <Link href="/studio/floor-planner" className="rounded-[1.4rem] border border-line bg-surface px-5 py-5">
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted">Studio</p>
        <p className="mt-1 font-serif text-2xl">Floor Planner</p>
        <p className="mt-2 text-sm text-muted">Draw the room. Print opens Print Center.</p>
      </Link>
      <Link href="/studio/print-center" className="rounded-[1.4rem] border border-line bg-surface px-5 py-5">
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted">Studio</p>
        <p className="mt-1 font-serif text-2xl">Print Center</p>
        <p className="mt-2 text-sm text-muted">Sheets, cards, signs.</p>
      </Link>
    </section>
  );
}
