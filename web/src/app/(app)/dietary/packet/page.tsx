import Link from "next/link";
import { ensureDemoWorkspace, getWorkspaceGuests } from "@/lib/data/workspace";
import { getDietary } from "@/lib/data/dietary-store";
import { kitchenRollup } from "@/lib/data/dietary";
import { PrintButton } from "@/components/ui/PrintButton";
import { PrintSeal } from "@/components/ui/PrintSeal";
import { RoomSubnav } from "@/components/layout/RoomSubnav";
import { LeftoverPlan } from "@/components/dietary/LeftoverPlan";

export default async function DietaryPacketPage() {
  const { workspace } = await ensureDemoWorkspace();
  const [guests, plan] = await Promise.all([
    getWorkspaceGuests(workspace.id),
    getDietary(workspace.id),
  ]);
  const k = kitchenRollup(guests, "plates");

  return (
    <div className="space-y-8">
      <RoomSubnav room="guests" />
      <div className="flex flex-wrap items-start justify-between gap-3 print:hidden">
        <div>
          <PrintSeal label="Caterer packet" />
          <h1 className="mt-1 font-serif text-4xl">What the kitchen needs</h1>
          <p className="mt-1 text-sm text-muted">Plates only. Maybes are not chicken.</p>
        </div>
        <div className="flex gap-2">
          <PrintButton label="Print packet" />
          <Link href="/dietary" className="rounded-full border border-line px-4 py-2 text-sm">
            Back
          </Link>
        </div>
      </div>

      <section>
        <h2 className="font-serif text-2xl">Meal counts</h2>
        <ul className="mt-2 divide-y divide-line rounded-2xl border border-line bg-surface">
          {Array.from(k.meals.entries()).map(([label, n]) => (
            <li key={label} className="flex justify-between px-4 py-3 text-sm">
              <span>{label}</span>
              <span className="tabular-nums">{n}</span>
            </li>
          ))}
          <li className="flex justify-between px-4 py-3 text-sm font-medium">
            <span>Plates</span>
            <span className="tabular-nums">{k.heads}</span>
          </li>
          {k.holding !== k.plates && (
            <li className="flex justify-between px-4 py-3 text-xs text-muted">
              <span>Still holding a chair</span>
              <span className="tabular-nums">{k.holding}</span>
            </li>
          )}
        </ul>
      </section>

      <section>
        <h2 className="font-serif text-2xl">Allergy cards</h2>
        <p className="mb-3 text-xs text-muted">One card per yes the kitchen must not miss.</p>
        <div className="grid gap-3 sm:grid-cols-2 print:grid-cols-2">
          {k.cards.map((g) => (
            <article key={g.id} className="break-inside-avoid rounded-2xl border-2 border-clay p-4">
              <p className="font-serif text-2xl">{g.name}</p>
              <p className="text-sm text-clay">{g.dietary || g.meal}</p>
              <p className="mt-2 text-xs text-muted">
                {g.meal || "Meal unset"}
                {g.tableLabel ? ` · ${g.tableLabel}` : " · table unset"}
              </p>
            </article>
          ))}
          {!k.cards.length && <p className="text-sm text-muted">No allergy flags on plates yet.</p>}
        </div>
      </section>

      <LeftoverPlan initial={plan} />
    </div>
  );
}
