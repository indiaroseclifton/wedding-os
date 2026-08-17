import Link from "next/link";
import { ensureDemoWorkspace } from "@/lib/data/workspace";
import { getStudio } from "@/lib/data/studio-store";
import { getInventory } from "@/lib/data/inventory-store";
import {
  STAGES,
  consolidateShop,
  hoursLeft,
  nextStep,
  projectCost,
  projectProgress,
} from "@/lib/studio-project";
import { money } from "@/lib/visual-rooms";

const MAKING_STAGES = [
  ["Look", "Choose the reference"],
  ["Recipe", "Name every part"],
  ["Quantities", "Scale with contingency"],
  ["Source", "Compare and buy"],
  ["Build", "Schedule the hands"],
  ["Pack", "Label the handoff"],
] as const;

const PROJECT_FACES: Record<string, { photo: string; label: string }> = {
  floral: { photo: "/brand/flowers.jpg", label: "Flowers" },
  table: { photo: "/brand/tablescape.jpg", label: "Tables" },
  print: { photo: "/brand/setting.jpg", label: "Print" },
  cricut: { photo: "/brand/setting.jpg", label: "Cricut" },
  decor: { photo: "/brand/candles.jpg", label: "Décor" },
  lighting: { photo: "/brand/candles.jpg", label: "Lighting" },
  favors: { photo: "/brand/rooms/guests.jpg", label: "Favors" },
};

const STARTERS = [
  {
    href: "/diy/studio/floral",
    title: "Flower Studio",
    line: "Turn one arrangement into stems, sources, build time and boxes.",
    photo: "/brand/flowers.jpg",
  },
  {
    href: "/diy/studio/table",
    title: "Table Studio",
    line: "Build the table as one connected set, not a loose shopping list.",
    photo: "/brand/tablescape.jpg",
  },
  {
    href: "/studio/signage",
    title: "Print & signs",
    line: "Take names and wording through material, cut and pack.",
    photo: "/brand/setting.jpg",
  },
] as const;

