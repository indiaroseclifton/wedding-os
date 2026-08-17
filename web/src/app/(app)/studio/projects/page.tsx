import Link from "next/link";
import { ensureDemoWorkspace } from "@/lib/data/workspace";
import { getStudio } from "@/lib/data/studio-store";
import { KINDS, projectProgress } from "@/lib/studio-project";

export default async function StudioProjectsPage() {
  const { workspace } = await ensureDemoWorkspace();
  const studio = await getStudio(workspace.id);
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="kicker">Studio</p>
          <h1 className="mt-2 font-serif text-4xl tracking-tight">Projects</h1>
          <p className="mt-2 text-sm text-muted">Every thing you’re making, one object.</p>
        </div>
        <Link href="/studio/make" className="btn btn-primary">
          Make this
        </Link>
      </header>
      {studio.projects.length === 0 ? (
        <p className="text-sm text-muted">Nothing yet. Start from a picture you love.</p>
      ) : (
        <ul className="divide-y divide-line rounded-2xl border border-line bg-surface">
          {studio.projects.map((p) => (
            <li key={p.id}>
              <Link href={`/studio/projects/${p.id}`} className="flex items-center justify-between gap-3 px-4 py-3">
                <span>
                  <span className="block font-medium">{p.title}</span>
                  <span className="text-xs text-muted">{KINDS.find((k) => k.id === p.kind)?.label} · ×{p.qty}</span>
                </span>
                <span className="text-sm tabular-nums text-muted">{projectProgress(p)}%</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
