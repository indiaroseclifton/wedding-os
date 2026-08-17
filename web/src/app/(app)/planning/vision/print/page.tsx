import { PrintButton } from "@/components/ui/PrintButton";
import { PrintSeal } from "@/components/ui/PrintSeal";
import { ensureDemoWorkspace, getWorkspaceDecisions } from "@/lib/data/workspace";
import { colorsLine, normalizeVision, storyLabel, visionCover } from "@/lib/vision";
import Link from "next/link";

export default async function VisionPrintPage() {
  const { workspace, meta } = await ensureDemoWorkspace();
  const decisions = await getWorkspaceDecisions(workspace.id);
  const row = decisions.find((d) => d.type === "STYLE_VIBE");
  const v = normalizeVision(row?.payload);
  const cover = visionCover(v);
  const hex = v.palette?.hex || [];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3 print:hidden">
        <div>
          <PrintSeal label="Vision brief" />
          <h1 className="mt-1 font-serif text-4xl">How it should feel</h1>
        </div>
        <div className="flex gap-2">
          <PrintButton label="Print brief" />
          <Link href="/planning/vision" className="rounded-full border border-line px-4 py-2 text-sm">
            Back
          </Link>
        </div>
      </div>

      <header className="hidden print:block">
        <PrintSeal label="Vision brief" />
        <h1 className="mt-1 font-serif text-4xl">{meta.coupleNames || meta.name}</h1>
        <p className="mt-1 text-sm text-muted">
          {meta.weddingDate || ""}
          {meta.location ? ` · ${meta.location}` : ""}
        </p>
      </header>

      <article className="panel overflow-hidden">
        {cover ? <img src={cover} alt="" className="aspect-[16/8] w-full object-cover" /> : null}
        <div className="space-y-5 p-6">
          <div>
            <p className="font-serif text-3xl">{v.vibe || "Still looking"}</p>
            <p className="mt-1 text-sm text-muted">
              {[v.formal, v.venueType, storyLabel(v.story)].filter(Boolean).join(" · ")}
            </p>
          </div>
          {hex.length ? (
            <div className="flex flex-wrap items-center gap-2">
              {hex.map((c) => (
                <span key={c} className="h-8 w-8 rounded-full border border-line" style={{ background: c }} />
              ))}
              <span className="text-sm text-muted">{colorsLine(v)}</span>
            </div>
          ) : null}
          {v.must.length ? <p className="text-sm">Must win: {v.must.join(" · ")}</p> : null}
          {v.avoid ? <p className="text-sm">Hard no: {v.avoid}</p> : null}
          {v.notes ? <p className="whitespace-pre-wrap text-sm text-ink-soft">{v.notes}</p> : null}
          {v.feel.length ? (
            <div className="grid grid-cols-3 gap-2">
              {v.feel.slice(0, 6).map((p) => (
                <img key={p.id} src={p.url} alt="" className="aspect-[4/3] w-full rounded-lg object-cover" />
              ))}
            </div>
          ) : null}
          {v.reject.length ? (
            <div>
              <p className="kicker">No</p>
              <div className="mt-2 flex gap-2">
                {v.reject.slice(0, 6).map((p) => (
                  <img key={p.id} src={p.url} alt="" className="h-14 w-16 rounded object-cover opacity-55" />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </article>
    </div>
  );
}
