import Link from "next/link";
import { ensureDemoWorkspace } from "@/lib/data/workspace";
import { getDiy } from "@/lib/data/diy-store";
import { getInventory } from "@/lib/data/inventory-store";
import { getBudget } from "@/lib/data/budget-store";
import { APP_TAGLINE } from "@/lib/vowfolk";
import { money } from "@/lib/visual-rooms";

const TOOLS = [
  { href: "/diy/studio/floral", title: "Flowers", line: "Design arrangements, calculate stems, and plan installs.", photo: "/brand/flowers.jpg" },
  { href: "/diy/studio/table", title: "Tablescapes", line: "Plan layouts, place settings, linens, and accents.", photo: "/brand/tablescape.jpg" },
  { href: "/studio/signage", title: "Signage & Cricut", line: "Create custom signs and details with templates.", photo: "/brand/paper.jpg" },
  { href: "/studio/decor", title: "Decor Builds", line: "Build backdrops, arches, and statement pieces.", photo: "/brand/candles.jpg" },
  { href: "/studio/inventory", title: "DIY Inventory", line: "Track supplies, tools, and on-hand materials.", photo: "/brand/setting.jpg" },
  { href: "/diy/calendar", title: "Project Timeline", line: "Plan your build schedule and stay on track.", photo: "/brand/garden.jpg" },
];

export default async function StudioPage() {
  const { workspace } = await ensureDemoWorkspace();
  const [diy, inventory, budget] = await Promise.all([
    getDiy(workspace.id),
    getInventory(workspace.id),
    getBudget(workspace.id),
  ]);
  const projects = diy.projects || [];
  const bought = projects.flatMap((p) => p.shopping).filter((s) => s.bought).length;
  const shop = projects.flatMap((p) => p.shopping).length;
  const progress = shop ? Math.round((bought / shop) * 100) : projects.length ? 20 : 0;
  const est = projects.flatMap((p) => p.shopping).reduce((s, i) => s + (i.estEach || 0) * i.qty, 0);
  const cap = budget.overallLimit || 0;

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-2xl border border-line bg-surface">
        <div className="grid lg:grid-cols-[1.2fr_0.8fr]">
          <div className="p-6 sm:p-8">
            <p className="kicker">Vowfolk Studio</p>
            <h1 className="mt-3 font-serif text-[clamp(2.2rem,5vw,3.4rem)] leading-none tracking-tight">
              Vowfolk Studio
            </h1>
            <p className="home-script mt-3">{APP_TAGLINE}</p>
            <p className="mt-3 max-w-md text-sm text-muted">
              Upload inspiration, build projects, calculate quantities, source materials, and coordinate helpers.
            </p>
            <Link href="/planning/vision" className="btn btn-primary mt-6">
              Upload inspiration
            </Link>
          </div>
          <div className="relative min-h-[12rem]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/flowers.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
          </div>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-3">
        <article className="panel p-5">
          <p className="kicker">Project progress</p>
          <p className="mt-2 font-serif text-4xl tabular-nums">{progress}%</p>
          <p className="mt-1 text-sm text-muted">{shop ? "On track" : "Start a project"}</p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-line">
            <div className="h-full rounded-full bg-sage" style={{ width: `${progress}%` }} />
          </div>
        </article>
        <article className="panel p-5">
          <p className="kicker">Estimated cost</p>
          <p className="mt-2 font-serif text-4xl">{est ? money(est) : "—"}</p>
          <p className="mt-1 text-sm text-muted">{cap ? `of ${money(cap)} budget` : "Add estimates on a list"}</p>
        </article>
        <article className="panel p-5">
          <p className="kicker">Inventory</p>
          <p className="mt-2 font-serif text-4xl tabular-nums">{inventory.boxes.length}</p>
          <p className="mt-1 text-sm text-muted">{inventory.boxes.length ? "boxes packed" : "No boxes yet"}</p>
        </article>
      </div>

      <div>
        <p className="kicker mb-3">Studio tools</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map((t) => (
            <Link key={t.href} href={t.href} className="group overflow-hidden rounded-2xl border border-line bg-surface">
              <div className="aspect-[16/9] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={t.photo} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
              </div>
              <div className="p-4">
                <h2 className="font-serif text-xl tracking-tight">{t.title}</h2>
                <p className="mt-1 text-sm text-muted">{t.line}</p>
                <p className="mt-3 text-xs text-dusty">View projects →</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <article className="panel p-5">
          <div className="flex items-center justify-between">
            <p className="kicker">My projects</p>
            <Link href="/diy" className="text-xs text-dusty">View all</Link>
          </div>
          {projects.length ? (
            <ul className="mt-3 space-y-3">
              {projects.slice(0, 4).map((p) => {
                const n = p.shopping.length;
                const d = p.shopping.filter((s) => s.bought).length;
                const pct = n ? Math.round((d / n) * 100) : 0;
                return (
                  <li key={p.id}>
                    <Link href={`/diy/${p.playbookSlug}`} className="block">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{p.title}</span>
                        <span className="tabular-nums text-muted">{pct}%</span>
                      </div>
                      <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-line">
                        <div className="h-full bg-sage" style={{ width: `${pct}%` }} />
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted">Commit a playbook and it lands here.</p>
          )}
        </article>
        <article className="panel p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <p className="kicker">Upcoming tasks</p>
            <Link href="/diy/calendar" className="text-xs text-dusty">View full schedule</Link>
          </div>
          <p className="mt-3 text-sm text-muted">
            The week-of calendar is where flowers arrive, stems get conditioned, and the backdrop goes up.
          </p>
          <Link href="/diy/calendar" className="btn btn-ghost mt-4">
            Open build calendar
          </Link>
        </article>
      </div>
    </div>
  );
}
