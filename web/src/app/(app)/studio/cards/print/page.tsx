import Link from "next/link";
import { PrintScale } from "@/components/studio/PrintScale";
import { ensureDemoWorkspace, getWorkspaceGuests } from "@/lib/data/workspace";
import { addressLine, householdLabels, mealMark, mergeCards, sortCards, type CardKind, type CardMode } from "@/lib/cards";

type Stock = "letter" | "avery5302" | "avery5371" | "avery5160";

export default async function CardsPrintPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string; mode?: string; meals?: string; stock?: string }>;
}) {
  const q = await searchParams;
  const kind: CardKind = q.kind === "place" ? "place" : "escort";
  const mode: CardMode = q.mode === "holding" ? "holding" : "plates";
  const stock: Stock =
    q.stock === "avery5302" ? "avery5302" : q.stock === "avery5371" ? "avery5371" : q.stock === "avery5160" ? "avery5160" : "letter";
  const showMeals = q.meals === "1";
  const { workspace, meta } = await ensureDemoWorkspace();
  const guests = await getWorkspaceGuests(workspace.id);
  const { rows } = mergeCards(guests, mode);
  const labels = stock === "avery5160" ? householdLabels(rows) : sortCards(rows, kind);
  const tent = stock === "avery5302" || (stock === "letter" && kind === "place");
  const per = stock === "avery5302" ? 4 : stock === "avery5371" ? 10 : stock === "avery5160" ? 30 : kind === "escort" ? 8 : 4;
  const sheets: (typeof labels)[] = [];
  for (let i = 0; i < labels.length; i += per) sheets.push(labels.slice(i, i + per));
  if (!sheets.length) sheets.push([]);
  const title =
    stock === "avery5302"
      ? "Avery 5302 tents"
      : stock === "avery5371"
        ? "Avery 5371 / 8371"
        : stock === "avery5160"
          ? "Avery 5160 / 8160"
          : kind === "escort"
            ? "Escort cards"
            : "Place tents";

  return (
    <PrintScale stock={stock}>
    <div className="cards-print">
      <style>{`
        @page { size: letter; margin: ${stock === "avery5160" ? "0.5in 0.1875in" : stock === "letter" ? "0.4in" : "0.5in"}; }
        @media print {
          .no-print { display: none !important; }
          .sheet { break-after: page; }
          .sheet:last-child { break-after: auto; }
        }
        .sheet {
          display: grid;
          margin: 0 auto;
          transform: translate(var(--print-x, 0in), var(--print-y, 0in)) scale(var(--print-scale, 1));
          transform-origin: top left;
        }
        .sheet.letter-escort { width: 7.7in; height: 10.2in; grid-template-columns: 1fr 1fr; grid-template-rows: repeat(4, 1fr); }
        .sheet.letter-place { width: 7.7in; height: 10.2in; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; }
        .sheet.avery5302 { width: 7.5in; height: 10in; grid-template-columns: 3.5in 3.5in; grid-template-rows: 5in 5in; column-gap: 0.5in; }
        .sheet.avery5371 { width: 7.5in; height: 10in; grid-template-columns: 3.5in 3.5in; grid-template-rows: repeat(5, 2in); column-gap: 0.5in; }
        .sheet.avery5160 {
          width: 8.125in;
          height: 10in;
          grid-template-columns: 2.625in 2.625in 2.625in;
          grid-template-rows: repeat(10, 1in);
          column-gap: 0.125in;
        }
        .card {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          border: 0.4pt dashed #c9c2b8;
          padding: 0.12in;
          overflow: hidden;
        }
        .card.tent { justify-content: space-around; }
        .card.label {
          align-items: flex-start;
          justify-content: center;
          text-align: left;
          padding: 0.08in 0.1in;
          border-color: transparent;
        }
        .fold { width: 70%; border-top: 0.4pt dashed #c9c2b8; }
      `}</style>

      <div className="no-print mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="kicker">Print</p>
          <h1 className="mt-1 font-serif text-3xl">{title}</h1>
          <p className="mt-1 max-w-lg text-sm text-muted">
            Letter, 100% scale, actual size. {per} per sheet.
            {stock === "avery5160"
              ? " One label per household. Load 5160 / 8160."
              : stock !== "letter"
                ? " Load the Avery pack. Align to the top-left."
                : " Cut the dashes."}{" "}
            {meta.coupleNames}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/studio/cards/calibrate" className="btn btn-ghost">
            Calibrate
          </Link>
          <Link href="/studio/cards" className="btn btn-ghost">
            Back
          </Link>
        </div>
      </div>

      {labels.length === 0 ? (
        <p className="text-sm text-muted">No cards in this pool.</p>
      ) : (
        sheets.map((page, i) => (
          <section
            key={i}
            className={`sheet ${
              stock === "avery5302"
                ? "avery5302"
                : stock === "avery5371"
                  ? "avery5371"
                  : stock === "avery5160"
                    ? "avery5160"
                    : kind === "escort"
                      ? "letter-escort"
                      : "letter-place"
            }`}
          >
            {page.map((r) =>
              stock === "avery5160" ? (
                <article key={r.id} className="card label">
                  <p className="text-[11px] font-medium leading-tight">{r.party || r.name}</p>
                  {r.address ? <p className="text-[10px] leading-tight">{r.address}</p> : <p className="text-[10px] text-muted">Address?</p>}
                  <p className="text-[10px] leading-tight">{addressLine(r)}</p>
                </article>
              ) : (
              <article key={r.id} className={`card ${tent ? "tent" : ""}`}>
                {tent ? (
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
                    <p className="font-serif text-lg leading-tight">{r.name}</p>
                    <p className="mt-1 text-sm tracking-wide">{r.table || "Ask us"}</p>
                    {showMeals && r.meal ? <p className="mt-1 text-xs text-muted">{mealMark(r.meal)}</p> : null}
                  </>
                )}
              </article>
              )
            )}
          </section>
        ))
      )}
    </div>
    </PrintScale>
  );
}
