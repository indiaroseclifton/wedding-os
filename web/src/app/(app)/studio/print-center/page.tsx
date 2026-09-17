import Link from "next/link";
import { HowToButton } from "@/components/v2/HowToPop";
import { PRINT_CENTER } from "@/lib/print-center";

const JOBS = [
  { href: "/studio/cards", title: "Cards and menus", line: "Place cards, menus, programs. Avery or Canva tonight." },
  { href: "/studio/signage", title: "Signs", line: "Welcome, bar, seating chart faces." },
  { href: "/floorplan", title: "Floor sheets", line: "Tables on paper for the captain." },
  { href: "/packet", title: "Day packet", line: "One pack for the people running the hour." },
  { href: "/music/print", title: "DJ sheet", line: "Must-play and do-not-play on paper." },
] as const;

export default function PrintCenterPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8 pb-16">
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted">Studio</p>
        <h1 className="font-serif text-4xl">{PRINT_CENTER.name}</h1>
        <p className="mt-2 max-w-lg text-sm text-muted">{PRINT_CENTER.line}</p>
        <div className="mt-3">
          <HowToButton id="print-center" />
        </div>
      </div>

      <p className="rounded-2xl border border-line bg-surface/60 px-5 py-4 text-sm text-muted">
        Name is locked. The print module file lands here when you send it. Until then these are the paper jobs already in the house.
      </p>

      <ul className="space-y-3">
        {JOBS.map((job) => (
          <li key={job.href}>
            <Link href={job.href} className="block rounded-2xl border border-line bg-surface/60 px-5 py-4">
              <span className="block font-medium">{job.title}</span>
              <span className="mt-1 block text-sm text-muted">{job.line}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
