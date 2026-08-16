import { InstallApp } from "@/components/mobile/InstallApp";
import { MOBILE_STEPS } from "@/lib/mobile-steps";

export default function MobilePage() {
  const done = MOBILE_STEPS.flatMap((p) => p.items).filter((i) => i.done).length;
  const all = MOBILE_STEPS.flatMap((p) => p.items).length;

  return (
    <div className="space-y-6 pb-16">
      <div>
        <h1 className="font-serif text-4xl">Phone</h1>
        <p className="mt-1 text-sm text-muted">
          The desk is a mobile app the moment it sits on a home screen. Native stores come after this still works in a pocket.
        </p>
        <p className="mt-2 text-xs text-muted">
          {done} of {all} steps already true.
        </p>
      </div>

      <InstallApp />

      {MOBILE_STEPS.map((phase) => (
        <section key={phase.phase}>
          <p className="mb-2 text-[11px] uppercase tracking-[0.16em] text-moss">{phase.phase}</p>
          <ol className="space-y-2">
            {phase.items.map((item, i) => (
              <li
                key={item.id}
                className={`rounded-2xl border px-4 py-4 ${
                  item.done ? "border-line bg-surface" : "border-dashed border-line bg-paper/60"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] ${
                      item.done ? "bg-moss text-ivory" : "border border-line text-muted"
                    }`}
                  >
                    {item.done ? "✓" : i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="mt-1 text-sm leading-6 text-muted">{item.body}</p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}
