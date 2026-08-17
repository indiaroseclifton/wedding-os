import { InstallApp } from "@/components/mobile/InstallApp";
import { MOBILE_STEPS } from "@/lib/mobile-steps";
import { CAPACITOR_STEPS } from "@/lib/capacitor-steps";

const WHERE: Record<string, string> = {
  repo: "In the product",
  mac: "On your Mac",
  apple: "Apple",
  later: "After it runs",
};

export default function MobilePage() {
  const done = MOBILE_STEPS.flatMap((p) => p.items).filter((i) => i.done).length;
  const all = MOBILE_STEPS.flatMap((p) => p.items).length;
  const capDone = CAPACITOR_STEPS.filter((s) => s.done).length;

  return (
    <div className="space-y-8 pb-16">
      <div>
        <h1 className="font-serif text-4xl">Phone</h1>
        <p className="mt-1 text-sm text-muted">
          Home screen first. Then a native wrapper around this same desk — not a second app.
        </p>
        <p className="mt-2 text-xs text-muted">
          {done} of {all} product steps · {capDone} of {CAPACITOR_STEPS.length} Capacitor steps
        </p>
      </div>

      <InstallApp />

      <section>
        <p className="mb-2 kicker kicker-moss">Capacitor wrapper</p>
        <p className="mb-3 text-sm text-muted">
          The shell is already written. You only need a Mac and Xcode to see it on an iPhone.
        </p>
        <ol className="space-y-2">
          {CAPACITOR_STEPS.map((item, i) => (
            <li
              key={item.id}
              className={`rounded-2xl border px-4 py-4 ${
                item.done ? "border-line bg-surface" : "border-dashed border-line bg-paper/60"
              }`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] ${
                    item.done ? "bg-moss text-moss-fg" : "border border-line text-muted"
                  }`}
                >
                  {item.done ? "✓" : i + 1}
                </span>
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-muted">{WHERE[item.where]}</p>
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="mt-1 text-sm leading-6 text-muted">{item.body}</p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {MOBILE_STEPS.map((phase) => (
        <section key={phase.phase}>
          <p className="mb-2 kicker kicker-moss">{phase.phase}</p>
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
                      item.done ? "bg-moss text-moss-fg" : "border border-line text-muted"
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
