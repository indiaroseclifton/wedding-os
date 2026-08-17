"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  BUILD_STEPS,
  FLOWER_SHOPS,
  LOOKS,
  buildDays,
  scaleRecipe,
  stemById,
  type FloralLook,
} from "@/lib/floral-studio";

const STUDIO_STAGES = [
  { id: "look", label: "Look", line: "Reference" },
  { id: "recipe", label: "Recipe", line: "Every stem" },
  { id: "quantities", label: "Quantities", line: "Scale + 15%" },
  { id: "source", label: "Source", line: "Price and pickup" },
  { id: "build", label: "Build", line: "Hands and time" },
  { id: "pack", label: "Pack", line: "Boxes and handoff" },
] as const;

type StageId = (typeof STUDIO_STAGES)[number]["id"];

export function FlowerDesk() {
  const [look, setLook] = useState<FloralLook>(LOOKS[0]);
  const [recipe, setRecipe] = useState(LOOKS[0].recipe);
  const [qty, setQty] = useState(12);
  const [cont, setCont] = useState(0.15);
  const [hero, setHero] = useState(LOOKS[0].photo);
  const [city, setCity] = useState("Atlanta, GA");
  const [date, setDate] = useState("");
  const [names, setNames] = useState("You");
  const [activeStage, setActiveStage] = useState<StageId>("look");
  const [projectId, setProjectId] = useState<string | null>(null);
  const [suppliesAdded, setSuppliesAdded] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [browse, setBrowse] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/workspace")
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (data?.meta?.location) setCity(data.meta.location);
        if (data?.meta?.weddingDate) setDate(data.meta.weddingDate);
        if (data?.meta?.coupleNames) {
          setNames(data.meta.coupleNames.split(/\s*(?:&|and)\s*/i)[0] || "You");
        }
      })
      .catch(() => {});
  }, []);

  const plan = useMemo(() => scaleRecipe(recipe, qty, cont), [recipe, qty, cont]);
  const days = useMemo(() => buildDays(date), [date]);
  const buildHours = Math.max(4, Math.ceil(plan.stems / 55) * 2 + 2);
  const completedSignals = [Boolean(hero), recipe.length > 0, qty > 0, Boolean(city), Boolean(date), Boolean(projectId)];
  const readiness = Math.round((completedSignals.filter(Boolean).length / completedSignals.length) * 100);
  const missing = [
    !date ? "wedding date" : null,
    !projectId ? "save to Studio" : null,
    !suppliesAdded ? "source choice" : null,
  ].filter(Boolean) as string[];
  const stageIndex = STUDIO_STAGES.findIndex((stage) => stage.id === activeStage);

  function apply(next: FloralLook) {
    setLook(next);
    setRecipe(next.recipe);
    setHero(next.photo);
    setProjectId(null);
    setSuppliesAdded(false);
    setBrowse(false);
  }

  function setCount(stemId: string, count: number) {
    setRecipe((rows) =>
      rows.map((row) => (row.stemId === stemId ? { ...row, count: Math.max(0, count) } : row))
    );
    setProjectId(null);
  }

  function remove(stemId: string) {
    setRecipe((rows) => rows.filter((row) => row.stemId !== stemId));
    setProjectId(null);
  }

  function moveStage(direction: 1 | -1) {
    const next = Math.min(STUDIO_STAGES.length - 1, Math.max(0, stageIndex + direction));
    setActiveStage(STUDIO_STAGES[next].id);
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  async function share() {
    const url = window.location.href;
    await navigator.clipboard.writeText(url).catch(() => {});
    setMsg("Flower Studio link copied.");
  }

  async function saveProject() {
    setSaving(true);
    setMsg(null);
    const steps = BUILD_STEPS.map((step) => ({
      when: date ? days[step.offset + 3]?.label || step.time : "Set date",
      what: `${step.time} · ${step.what}`,
      hours: step.what.toLowerCase().includes("build") ? 2 : step.what.toLowerCase().includes("transport") ? 1.5 : 1,
    }));
    const response = await fetch("/api/studio/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "upsert_kind",
        kind: "floral",
        title: look.title,
        qty,
        materials: plan.rows.map((row) => ({
          label: row.name,
          qty: row.total,
          unit: "stems",
          estEach: row.each,
        })),
        vendorEst: Math.round(plan.cost * 2.4),
        budget: Math.round(plan.cost),
        inspiration: hero.startsWith("blob:") ? "" : hero,
        note: `${look.why} ${Math.round(cont * 100)}% contingency included.`,
        owner: names,
        steps,
      }),
    });
    const data = await response.json().catch(() => ({}));
    setSaving(false);
    if (!response.ok) {
      setMsg("Could not save this project.");
      return;
    }
    const saved = data?.studio?.projects?.find(
      (project: { kind?: string; title?: string }) => project.kind === "floral" && project.title === look.title
    );
    setProjectId(saved?.id || null);
    setMsg("Saved to Studio. Quantities, cost and build steps are connected.");
  }

  async function toShop() {
    const response = await fetch("/api/diy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "push_floral",
        tables: qty,
        lines: plan.rows.map((line) => ({ label: line.name, qty: line.total, estEach: line.each })),
      }),
    });
    if (response.ok) {
      setSuppliesAdded(true);
      setMsg("Stems added to the shared Studio supply list.");
    } else {
      setMsg("Could not add stems to supplies.");
    }
  }

  return (
    <div className="space-y-6 pb-28">
      <header className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div>
          <Link href="/studio" className="text-xs text-muted underline underline-offset-4">
            Vowfolk Studio
          </Link>
          <p className="kicker mt-5">Flowers · {projectId ? "Connected project" : "Starter draft"}</p>
          <h1 className="mt-2 font-serif text-[clamp(2.7rem,6vw,5rem)] leading-[0.92] tracking-[-0.04em]">
            {look.title}
          </h1>
          <p className="mt-3 max-w-2xl font-display text-lg italic leading-7 text-ink-soft">
            One flower project from reference image to packed box. Change the count once and the rest follows.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={share} className="btn btn-ghost">
            Copy link
          </button>
          <button type="button" onClick={saveProject} disabled={saving} className="btn btn-primary">
            {saving ? "Saving…" : projectId ? "Update Studio project" : "Save to Studio"}
          </button>
        </div>
      </header>

      <section className="overflow-hidden rounded-3xl border border-line bg-surface">
        <div className="grid lg:grid-cols-[15rem_minmax(0,1fr)]">
          <img src={hero} alt="" className="h-full min-h-48 w-full object-cover" />
          <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-4">
            <Metric label="Arrangement" value={look.vessel === "bowl" ? "Low bowl" : look.vessel} />
            <Metric label="Quantity" value={String(qty)} detail="pieces" />
            <Metric label="Working budget" value={`$${Math.round(plan.cost)}`} detail="with contingency" />
            <Metric label="Deadline" value={date ? prettyDate(date) : "Date needed"} detail={city} />
          </div>
        </div>
      </section>

      <nav aria-label="Flower Studio stages" className="overflow-x-auto">
        <ol className="flex min-w-max gap-2 lg:grid lg:min-w-0 lg:grid-cols-6">
          {STUDIO_STAGES.map((stage, index) => {
            const active = activeStage === stage.id;
            const passed = index < stageIndex;
            return (
              <li key={stage.id} className="min-w-36 lg:min-w-0">
                <button
                  type="button"
                  onClick={() => setActiveStage(stage.id)}
                  aria-current={active ? "step" : undefined}
                  className={`min-h-16 w-full rounded-2xl border px-4 py-3 text-left transition ${
                    active
                      ? "border-ink bg-ink text-ivory"
                      : passed
                        ? "border-sage bg-moss-soft text-ink"
                        : "border-line bg-surface text-ink"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className={`text-[10px] tabular-nums ${active ? "text-ivory/60" : "text-muted"}`}>
                      0{index + 1}
                    </span>
                    <span className="font-serif text-lg">{stage.label}</span>
                  </span>
                  <span className={`mt-1 block text-[11px] ${active ? "text-ivory/65" : "text-muted"}`}>{stage.line}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      <main className="min-h-[34rem]">
        {activeStage === "look" ? (
          <LookStage
            hero={hero}
            look={look}
            onUpload={(next) => {
              setHero(next);
              setProjectId(null);
            }}
            onBrowse={() => setBrowse(true)}
            onApply={apply}
          />
        ) : null}

        {activeStage === "recipe" ? (
          <RecipeStage
            hero={hero}
            look={look}
            recipe={recipe}
            setCount={setCount}
            remove={remove}
          />
        ) : null}

        {activeStage === "quantities" ? (
          <QuantitiesStage
            qty={qty}
            setQty={(next) => {
              setQty(next);
              setProjectId(null);
            }}
            cont={cont}
            setCont={(next) => {
              setCont(next);
              setProjectId(null);
            }}
            plan={plan}
          />
        ) : null}

        {activeStage === "source" ? (
          <SourceStage city={city} plan={plan} onChoose={toShop} chosen={suppliesAdded} />
        ) : null}

        {activeStage === "build" ? (
          <BuildStage date={date} days={days} buildHours={buildHours} owner={names} />
        ) : null}

        {activeStage === "pack" ? (
          <PackStage
            projectId={projectId}
            suppliesAdded={suppliesAdded}
            owner={names}
            stems={plan.stems}
            qty={qty}
            saveProject={saveProject}
          />
        ) : null}
      </main>

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => moveStage(-1)}
          disabled={stageIndex === 0}
          className="btn btn-ghost disabled:opacity-35"
        >
          Previous
        </button>
        <p aria-live="polite" className="text-center text-xs text-muted">
          {msg || `Step ${stageIndex + 1} of ${STUDIO_STAGES.length}`}
        </p>
        <button
          type="button"
          onClick={() => moveStage(1)}
          disabled={stageIndex === STUDIO_STAGES.length - 1}
          className="btn btn-primary disabled:opacity-35"
        >
          Continue
        </button>
      </div>

      <section
        aria-label="Project execution summary"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/95 px-4 py-3 shadow-[0_-8px_30px_rgb(0_0_0/0.06)] backdrop-blur-lg lg:left-[var(--desk-rail)]"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <dl className="flex min-w-0 flex-1 items-center gap-5 overflow-x-auto">
            <FooterMetric label="Total stems" value={String(plan.stems)} />
            <FooterMetric label="Estimate" value={`$${Math.round(plan.cost)}`} />
            <FooterMetric label="Build time" value={`${buildHours} hrs`} />
            <FooterMetric label="Readiness" value={`${readiness}%`} />
          </dl>
          <div className="hidden min-w-0 text-right sm:block">
            <p className="text-[10px] uppercase tracking-[0.16em] text-muted">Still needed</p>
            <p className="truncate text-xs">{missing.length ? missing.join(" · ") : "Ready for handoff"}</p>
          </div>
        </div>
      </section>

      {browse ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/45 p-4 sm:items-center">
          <div className="max-h-[88vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-paper p-5 sm:p-7">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="kicker">Starting points</p>
                <h2 className="mt-1 font-serif text-3xl">Choose a buildable look</h2>
              </div>
              <button type="button" onClick={() => setBrowse(false)} className="btn btn-ghost">
                Close
              </button>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {LOOKS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => apply(option)}
                  className="overflow-hidden rounded-2xl border border-line bg-surface text-left"
                >
                  <img src={option.photo} alt="" className="aspect-[16/9] w-full object-cover" />
                  <span className="block p-4">
                    <span className="font-serif text-2xl">{option.title}</span>
                    <span className="mt-1 block text-sm leading-6 text-muted">{option.why}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function LookStage({
  hero,
  look,
  onUpload,
  onBrowse,
  onApply,
}: {
  hero: string;
  look: FloralLook;
  onUpload: (url: string) => void;
  onBrowse: () => void;
  onApply: (look: FloralLook) => void;
}) {
  return (
    <section className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)]">
      <div className="overflow-hidden rounded-3xl border border-line bg-surface">
        <div className="relative">
          <img src={hero} alt="Reference arrangement" className="aspect-[16/10] w-full object-cover" />
          <span className="absolute left-4 top-4 rounded-full bg-paper/90 px-3 py-1 text-[10px] uppercase tracking-[0.15em] backdrop-blur">
            Reference
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 p-5">
          <div>
            <p className="font-serif text-2xl">{look.title}</p>
            <p className="mt-1 text-sm text-muted">Confirm the look before Vowfolk scales it.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <label className="btn btn-ghost cursor-pointer">
              Upload photo
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) onUpload(URL.createObjectURL(file));
                }}
              />
            </label>
            <button type="button" onClick={onBrowse} className="btn btn-primary">
              Browse looks
            </button>
          </div>
        </div>
      </div>
      <aside className="rounded-3xl border border-line bg-moss-soft p-5 sm:p-6">
        <p className="kicker">What Vowfolk carries forward</p>
        <h2 className="mt-2 font-serif text-3xl">A reference becomes a build.</h2>
        <ul className="mt-5 space-y-4 text-sm leading-6">
          <li>Arrangement type and quantity</li>
          <li>Stem recipe with substitutions</li>
          <li>Contingency, price and pickup</li>
          <li>Build hours, helpers and boxes</li>
        </ul>
        <div className="mt-6 border-t border-ink/10 pt-5">
          <p className="text-xs text-muted">Other starting points</p>
          <div className="mt-3 flex gap-2 overflow-x-auto">
            {LOOKS.slice(0, 4).map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => onApply(option)}
                aria-label={`Use ${option.title}`}
                className="h-16 w-20 shrink-0 overflow-hidden rounded-xl border border-line bg-surface"
              >
                <img src={option.photo} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      </aside>
    </section>
  );
}

function RecipeStage({
  hero,
  look,
  recipe,
  setCount,
  remove,
}: {
  hero: string;
  look: FloralLook;
  recipe: FloralLook["recipe"];
  setCount: (stemId: string, count: number) => void;
  remove: (stemId: string) => void;
}) {
  return (
    <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,0.8fr)]">
      <div className="overflow-hidden rounded-3xl border border-line bg-surface">
        <div className="grid gap-px bg-line sm:grid-cols-2">
          <figure className="bg-surface">
            <img src={hero} alt="Reference arrangement" className="aspect-[4/3] w-full object-cover" />
            <figcaption className="p-4 text-xs text-muted">Reference image</figcaption>
          </figure>
          <figure className="relative bg-paper">
            <img src={look.photo} alt="" className="aspect-[4/3] w-full object-cover opacity-75" />
            <div className="absolute inset-0 flex items-center justify-center bg-ink/15 p-6">
              <Link href="/diy/studio/floral?canvas=1" className="btn bg-paper text-ink">
                Open arrangement canvas
              </Link>
            </div>
            <figcaption className="p-4 text-xs text-muted">Current recipe preview</figcaption>
          </figure>
        </div>
        <div className="p-5">
          <p className="kicker">Target comparison</p>
          <p className="mt-2 text-sm leading-6 text-muted">
            Use the canvas when the silhouette matters. Quantities below remain the source of truth.
          </p>
        </div>
      </div>

      <aside className="rounded-3xl border border-line bg-surface p-5 sm:p-6">
        <p className="kicker">Recipe inspector</p>
        <ul className="mt-4 divide-y divide-line">
          {recipe.map((row) => {
            const stem = stemById(row.stemId);
            return (
              <li key={row.stemId} className="flex items-center gap-3 py-3">
                <img src={stem?.photo} alt="" className="h-12 w-12 rounded-xl object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{stem?.name}</p>
                  <p className="text-[11px] leading-5 text-muted">{stem?.season} · {stem?.note}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    aria-label={`Use one fewer ${stem?.name || "stem"}`}
                    className="h-11 w-11 rounded-full border border-line"
                    onClick={() => setCount(row.stemId, row.count - 1)}
                  >
                    −
                  </button>
                  <span className="w-7 text-center text-sm tabular-nums">{row.count}</span>
                  <button
                    type="button"
                    aria-label={`Use one more ${stem?.name || "stem"}`}
                    className="h-11 w-11 rounded-full border border-line"
                    onClick={() => setCount(row.stemId, row.count + 1)}
                  >
                    +
                  </button>
                  <button
                    type="button"
                    aria-label={`Remove ${stem?.name || "stem"}`}
                    className="ml-1 min-h-11 px-2 text-xs text-muted underline"
                    onClick={() => remove(row.stemId)}
                  >
                    Remove
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </aside>
    </section>
  );
}

function QuantitiesStage({
  qty,
  setQty,
  cont,
  setCont,
  plan,
}: {
  qty: number;
  setQty: (qty: number) => void;
  cont: number;
  setCont: (contingency: number) => void;
  plan: ReturnType<typeof scaleRecipe>;
}) {
  return (
    <section className="grid gap-5 lg:grid-cols-[20rem_minmax(0,1fr)]">
      <aside className="rounded-3xl border border-line bg-moss-soft p-6">
        <p className="kicker">Scale the recipe</p>
        <label className="mt-5 block text-sm">
          Number of centerpieces
          <span className="mt-2 flex items-center justify-between rounded-2xl bg-surface p-2">
            <button
              type="button"
              aria-label="Make one fewer centerpiece"
              className="h-11 w-11 rounded-full border border-line"
              onClick={() => setQty(Math.max(1, qty - 1))}
            >
              −
            </button>
            <span className="font-serif text-4xl tabular-nums">{qty}</span>
            <button
              type="button"
              aria-label="Make one more centerpiece"
              className="h-11 w-11 rounded-full border border-line"
              onClick={() => setQty(qty + 1)}
            >
              +
            </button>
          </span>
        </label>
        <label className="mt-5 block text-sm">
          Contingency
          <select
            className="field mt-2 w-full"
            value={String(cont)}
            onChange={(event) => setCont(Number(event.target.value))}
          >
            <option value="0">0% · exact count</option>
            <option value="0.1">10% · controlled</option>
            <option value="0.15">15% · recommended</option>
            <option value="0.2">20% · fragile stems</option>
          </select>
        </label>
        <p className="mt-5 text-xs leading-5 text-muted">
          Vowfolk rounds every stem up after contingency. Rental vessels do not need the same buffer.
        </p>
      </aside>

      <div className="overflow-hidden rounded-3xl border border-line bg-surface">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-line p-5 sm:p-6">
          <div>
            <p className="kicker">Scaled stem plan</p>
            <h2 className="mt-1 font-serif text-3xl">{plan.stems} stems to source</h2>
          </div>
          <p className="font-serif text-3xl">$ {Math.round(plan.cost)}</p>
        </div>
        <div className="overflow-x-auto p-5 sm:p-6">
          <table className="w-full min-w-[34rem] text-left text-sm">
            <thead className="text-[11px] uppercase tracking-[0.14em] text-muted">
              <tr>
                <th className="pb-3 font-normal">Flower</th>
                <th className="pb-3 font-normal">Each</th>
                <th className="pb-3 font-normal">With buffer</th>
                <th className="pb-3 text-right font-normal">Estimate</th>
              </tr>
            </thead>
            <tbody>
              {plan.rows.map((row) => (
                <tr key={row.stemId} className="border-t border-line">
                  <td className="flex items-center gap-3 py-3">
                    <img src={row.photo} alt="" className="h-10 w-10 rounded-xl object-cover" />
                    {row.name}
                  </td>
                  <td className="tabular-nums">{row.per}</td>
                  <td className="tabular-nums">{row.total}</td>
                  <td className="text-right tabular-nums">$ {Math.round(row.cost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function SourceStage({
  city,
  plan,
  onChoose,
  chosen,
}: {
  city: string;
  plan: ReturnType<typeof scaleRecipe>;
  onChoose: () => void;
  chosen: boolean;
}) {
  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="kicker">Source · {city}</p>
          <h2 className="mt-2 font-serif text-3xl sm:text-4xl">Compare the whole recipe, not one stem.</h2>
        </div>
        <p className="text-sm text-muted">{plan.stems} stems · current estimate $ {Math.round(plan.cost)}</p>
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {FLOWER_SHOPS.map((shop, index) => (
          <article key={shop.id} className="rounded-3xl border border-line bg-surface p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase tracking-[0.16em] text-muted">
                  {index === 0 ? "Best recipe support" : index === 1 ? "Lowest estimate" : "Local option"}
                </span>
                <h3 className="mt-2 font-serif text-2xl">{shop.name}</h3>
                <p className="mt-1 text-sm text-muted">{shop.line}</p>
              </div>
              <p className="font-serif text-3xl tabular-nums">$ {Math.round(plan.cost * shop.factor)}</p>
            </div>
            <dl className="mt-6 grid grid-cols-3 gap-2 border-t border-line pt-4 text-xs">
              <div>
                <dt className="text-muted">Recipe fit</dt>
                <dd className="mt-1">Check stock</dd>
              </div>
              <div>
                <dt className="text-muted">Pickup</dt>
                <dd className="mt-1">{index === 0 ? "4–5 days" : "1–3 days"}</dd>
              </div>
              <div>
                <dt className="text-muted">Substitutions</dt>
                <dd className="mt-1">{index === 0 ? "Supported" : "Manual"}</dd>
              </div>
            </dl>
            <button type="button" onClick={onChoose} className="btn btn-ghost mt-5 w-full justify-center">
              {chosen ? "Added to supplies" : "Use in supply list"}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

function BuildStage({
  date,
  days,
  buildHours,
  owner,
}: {
  date: string;
  days: ReturnType<typeof buildDays>;
  buildHours: number;
  owner: string;
}) {
  if (!date) {
    return (
      <section className="rounded-3xl border border-line bg-surface p-8 text-center sm:p-12">
        <p className="kicker">Build dates need one source of truth</p>
        <h2 className="mx-auto mt-3 max-w-xl font-serif text-4xl">Set the wedding date before Vowfolk schedules the flowers.</h2>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-muted">
          Flower Studio will not invent a week or show a stale sample schedule.
        </p>
        <Link href="/settings" className="btn btn-primary mt-6">
          Set wedding date
        </Link>
      </section>
    );
  }

  return (
    <section className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)]">
      <div className="rounded-3xl border border-line bg-surface p-5 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="kicker">Build week</p>
            <h2 className="mt-2 font-serif text-3xl">{buildHours} working hours before {prettyDate(date)}</h2>
          </div>
          <Link href="/diy/calendar" className="text-sm underline underline-offset-4">
            Open full calendar
          </Link>
        </div>
        <ol className="mt-6 grid gap-2 sm:grid-cols-4">
          {days.map((day) => (
            <li
              key={day.key}
              className={`rounded-2xl p-4 ${day.wedding ? "bg-ink text-ivory" : "bg-paper"}`}
            >
              <p className="text-[10px] uppercase tracking-[0.14em]">{day.dow}</p>
              <p className="mt-1 font-serif text-xl">{day.label}</p>
              <p className={`mt-3 text-[11px] ${day.wedding ? "text-ivory/65" : "text-muted"}`}>
                {day.wedding ? "Wedding and transport" : "Flower build"}
              </p>
            </li>
          ))}
        </ol>
        <ul className="mt-6 divide-y divide-line">
          {BUILD_STEPS.map((step) => (
            <li key={step.what} className="grid grid-cols-[5.5rem_1fr] gap-4 py-3 text-sm">
              <span className="text-muted">{step.time}</span>
              <span>{step.what}</span>
            </li>
          ))}
        </ul>
      </div>
      <aside className="rounded-3xl border border-line bg-moss-soft p-5 sm:p-6">
        <p className="kicker">Hands</p>
        <h3 className="mt-2 font-serif text-3xl">Assign the build, not just the wedding.</h3>
        <ul className="mt-5 space-y-3">
          {[
            [owner, "Project owner"],
            ["Lead builder", "Needs assignment"],
            ["Prep and hydration", "Needs assignment"],
            ["Transport", "Needs assignment"],
          ].map(([name, role]) => (
            <li key={role} className="flex items-center gap-3 rounded-2xl bg-surface p-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-paper font-serif">
                {name.slice(0, 1)}
              </span>
              <span>
                <span className="block text-sm font-medium">{name}</span>
                <span className="block text-[11px] text-muted">{role}</span>
              </span>
            </li>
          ))}
        </ul>
        <Link href="/planning/party" className="btn btn-ghost mt-5 w-full justify-center">
          Assign helpers
        </Link>
      </aside>
    </section>
  );
}

function PackStage({
  projectId,
  suppliesAdded,
  owner,
  stems,
  qty,
  saveProject,
}: {
  projectId: string | null;
  suppliesAdded: boolean;
  owner: string;
  stems: number;
  qty: number;
  saveProject: () => void;
}) {
  return (
    <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="rounded-3xl border border-line bg-surface p-5 sm:p-7">
        <p className="kicker">Pack and hand off</p>
        <h2 className="mt-2 font-serif text-4xl">The room should not depend on your memory.</h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {[
            ["Flowers", `${stems} stems across ${qty} pieces`],
            ["Owner", owner],
            ["Supplies", suppliesAdded ? "On the shared list" : "Source not chosen"],
            ["Boxes", `${Math.max(2, Math.ceil(qty / 4))} upright boxes suggested`],
          ].map(([label, value]) => (
            <article key={label} className="rounded-2xl bg-paper p-4">
              <p className="text-[10px] uppercase tracking-[0.14em] text-muted">{label}</p>
              <p className="mt-2 font-serif text-xl">{value}</p>
            </article>
          ))}
        </div>
        <div className="mt-6 rounded-2xl border border-dashed border-sage bg-moss-soft p-5">
          <p className="font-serif text-2xl">Suggested labels</p>
          <p className="mt-2 text-sm leading-6 text-muted">
            Guest tables · keep upright · cool room · owner: {owner} · place after linen.
          </p>
        </div>
      </div>
      <aside className="rounded-3xl border border-line bg-moss-soft p-5 sm:p-6">
        <p className="kicker">Handoff readiness</p>
        <ul className="mt-5 space-y-3 text-sm">
          <li className="flex justify-between gap-4"><span>Project</span><span>{projectId ? "Connected" : "Not saved"}</span></li>
          <li className="flex justify-between gap-4"><span>Supplies</span><span>{suppliesAdded ? "Added" : "Open"}</span></li>
          <li className="flex justify-between gap-4"><span>Owner</span><span>{owner}</span></li>
          <li className="flex justify-between gap-4"><span>Box labels</span><span>Drafted</span></li>
        </ul>
        {projectId ? (
          <Link href={`/studio/projects/${projectId}`} className="btn btn-primary mt-6 w-full justify-center">
            Open connected project
          </Link>
        ) : (
          <button type="button" onClick={saveProject} className="btn btn-primary mt-6 w-full justify-center">
            Save to Studio
          </button>
        )}
        <Link href="/studio/inventory" className="btn btn-ghost mt-2 w-full justify-center">
          Open boxes and inventory
        </Link>
      </aside>
    </section>
  );
}

function Metric({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.14em] text-muted">{label}</p>
      <p className="mt-1 font-serif text-2xl capitalize">{value}</p>
      {detail ? <p className="mt-1 text-[11px] text-muted">{detail}</p> : null}
    </div>
  );
}

function FooterMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="shrink-0">
      <dt className="text-[9px] uppercase tracking-[0.14em] text-muted">{label}</dt>
      <dd className="mt-0.5 font-serif text-lg">{value}</dd>
    </div>
  );
}

function prettyDate(value: string) {
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}
