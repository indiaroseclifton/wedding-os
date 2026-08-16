import Link from "next/link";
import { ensureDemoWorkspace, getWorkspaceGuests } from "@/lib/data/workspace";
import { getDietary } from "@/lib/data/dietary-store";
import { PrintButton } from "@/components/ui/PrintButton";
import { RoomSubnav } from "@/components/layout/RoomSubnav";
import { LeftoverPlan } from "@/components/dietary/LeftoverPlan";

const ALLERGY = [
  { id: "nut", label: "Nut", re: /nut|peanut|tree nut/i },
  { id: "shell", label: "Shellfish", re: /shellfish|shrimp/i },
  { id: "gf", label: "Gluten", re: /gluten|\bgf\b|celiac/i },
  { id: "dairy", label: "Dairy", re: /dairy|lactose/i },
];

export default async function DietaryPacketPage() {
  const { workspace } = await ensureDemoWorkspace();
  const [guests, plan] = await Promise.all([
    getWorkspaceGuests(workspace.id),
    getDietary(workspace.id),
  ]);
  const attending = guests.filter((g) => g.rsvp !== "NO");
  const meals = new Map<string, number>();
  for (const g of attending) {
    const meal = g.meal?.trim() || "Unspecified";
    meals.set(meal, (meals.get(meal) || 0) + 1 + (g.plusOnes || 0));
  }
  const cards = attending.filter((g) => ALLERGY.some((a) => a.re.test(g.dietary || "") || a.re.test(g.meal || "")));

  return (
    <div className="space-y-8">
      <RoomSubnav room="guests" />
      <div className="flex flex-wrap items-start justify-between gap-3 print:hidden">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-moss">Caterer packet</p>
          <h1 className="mt-1 font-serif text-4xl">What the kitchen needs</h1>
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
          {Array.from(meals.entries()).map(([label, n]) => (
            <li key={label} className="flex justify-between px-4 py-3 text-sm">
              <span>{label}</span>
              <span className="tabular-nums">{n}</span>
            </li>
          ))}
          <li className="flex justify-between px-4 py-3 text-sm font-medium">
            <span>Heads</span>
            <span>{attending.reduce((s, g) => s + 1 + (g.plusOnes || 0), 0)}</span>
          </li>
        </ul>
      </section>

      <section>
        <h2 className="font-serif text-2xl">Allergy cards</h2>
        <p className="mb-3 text-xs text-muted">One card per guest the kitchen must not miss.</p>
        <div className="grid gap-3 sm:grid-cols-2 print:grid-cols-2">
          {cards.map((g) => (
            <article key={g.id} className="break-inside-avoid rounded-2xl border-2 border-clay p-4">
              <p className="font-serif text-2xl">{g.name}</p>
              <p className="text-sm text-clay">{g.dietary || g.meal}</p>
              <p className="mt-2 text-xs text-muted">
                {g.meal || "Meal unset"}
                {g.tableLabel ? ` · ${g.tableLabel}` : " · table unset"}
              </p>
            </article>
          ))}
          {!cards.length && <p className="text-sm text-muted">No allergy flags yet.</p>}
        </div>
      </section>

      <LeftoverPlan initial={plan} />
    </div>
  );
}
