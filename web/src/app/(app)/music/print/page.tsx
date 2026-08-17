import { ensureDemoWorkspace } from "@/lib/data/workspace";
import { getMusic } from "@/lib/data/music-store";
import { DJ_CUES, mergeCues } from "@/lib/dj-cues";
import { PrintButton } from "@/components/ui/PrintButton";
import { PrintSeal } from "@/components/ui/PrintSeal";
import Link from "next/link";

export default async function DjPrintPage() {
  const { workspace } = await ensureDemoWorkspace();
  const music = await getMusic(workspace.id);
  const cues = mergeCues(music.cues || music.moments);
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between print:hidden">
        <div>
          <PrintSeal label="DJ packet" />
          <h1 className="mt-1 font-serif text-4xl">Cue book</h1>
        </div>
        <div className="flex gap-2">
          <PrintButton label="Print for the DJ" />
          <Link href="/music" className="rounded-full border border-line px-4 py-2 text-sm">Back</Link>
        </div>
      </div>
      {(["ceremony", "cocktail", "reception"] as const).map((act) => (
        <section key={act}>
          <h2 className="font-serif text-2xl capitalize">{act}</h2>
          <ul className="mt-2 divide-y divide-line rounded-2xl border border-line bg-surface">
            {DJ_CUES.filter((c) => c.act === act).map((def) => {
              const row = cues.find((c) => c.id === def.id);
              return (
                <li key={def.id} className="px-4 py-3 text-sm">
                  <p className="font-medium">{def.label}</p>
                  <p className="text-xs text-muted">{def.when}</p>
                  <p className="mt-1">{row?.skip ? "— skip" : row?.song || "(not set)"}</p>
                  {(row?.who || row?.notes) && (
                    <p className="text-xs text-ink-soft">{[row.who, row.notes].filter(Boolean).join(" · ")}</p>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
      <section className="text-sm">
        <p><span className="text-muted">Must play:</span> {(music.mustPlay || []).join("; ") || "—"}</p>
        <p className="mt-1"><span className="text-muted">Do not play:</span> {(music.doNotPlay || []).join("; ") || "—"}</p>
        <p className="mt-1"><span className="text-muted">Announce:</span> {music.announceNames || "—"}</p>
        <p className="mt-1"><span className="text-muted">Feel:</span> {music.genres || "—"} · {music.energy || "—"}</p>
        {music.noLineDances && <p className="mt-1">No line dances.</p>}
      </section>
    </div>
  );
}
