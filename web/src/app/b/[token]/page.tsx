import { notFound } from "next/navigation";
import { findVisionByBoardToken } from "@/lib/data/workspace";
import { getWorkspaceMeta } from "@/lib/data/store";
import { DEMO_WORKSPACE } from "@/lib/data/workspace";
import { BOARD_SECTIONS, pinSection, storyLabel, visionCover } from "@/lib/vision";
import { PrintButton } from "@/components/ui/PrintButton";
import { PrintSeal } from "@/components/ui/PrintSeal";

export default async function FloristBoardPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const found = await findVisionByBoardToken(token);
  if (!found) notFound();
  const meta = await getWorkspaceMeta(found.workspaceId, DEMO_WORKSPACE.name);
  const v = found.vision;
  const cover = visionCover(v);
  const names = meta.coupleNames || meta.name;
  const hex = v.palette?.hex || [];

  return (
    <div className="min-h-screen bg-paper text-ink">
      <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-3 print:hidden">
          <div>
            <PrintSeal label="The board" />
            <h1 className="mt-2 font-serif text-4xl tracking-tight">{names}</h1>
            <p className="mt-1 text-sm text-muted">
              {[meta.weddingDate, meta.location, v.vibe, v.formal].filter(Boolean).join(" · ")}
            </p>
          </div>
          <PrintButton label="Print board" />
        </div>

        <header className="mb-8 hidden print:block">
          <PrintSeal label="The board" />
          <h1 className="mt-2 font-serif text-4xl">{names}</h1>
          <p className="mt-1 text-sm text-muted">
            {[meta.weddingDate, meta.location, v.vibe, v.formal].filter(Boolean).join(" · ")}
          </p>
        </header>

        {cover ? (
          <img src={cover} alt="" className="mb-8 aspect-[21/9] w-full rounded-[1.4rem] object-cover" />
        ) : null}

        {hex.length ? (
          <div className="mb-8 flex flex-wrap items-center gap-2">
            {hex.map((c) => (
              <span key={c} className="h-8 w-8 rounded-full border border-line" style={{ background: c }} />
            ))}
            <span className="text-sm text-muted">{storyLabel(v.story) || v.colors}</span>
          </div>
        ) : null}

        {v.avoid ? <p className="mb-8 text-sm">Hard no: {v.avoid}</p> : null}

        <div className="columns-1 gap-3 sm:columns-2 lg:columns-3 print:columns-2">
          {BOARD_SECTIONS.map((section) => {
            const items = v.feel.filter((p) => pinSection(p.tag) === section);
            if (!items.length) return null;
            return items.map((p) => (
              <article key={p.id} className="mb-3 break-inside-avoid overflow-hidden rounded-[1.2rem] bg-surface">
                <img src={p.url} alt="" className="w-full object-cover" />
                <div className="px-3 py-2">
                  <p className="kicker">{section}</p>
                  <p className="font-serif text-lg leading-tight">{p.why || section}</p>
                </div>
              </article>
            ));
          })}
        </div>

        {v.reject.length ? (
          <section className="mt-10">
            <p className="kicker">No</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {v.reject.map((p) => (
                <img key={p.id} src={p.url} alt="" className="h-16 w-20 rounded-lg object-cover opacity-55" />
              ))}
            </div>
          </section>
        ) : null}

        <p className="mt-12 text-xs text-muted print:hidden">Same link. If they change the board, refresh.</p>
      </div>
    </div>
  );
}
