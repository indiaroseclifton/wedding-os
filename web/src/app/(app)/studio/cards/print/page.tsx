import Link from "next/link";
import { PrintButton } from "@/components/ui/PrintButton";
import { ensureDemoWorkspace, getWorkspaceGuests } from "@/lib/data/workspace";
import { mealMark, mergeCards, sortCards, type CardKind, type CardMode } from "@/lib/cards";

export default async function CardsPrintPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string; mode?: string; meals?: string }>;
}) {
  const q = await searchParams;
  const kind: CardKind = q.kind === "place" ? "place" : "escort";
  const mode: CardMode = q.mode === "holding" ? "holding" : "plates";
  const showMeals = q.meals === "1";
  const { workspace, meta } = await ensureDemoWorkspace();
  const guests = await getWorkspaceGuests(workspace.id);
  const { rows } = mergeCards(guests, mode);
  const sorted = sortCards(rows, kind);
  const per = kind === "escort" ? 8 : 4;
  const sheets: (typeof sorted)[] = [];
  for (let i = 0; i < sorted.length; i += per) sheets.push(sorted.slice(i, i + per));
  if (!sheets.length) sheets.push([]);

  return (
    <div className="cards-print">
      <style>{`
        @page { size: letter; margin: 0.4in; }
        @media print {
          .no-print { display: none !important; }
          .sheet { break-after: page; }
          .sheet:last-child { break-after: auto; }
        }
        .sheet {
          display: grid;
          width: 7.7in;
          height: 10.2in;
          margin: 0 auto;
        }
        .sheet.escort { grid-template-columns: 1fr 1fr; grid-template-rows: repeat(4, 1fr); }
        .sheet.place { grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; }
        .card {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          border: 0.4pt dashed #c9c2b8;
          padding: 0.2in;
        }
        .card.tent { justify-content: space-around; }
        .fold {
          width: 70%;
          border-top: 0.4pt dashed #c9c2b8;
        }
      `}</style>

      <div className="no-print mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="kicker">Print</p>
          <h1 className="mt-1 font-serif text-3xl">{kind === "escort" ? "Escort cards" : "Place tents"}</h1>
          <p className="mt-1 max-w-lg text-sm text-muted">
            Letter, 100% scale, actual size. {kind === "escort" ? "8 per sheet, A–Z." : "4 per sheet, fold on the dash."} Cut the dashes. {meta.coupleNames}
          </p>
        </div>
        <div className="flex gap-2">
          <PrintButton label="Print" />
          <Link href="/studio/cards" className="btn btn-ghost">
            Back
          </Link>
        </div>
      </div>

      {sorted.length === 0 ? (
        <p className="text-sm text-muted">No cards in this pool.</p>
      ) : (
        sheets.map((page, i) => (
          <section key={i} className={`sheet ${kind === "escort" ? "escort" : "place"}`}>
            {page.map((r) => (
              <article key={r.id} className={`card ${kind === "place" ? "tent" : ""}`}>
                {kind === "place" ? (
                  <>
                    <div>
                      <p className="font-serif text-xl leading-tight">{r.name}</p>
                      <p className="mt-1 text-xs tracking-wide text-muted">
                        {r.table || "—"}
                        {showMeals && r.meal ? ` · ${mealMark(r.meal)}` : ""}
                      </p>
                    </div>
                    <div className="fold" />
                    <div>
                      <p className="font-serif text-xl leading-tight">{r.name}</p>
                      <p className="mt-1 text-xs tracking-wide text-muted">
                        {r.table || "—"}
                        {showMeals && r.meal ? ` · ${mealMark(r.meal)}` : ""}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="font-serif text-xl leading-tight">{r.name}</p>
                    <p className="mt-2 text-sm tracking-wide">{r.table || "Ask us"}</p>
                    {showMeals && r.meal ? <p className="mt-1 text-xs text-muted">{mealMark(r.meal)}</p> : null}
                  </>
                )}
              </article>
            ))}
          </section>
        ))
      )}
    </div>
  );
}
