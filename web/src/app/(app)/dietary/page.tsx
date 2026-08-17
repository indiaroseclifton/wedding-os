import Link from "next/link";
import { ensureDemoWorkspace, getWorkspaceGuests } from "@/lib/data/workspace";
import { PrintButton } from "@/components/ui/PrintButton";
import { RoomSubnav } from "@/components/layout/RoomSubnav";
import { kitchenRollup, type KitchenMode } from "@/lib/data/dietary";

export default async function DietaryPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const { workspace } = await ensureDemoWorkspace();
  const guests = await getWorkspaceGuests(workspace.id);
  const q = await searchParams;
  const mode: KitchenMode = q.mode === "holding" ? "holding" : "plates";
  const k = kitchenRollup(guests, mode);

  return (
    <div className="space-y-6">
      <RoomSubnav room="guests" />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-serif text-4xl">Dietary</h1>
          <p className="mt-1 text-sm text-muted">
            Kitchen buys plates — yes, plus named extras. Holding is chairs you might still fill.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/dietary/packet" className="rounded-full border border-line px-4 py-2 text-sm">
            Caterer packet
          </Link>
          <PrintButton />
          <Link href="/handoffs" className="rounded-full bg-moss px-4 py-2 text-sm font-medium text-ivory">
            Catering handoff
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 print:hidden">
        {(["plates", "holding"] as const).map((m) => (
          <Link
            key={m}
            href={m === "plates" ? "/dietary" : "/dietary?mode=holding"}
            className={`min-h-11 rounded-full px-4 text-sm leading-[2.75rem] ${
              mode === m ? "bg-moss text-ivory" : "border border-line"
            }`}
          >
            {m === "plates" ? "Plates" : "Holding"}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-line bg-surface p-4">
          <p className="kicker">{mode === "plates" ? "Plates" : "Holding"}</p>
          <p className="font-serif text-3xl">{k.heads}</p>
          {k.holding !== k.plates && (
            <p className="mt-1 text-xs text-muted">
              {mode === "plates" ? `${k.holding} holding` : `${k.plates} plates`}
            </p>
          )}
        </div>
        <div className="rounded-2xl border border-line bg-surface p-4">
          <p className="kicker">Notes</p>
          <p className="font-serif text-3xl">{k.withDiet.length}</p>
        </div>
        <div className="rounded-2xl border border-line bg-surface p-4">
          <p className="kicker">Silent</p>
          <p className="font-serif text-3xl">{k.silent}</p>
        </div>
      </div>

      {k.meals.size > 0 && (
        <section>
          <p className="mb-2 text-sm font-medium">Meals</p>
          <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
            {Array.from(k.meals.entries()).map(([label, count]) => (
              <li key={label} className="flex justify-between px-4 py-3 text-sm">
                <span>{label}</span>
                <span className="tabular-nums">{count}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {k.tags.length > 0 && (
        <section>
          <p className="mb-2 text-sm font-medium">Allergies & tags</p>
          <div className="flex flex-wrap gap-2">
            {k.tags.map((t) => (
              <span key={t.id} className="rounded-full bg-moss-soft px-3 py-1 text-xs">
                {t.label} · {t.count}
              </span>
            ))}
          </div>
        </section>
      )}

      {k.leftovers.size > 0 && (
        <section>
          <p className="mb-2 text-sm font-medium">Other notes</p>
          <ul className="text-sm text-ink-soft">
            {Array.from(k.leftovers.entries()).map(([label, count]) => (
              <li key={label}>
                {count}× {label}
              </li>
            ))}
          </ul>
        </section>
      )}

      <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
        {k.pool.map((g) => (
          <li key={g.id} className="px-4 py-3 text-sm">
            <Link href={`/guests/${g.id}`} className="font-medium">
              {g.name}
            </Link>
            <p className="text-xs text-muted">
              {g.meal || "No meal"}
              {g.dietary ? ` · ${g.dietary}` : " · no note"}
              {g.tableLabel ? ` · ${g.tableLabel}` : ""}
              {g.rsvp !== "YES" ? ` · ${g.rsvp.toLowerCase()}` : ""}
            </p>
          </li>
        ))}
        {!k.pool.length && (
          <li className="px-4 py-8 text-center text-sm text-muted">
            {mode === "plates" ? "No yeses yet — nothing for the kitchen." : "No one on the list yet."}
          </li>
        )}
      </ul>
    </div>
  );
}
