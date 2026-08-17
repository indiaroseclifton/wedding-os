import Link from "next/link";
import { ensureDemoWorkspace } from "@/lib/data/workspace";
import { getStudio } from "@/lib/data/studio-store";
import { getInventory } from "@/lib/data/inventory-store";
import {
  KINDS,
  STAGES,
  consolidateShop,
  hoursLeft,
  nextStep,
  projectCost,
  projectProgress,
} from "@/lib/studio-project";
import { money } from "@/lib/visual-rooms";

export default async function StudioPage() {
  const { workspace } = await ensureDemoWorkspace();
  const [studio, inventory] = await Promise.all([getStudio(workspace.id), getInventory(workspace.id)]);
  const projects = studio.projects;
  const active = projects.filter((p) => p.stage !== "after");
  const ready = active.length
    ? Math.round(active.reduce((s, p) => s + projectProgress(p), 0) / active.length)
    : 0;
  const spend = projects.reduce((s, p) => s + projectCost(p), 0);
  const vendor = projects.reduce((s, p) => s + p.vendorEst, 0);
  const saved = Math.max(0, vendor - spend);
  const hours = projects.reduce((s, p) => s + hoursLeft(p), 0);
  const shop = consolidateShop(projects);
  const upcoming = active.map(nextStep).filter(Boolean).slice(0, 4);

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="kicker">Studio</p>
          <h1 className="mt-2 font-serif text-[clamp(2.2rem,6vw,3.6rem)] leading-none tracking-tight">
            Your wedding, in the making
          </h1>
          <p className="home-script mt-2">See it. Spec it. Get it to the room.</p>
        </div>
        <Link href="/studio/make" className="btn btn-primary">
          Make this
        </Link>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-2xl border border-line bg-surface px-4 py-3">
          <p className="kicker">Active</p>
          <p className="font-serif text-3xl tabular-nums">{active.length}</p>
          <p className="text-xs text-muted">{ready}% ready</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface px-4 py-3">
          <p className="kicker">DIY spend</p>
          <p className="font-serif text-3xl">{spend ? money(spend) : "—"}</p>
          <p className="text-xs text-muted">{saved ? `about ${money(saved)} vs hiring` : "Make a project"}</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface px-4 py-3">
          <p className="kicker">Hours left</p>
          <p className="font-serif text-3xl tabular-nums">{hours || "—"}</p>
          <p className="text-xs text-muted">Across undone steps</p>
        </article>
        <article className="rounded-2xl border border-line bg-surface px-4 py-3">
          <p className="kicker">Boxes</p>
          <p className="font-serif text-3xl tabular-nums">{inventory.boxes.length}</p>
          <p className="text-xs text-muted">{shop.length} supply lines</p>
        </article>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <p className="kicker">Projects</p>
            <Link href="/studio/projects" className="text-xs underline">
              All
            </Link>
          </div>
          {projects.length === 0 ? (
            <p className="text-sm text-muted">
              Upload a picture you love — or just name it.{" "}
              <Link href="/studio/make" className="underline">
                Make this
              </Link>
            </p>
          ) : (
            <ul className="space-y-3">
              {projects.slice(0, 6).map((p) => (
                <li key={p.id}>
                  <Link href={`/studio/projects/${p.id}`} className="block rounded-2xl border border-line bg-surface px-4 py-3">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{p.title}</span>
                      <span className="tabular-nums text-muted">{projectProgress(p)}%</span>
                    </div>
                    <p className="mt-1 text-xs text-muted">
                      {KINDS.find((k) => k.id === p.kind)?.label} · {STAGES.find((s) => s.id === p.stage)?.label} · ×{p.qty}
                    </p>
                    <div className="mt-2 h-1 overflow-hidden rounded-full bg-line">
                      <div className="h-full bg-sage" style={{ width: `${projectProgress(p)}%` }} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <p className="kicker mb-3">Up next</p>
          {upcoming.length === 0 ? (
            <p className="text-sm text-muted">Nothing on the week until a project has steps.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {upcoming.map((s) =>
                s ? (
                  <li key={s.id} className="rounded-xl border border-line px-3 py-2">
                    <span className="text-muted">{s.when}</span>
                    <span className="block">{s.what}</span>
                  </li>
                ) : null
              )}
            </ul>
          )}
          <Link href="/studio/shop" className="btn btn-ghost mt-4 w-full">
            Shopping list
          </Link>
        </section>
      </div>

      <section>
        <p className="kicker mb-3">Rooms</p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {KINDS.map((k) => (
            <Link key={k.id} href={k.href} className="rounded-xl border border-line bg-surface px-4 py-3">
              <p className="font-medium">{k.label}</p>
              <p className="text-xs text-muted">{k.line}</p>
            </Link>
          ))}
          <Link href="/studio/inventory" className="rounded-xl border border-line bg-surface px-4 py-3">
            <p className="font-medium">Inventory</p>
            <p className="text-xs text-muted">Boxes, labels, after</p>
          </Link>
          <Link href="/diy/calendar" className="rounded-xl border border-line bg-surface px-4 py-3">
            <p className="font-medium">Build calendar</p>
            <p className="text-xs text-muted">The week, backwards</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