export default async function StudioPage() {
  const { workspace } = await ensureDemoWorkspace();
  const [studio, inventory] = await Promise.all([getStudio(workspace.id), getInventory(workspace.id)]);
  const projects = studio.projects;
  const active = projects.filter((project) => project.stage !== "after");
  const ready = active.length
    ? Math.round(active.reduce((sum, project) => sum + projectProgress(project), 0) / active.length)
    : 0;
  const spend = projects.reduce((sum, project) => sum + projectCost(project), 0);
  const vendor = projects.reduce((sum, project) => sum + project.vendorEst, 0);
  const saved = Math.max(0, vendor - spend);
  const hours = projects.reduce((sum, project) => sum + hoursLeft(project), 0);
  const shop = consolidateShop(projects);
  const upcoming = active.map(nextStep).filter(Boolean).slice(0, 4);

  return (
    <div className="space-y-10 pb-16">
      <section className="relative isolate overflow-hidden rounded-[2rem] bg-ink text-ivory">
        <img
          src="/brand/flowers.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/15" />
        <div className="relative grid min-h-[29rem] items-end gap-8 p-6 sm:p-9 lg:grid-cols-[minmax(0,0.92fr)_minmax(28rem,1.08fr)] lg:p-12">
          <div className="max-w-xl self-center">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-ivory/75">Vowfolk Studio</p>
            <h1 className="mt-4 font-serif text-[clamp(3rem,7vw,5.8rem)] leading-[0.9] tracking-[-0.04em]">
              Make the day.
            </h1>
            <p className="mt-5 max-w-lg font-display text-lg italic leading-7 text-ivory/90">
              From the photograph you saved to the stems, hands and boxes that get it into the room.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/studio/make" className="btn bg-ivory text-ink hover:bg-white">
                Start from a photo
              </Link>
              <Link href="/diy/studio/floral" className="btn border border-ivory/45 text-ivory hover:bg-ivory/10">
                Open Flower Studio
              </Link>
            </div>
          </div>

          <ol className="grid gap-px overflow-hidden rounded-2xl border border-white/20 bg-white/20 sm:grid-cols-2">
            {MAKING_STAGES.map(([label, line], index) => (
              <li key={label} className="bg-ink/65 px-4 py-4 backdrop-blur-md">
                <div className="flex items-start gap-3">
                  <span className="text-xs tabular-nums text-ivory/55">0{index + 1}</span>
                  <div>
                    <p className="font-serif text-lg">{label}</p>
                    <p className="mt-0.5 text-xs leading-5 text-ivory/65">{line}</p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="studio-status">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="kicker">The making desk</p>
            <h2 id="studio-status" className="mt-2 font-serif text-3xl sm:text-4xl">
              {active.length ? `${active.length} active ${active.length === 1 ? "build" : "builds"}` : "Choose what you are making first"}
            </h2>
          </div>
          {active.length ? (
            <Link href="/studio/projects" className="text-sm underline underline-offset-4">
              See every project
            </Link>
          ) : null}
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(18rem,0.55fr)]">
          <div>
            {active.length ? (
              <ul className="grid gap-4 sm:grid-cols-2">
                {active.slice(0, 4).map((project) => {
                  const face = PROJECT_FACES[project.kind] || PROJECT_FACES.decor;
                  const progress = projectProgress(project);
                  return (
                    <li key={project.id}>
                      <Link
                        href={`/studio/projects/${project.id}`}
                        className="group block overflow-hidden rounded-3xl border border-line bg-surface"
                      >
                        <div className="relative aspect-[16/8] overflow-hidden">
                          <img
                            src={project.inspiration || face.photo}
                            alt=""
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                          />
                          <span className="absolute left-3 top-3 rounded-full bg-paper/90 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.15em] text-ink backdrop-blur">
                            {face.label}
                          </span>
                        </div>
                        <div className="p-5">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3 className="font-serif text-2xl leading-tight">{project.title}</h3>
                              <p className="mt-1 text-xs text-muted">
                                {STAGES.find((stage) => stage.id === project.stage)?.label} · {project.qty} to make
                              </p>
                            </div>
                            <span className="font-serif text-xl tabular-nums">{progress}%</span>
                          </div>
                          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-line">
                            <div className="h-full rounded-full bg-sage" style={{ width: `${progress}%` }} />
                          </div>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="rounded-3xl border border-line bg-surface p-6 sm:p-8">
                <p className="max-w-xl font-display text-xl italic leading-8 text-ink-soft">
                  A Flower Studio starter is inspiration, not an active project. Save it to Studio when the look,
                  quantity and recipe are yours.
                </p>
                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  {STARTERS.map((starter) => (
                    <Link key={starter.href} href={starter.href} className="group overflow-hidden rounded-2xl border border-line">
                      <img
                        src={starter.photo}
                        alt=""
                        className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                      />
                      <span className="block p-4">
                        <span className="block font-serif text-xl">{starter.title}</span>
                        <span className="mt-1 block text-xs leading-5 text-muted">{starter.line}</span>
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          <aside className="rounded-3xl border border-line bg-moss-soft p-5 sm:p-6">
            <p className="kicker">Execution</p>
            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-5">
              <div>
                <dt className="text-xs text-muted">Ready</dt>
                <dd className="mt-1 font-serif text-3xl tabular-nums">{active.length ? `${ready}%` : "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Hours left</dt>
                <dd className="mt-1 font-serif text-3xl tabular-nums">{hours || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Supply lines</dt>
                <dd className="mt-1 font-serif text-3xl tabular-nums">{shop.length || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Packed boxes</dt>
                <dd className="mt-1 font-serif text-3xl tabular-nums">{inventory.boxes.length || "—"}</dd>
              </div>
            </dl>
            <div className="mt-6 border-t border-ink/10 pt-5">
              <p className="text-xs text-muted">DIY estimate</p>
              <p className="mt-1 font-serif text-2xl">{spend ? money(spend) : "Start a project"}</p>
              <p className="mt-1 text-xs leading-5 text-muted">
                {saved ? `About ${money(saved)} below the current hire estimate.` : "Cost appears only after a recipe becomes a project."}
              </p>
            </div>
            <Link href="/studio/shop" className="btn btn-primary mt-6 w-full justify-center">
              Open supplies
            </Link>
          </aside>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)]">
        <div className="rounded-3xl border border-line bg-surface p-6">
          <p className="kicker">Up next</p>
          {upcoming.length ? (
            <ul className="mt-4 divide-y divide-line">
              {upcoming.map((step) =>
                step ? (
                  <li key={step.id} className="grid grid-cols-[5rem_1fr] gap-3 py-3 text-sm">
                    <span className="text-muted">{step.when}</span>
                    <span>{step.what}</span>
                  </li>
                ) : null
              )}
            </ul>
          ) : (
            <p className="mt-4 text-sm leading-6 text-muted">
              Build dates, owners and transport tasks will collect here once a project is saved.
            </p>
          )}
          <Link href="/diy/calendar" className="mt-5 inline-block text-sm underline underline-offset-4">
            Open build week
          </Link>
        </div>

        <div className="rounded-3xl border border-line bg-paper p-6 sm:p-8">
          <p className="kicker">Why Studio is different</p>
          <h2 className="mt-2 max-w-2xl font-serif text-3xl sm:text-4xl">Change the count once. Update the whole build.</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              ["12 → 15 tables", "Stems, vessels and contingency recalculate."],
              ["One source changes", "Cost and pickup plan stay attached to the project."],
              ["A helper joins", "Build time, assignment and packed box move together."],
            ].map(([title, line]) => (
              <article key={title} className="rounded-2xl bg-surface p-4">
                <h3 className="font-serif text-xl">{title}</h3>
                <p className="mt-2 text-xs leading-5 text-muted">{line}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

