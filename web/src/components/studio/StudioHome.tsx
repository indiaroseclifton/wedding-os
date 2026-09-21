"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { StudioKind, StudioProject } from "@/lib/studio-project";
import { projectCost, hoursLeft } from "@/lib/studio-project";
import {
  KIND_LABELS,
  money,
  projectReadiness,
  dueDate,
} from "@/lib/studio/design";
import { studioRequest } from "./StudioUI";
const starters: {
  kind: StudioKind;
  name: string;
  line: string;
  image: string;
}[] = [
  {
    kind: "floral",
    name: "Flowers, your way",
    line: "Shape an arrangement. Scale every stem.",
    image: "/brand/vision/linen-day.jpg",
  },
  {
    kind: "table",
    name: "Set the whole table",
    line: "See the layers, spacing and guest-eye view.",
    image: "/brand/vision/backyard.jpg",
  },
  {
    kind: "decor",
    name: "Make an entrance",
    line: "Measure your backdrop, draping and signs.",
    image: "/brand/vision/aisle-trees.jpg",
  },
  {
    kind: "print",
    name: "Paper that belongs",
    line: "Professional designs, matched to your day.",
    image: "/brand/vision/paper-suite.jpg",
  },
  {
    kind: "cricut",
    name: "Signs & cut files",
    line: "Preview real artwork at its finished size.",
    image: "/brand/vision/paper-suite.jpg",
  },
  {
    kind: "lighting",
    name: "The evening atmosphere",
    line: "Plan candles, lanterns and layers of light.",
    image: "/brand/vision/candle-dusk.jpg",
  },
  {
    kind: "favors",
    name: "Something to take home",
    line: "Plan a batch and every last ribbon.",
    image: "/brand/rooms/guests.jpg",
  },
];
export function StudioHome({
  projects,
  weddingDate = "",
  kind,
}: {
  projects: StudioProject[];
  weddingDate?: string;
  kind?: StudioKind;
}) {
  const router = useRouter(),
    [busy, setBusy] = useState(""),
    [error, setError] = useState(""),
    [search, setSearch] = useState("");
  const filtered = projects.filter(
    (p) =>
      (!kind ||
        p.kind === kind ||
        (kind === "decor" && p.kind === "lighting")) &&
      p.title.toLowerCase().includes(search.toLowerCase()),
  );
  async function create(k: StudioKind) {
    setBusy(k);
    try {
      const { project } = await studioRequest({ action: "create", kind: k });
      router.push(`/studio/projects/${project.id}`);
    } catch (e) {
      setError((e as Error).message);
      setBusy("");
    }
  }
  const upcoming = projects
    .flatMap((p) =>
      p.steps
        .filter((s) => !s.done)
        .map((s) => ({ p, s, date: dueDate(s, weddingDate) })),
    )
    .sort((a, b) => (a.date || "9999").localeCompare(b.date || "9999"))
    .slice(0, 4);
  return (
    <div className="studio-home">
      <header className="st-page-heading">
        <div>
          <p className="st-eyebrow">Vowfolk Studio · made for DIY weddings</p>
          <h1>
            {kind ? KIND_LABELS[kind] : "This is where your day takes shape."}
          </h1>
          <p>
            {kind
              ? starters.find((s) => s.kind === kind)?.line
              : "Design it, make it, get it into the room. One connected workspace for everything you’re creating."}
          </p>
        </div>
        <Link href="/studio/make" className="st-button st-primary">
          Start from a photo ↗
        </Link>
      </header>
      {error && (
        <p className="st-error" role="alert">
          {error}
        </p>
      )}
      <section
        className={`studio-starters ${kind ? "is-category" : ""}`}
        aria-label="Start a project"
      >
        {(kind
          ? starters.filter(
              (s) =>
                s.kind === kind || (kind === "decor" && s.kind === "lighting"),
            )
          : starters.slice(0, 4)
        ).map((s) => (
          <button
            className="studio-starter"
            key={s.kind}
            disabled={!!busy}
            onClick={() =>
              s.kind === "print"
                ? router.push("/studio/cards")
                : void create(s.kind)
            }
          >
            <img src={s.image} alt="" />
            <span className="studio-starter-copy">
              <span>{busy === s.kind ? "Creating…" : s.name}</span>
              <small>{s.line}</small>
            </span>
            <span className="studio-starter-arrow">↗</span>
          </button>
        ))}
      </section>
      <div className="studio-home-body">
        <section>
          <div className="st-section-heading">
            <h2>On your workbench</h2>
            <label className="st-search">
              <span className="sr-only">Search projects</span>
              <input
                type="search"
                placeholder="Find a project…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
          </div>
          {filtered.length ? (
            <div className="studio-project-list">
              {filtered.map((p) => {
                const r = projectReadiness(p),
                  photo = p.design?.references.find(
                    (r) => r.imageUrl,
                  )?.imageUrl;
                return (
                  <Link
                    className="studio-project-row"
                    key={p.id}
                    href={`/studio/projects/${p.id}`}
                  >
                    <div className="studio-project-image">
                      {photo ? (
                        <img src={photo} alt="" />
                      ) : (
                        <span>{KIND_LABELS[p.kind][0]}</span>
                      )}
                    </div>
                    <div>
                      <span className="st-eyebrow">{KIND_LABELS[p.kind]}</span>
                      <h3>{p.title}</h3>
                      <p>
                        {p.qty} to make · {money(projectCost(p))} materials
                        estimate
                      </p>
                    </div>
                    <div className="studio-project-state">
                      <span>
                        {p.design?.approval.status === "approved"
                          ? "Design approved"
                          : "In progress"}
                      </span>
                      <progress
                        value={r.percent}
                        max={100}
                        aria-label={`${p.title} readiness`}
                      />
                      <small>
                        {r.checks.filter(Boolean).length} of 4 readiness checks
                      </small>
                    </div>
                    <span>↗</span>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="st-empty">
              <h3>
                {search
                  ? "No matching projects"
                  : "Your first handmade detail starts here."}
              </h3>
              <p>
                Choose a starting point above. You can change every material,
                measurement and quantity.
              </p>
            </div>
          )}
        </section>
        <aside className="studio-next">
          <p className="st-eyebrow">From idea to ready</p>
          <h2>The next few steps</h2>
          {upcoming.length ? (
            upcoming.map(({ p, s, date }) => (
              <Link
                key={p.id + s.id}
                href={`/studio/projects/${p.id}?stage=build`}
              >
                <time>{date || "Set wedding date"}</time>
                <strong>{s.what}</strong>
                <small>
                  {p.title} · {s.assignee || "Assign a helper"}
                </small>
              </Link>
            ))
          ) : (
            <p>Your dated build tasks will collect here as you start making.</p>
          )}
          <dl>
            <div>
              <dt>Planned materials</dt>
              <dd>{money(projects.reduce((n, p) => n + projectCost(p), 0))}</dd>
            </div>
            <div>
              <dt>Hours remaining</dt>
              <dd>
                {projects.reduce((n, p) => n + hoursLeft(p), 0).toFixed(1)}
              </dd>
            </div>
          </dl>
          <Link className="st-text-link" href="/diy/calendar">
            Open build calendar →
          </Link>
        </aside>
      </div>
      <div className="studio-home-note">
        <p>
          <strong>Your design becomes the instructions.</strong> A changed count
          updates the recipe. Orders stay attached. Helpers get the approved
          plan.
        </p>
        <Link href="/studio/connections">
          Bring your inspiration & design tools ↗
        </Link>
      </div>
    </div>
  );
}
