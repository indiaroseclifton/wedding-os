import Link from "next/link";
import { ensureDemoWorkspace, getWorkspaceGuests } from "@/lib/data/workspace";
import { PrintButton } from "@/components/ui/PrintButton";
import { RoomSubnav } from "@/components/layout/RoomSubnav";

const TAGS: { id: string; label: string; re: RegExp }[] = [
  { id: "veg", label: "Vegetarian", re: /veg(?!an)|vegetarian/i },
  { id: "vegan", label: "Vegan", re: /vegan/i },
  { id: "gf", label: "Gluten-free", re: /gluten|\bgf\b|celiac/i },
  { id: "nut", label: "Nut allergy", re: /nut|peanut|tree nut/i },
  { id: "dairy", label: "Dairy-free", re: /dairy|lactose/i },
  { id: "shell", label: "Shellfish", re: /shellfish|shrimp/i },
  { id: "kid", label: "Kids meal", re: /kid|child/i },
];

export default async function DietaryPage() {
  const { workspace } = await ensureDemoWorkspace();
  const guests = await getWorkspaceGuests(workspace.id);
  const attending = guests.filter((g) => g.rsvp !== "NO");
  const withDiet = attending.filter((g) => g.dietary && g.dietary.trim());
  const none = attending.filter((g) => !g.dietary?.trim()).length;

  const meals = new Map<string, number>();
  for (const g of attending) {
    if (!g.meal?.trim()) continue;
    meals.set(g.meal.trim(), (meals.get(g.meal.trim()) || 0) + 1 + (g.plusOnes || 0));
  }

  const tags = TAGS.map((t) => ({
    ...t,
    count: attending.filter((g) => t.re.test(g.dietary || "") || t.re.test(g.meal || "")).length,
  })).filter((t) => t.count > 0);

  const leftovers = new Map<string, number>();
  for (const g of withDiet) {
    const raw = g.dietary!.trim();
    if (TAGS.some((t) => t.re.test(raw))) continue;
    leftovers.set(raw.toLowerCase(), (leftovers.get(raw.toLowerCase()) || 0) + 1 + (g.plusOnes || 0));
  }

  return (
    <div className="space-y-6">
      <RoomSubnav room="guests" />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-serif text-4xl">Dietary</h1>
          <p className="mt-1 text-sm text-muted">Meals and allergies the caterer can actually cook from.</p>
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

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-line bg-surface p-4">
          <p className="text-[11px] uppercase tracking-wide text-muted">Eating</p>
          <p className="font-serif text-3xl">{attending.length}</p>
        </div>
        <div className="rounded-2xl border border-line bg-surface p-4">
          <p className="text-[11px] uppercase tracking-wide text-muted">Notes</p>
          <p className="font-serif text-3xl">{withDiet.length}</p>
        </div>
        <div className="rounded-2xl border border-line bg-surface p-4">
          <p className="text-[11px] uppercase tracking-wide text-muted">Silent</p>
          <p className="font-serif text-3xl">{none}</p>
        </div>
      </div>

      {meals.size > 0 && (
        <section>
          <p className="mb-2 text-sm font-medium">Meals</p>
          <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
            {Array.from(meals.entries()).map(([label, count]) => (
              <li key={label} className="flex justify-between px-4 py-3 text-sm">
                <span>{label}</span>
                <span>{count}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {tags.length > 0 && (
        <section>
          <p className="mb-2 text-sm font-medium">Allergies & tags</p>
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <span key={t.id} className="rounded-full bg-moss-soft px-3 py-1 text-xs">
                {t.label} · {t.count}
              </span>
            ))}
          </div>
        </section>
      )}

      {leftovers.size > 0 && (
        <section>
          <p className="mb-2 text-sm font-medium">Other notes</p>
          <ul className="text-sm text-ink-soft">
            {Array.from(leftovers.entries()).map(([label, count]) => (
              <li key={label}>
                {count}× {label}
              </li>
            ))}
          </ul>
        </section>
      )}

      <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
        {attending.map((g) => (
          <li key={g.id} className="px-4 py-3 text-sm">
            <Link href={`/guests/${g.id}`} className="font-medium">
              {g.name}
            </Link>
            <p className="text-xs text-muted">
              {g.meal || "No meal"}
              {g.dietary ? ` · ${g.dietary}` : " · no note"}
              {g.tableLabel ? ` · ${g.tableLabel}` : ""}
            </p>
          </li>
        ))}
        {!attending.length && (
          <li className="px-4 py-8 text-center text-sm text-muted">No one on the list yet.</li>
        )}
      </ul>
    </div>
  );
}
