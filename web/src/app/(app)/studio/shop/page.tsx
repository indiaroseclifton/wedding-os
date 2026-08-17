import Link from "next/link";
import { ensureDemoWorkspace } from "@/lib/data/workspace";
import { getStudio } from "@/lib/data/studio-store";
import { consolidateShop } from "@/lib/studio-project";
import { money } from "@/lib/visual-rooms";

export default async function StudioShopPage() {
  const { workspace } = await ensureDemoWorkspace();
  const studio = await getStudio(workspace.id);
  const rows = consolidateShop(studio.projects);
  const total = rows.reduce((s, r) => s + r.est, 0);

  return (
    <div className="space-y-6">
      <header>
        <p className="kicker">Studio</p>
        <h1 className="mt-2 font-serif text-4xl tracking-tight">Shopping</h1>
        <p className="mt-2 max-w-xl text-sm text-muted">
          One list. Floral tape is not three line items. {rows.length ? money(total) : "Nothing to buy yet."}
        </p>
      </header>
      {rows.length === 0 ? (
        <p className="text-sm text-muted">
          <Link href="/studio/make" className="underline">Make a project</Link> and the list appears.
        </p>
      ) : (
        <ul className="divide-y divide-line rounded-2xl border border-line bg-surface">
          {rows.map((r) => (
            <li key={`${r.label}-${r.unit}`} className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-3 text-sm">
              <span>
                <span className="font-medium">{r.label}</span>
                <span className="ml-2 text-muted">
                  {r.qty} {r.unit}
                  {r.sources.size ? ` · ${[...r.sources].join(", ")}` : ""}
                </span>
              </span>
              <span className="text-muted">{money(r.est)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
