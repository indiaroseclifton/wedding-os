import Link from "next/link";
import { PrintButton } from "@/components/ui/PrintButton";
import { PrintSeal } from "@/components/ui/PrintSeal";
import { ensureDemoWorkspace, getWorkspaceGuests } from "@/lib/data/workspace";
import { householdKey } from "@/lib/data/seating";

export default async function UsherPage() {
  const { workspace, meta } = await ensureDemoWorkspace();
  const guests = (await getWorkspaceGuests(workspace.id)).filter((g) => g.rsvp !== "NO");
  const byTable = new Map<string, typeof guests>();
  for (const g of guests) {
    const key = g.tableLabel?.trim() || "Unseated";
    const list = byTable.get(key) || [];
    list.push(g);
    byTable.set(key, list);
  }
  const tables = [...byTable.entries()].sort((a, b) => a[0].localeCompare(b[0]));

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3 print:hidden">
        <div>
          <PrintSeal label="Usher card" />
          <h1 className="mt-1 font-serif text-4xl">Who goes where</h1>
          <p className="mt-1 text-sm text-muted">{meta.coupleNames || meta.name}</p>
        </div>
        <div className="flex gap-2">
          <PrintButton label="Print" />
          <Link href="/seating" className="rounded-full border border-line px-4 py-2 text-sm">
            Back
          </Link>
        </div>
      </div>
      <header className="hidden print:block">
        <PrintSeal label="Usher card" />
        <h1 className="font-serif text-3xl">{meta.coupleNames}</h1>
      </header>
      {tables.map(([table, people]) => (
        <section key={table} className="break-inside-avoid rounded-[1.3rem] border border-line bg-surface px-5 py-4">
          <h2 className="font-serif text-2xl">{table}</h2>
          <ul className="mt-2 space-y-1 text-sm">
            {people.map((g) => (
              <li key={g.id}>
                {g.name}
                {g.plusOneNames?.length ? ` + ${g.plusOneNames.join(", ")}` : ""}
                <span className="text-muted"> · {householdKey(g)}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
