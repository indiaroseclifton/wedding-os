import Link from "next/link";
import { IMPROVEMENTS } from "@/lib/improvements";

const TONE = {
  shipped: "In the product",
  next: "Do next",
  later: "Later",
};

export default function ImprovementsPage() {
  const counts = {
    shipped: IMPROVEMENTS.flatMap((p) => p.items).filter((i) => i.status === "shipped").length,
    next: IMPROVEMENTS.flatMap((p) => p.items).filter((i) => i.status === "next").length,
    later: IMPROVEMENTS.flatMap((p) => p.items).filter((i) => i.status === "later").length,
  };

  return (
    <div className="space-y-8 pb-16">
      <div>
        <h1 className="font-serif text-4xl">Improvements</h1>
        <p className="mt-1 text-sm text-muted">
          What’s real, what’s still homework, what waits. Not a graveyard of ideas.
        </p>
        <p className="mt-2 text-xs text-muted">
          {counts.shipped} shipped · {counts.next} next · {counts.later} later
        </p>
      </div>

      {IMPROVEMENTS.map((phase) => (
        <section key={phase.phase}>
          <p className="mb-2 kicker kicker-moss">{phase.phase}</p>
          <ul className="space-y-2">
            {phase.items.map((item) => (
              <li
                key={item.id}
                className={`rounded-2xl border px-4 py-4 ${
                  item.status === "shipped" ? "border-line bg-surface" : "border-dashed border-line"
                }`}
              >
                <p className="text-[10px] uppercase tracking-wide text-muted">{TONE[item.status]}</p>
                <p className="text-sm font-medium">{item.title}</p>
                <p className="mt-1 text-sm leading-6 text-muted">{item.body}</p>
                {item.href && (
                  <Link href={item.href} className="mt-2 inline-block text-xs underline">
                    Open
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
