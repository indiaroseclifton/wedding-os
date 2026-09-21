"use client";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { StudioProject } from "@/lib/studio-project";
import { projectCost, hoursLeft } from "@/lib/studio-project";
import { catalogItem, PALETTES, STUDIO_CATALOG } from "@/lib/studio/catalog";
import {
  buildHoursForDesign,
  defaultDesign,
  designFor,
  designWarnings,
  KIND_LABELS,
  materialsForDesign,
  money,
  newObject,
  uid,
  type SceneObject,
  type StudioDesign,
} from "@/lib/studio/design";
import {
  Field,
  FileButton,
  NumberField,
  saveBody,
  studioRequest,
  uploadStudioFile,
} from "./StudioUI";
import { MeasuredPlan } from "./MeasuredPlan";
import type { SceneView } from "./ScenePreview";
import {
  SupplyPanel,
  BuildPanel,
  PackPanel,
  ReviewPanel,
  ReferencePanel,
} from "./WorkspacePanels";
import { ArtworkPanel } from "./ArtworkPanel";
import { StudioAssistant } from "./StudioAssistant";
const ScenePreview = dynamic(
  () => import("./ScenePreview").then((m) => m.ScenePreview),
  {
    ssr: false,
    loading: () => (
      <div className="studio-render-loading" role="status">
        Preparing your 3D workspace…
      </div>
    ),
  },
);
const stages = [
  ["design", "Design"],
  ["recipe", "Recipe & quantities"],
  ["source", "Source"],
  ["build", "Build"],
  ["pack", "Pack & setup"],
  ["review", "Review"],
];
export function StudioWorkspace({
  initial,
  weddingDate = "",
  user = "You",
  ai = false,
  initialStage = "design",
}: {
  initial: StudioProject;
  weddingDate?: string;
  user?: string;
  ai?: boolean;
  initialStage?: string;
}) {
  const router = useRouter(),
    [p, setP] = useState<StudioProject>(() => ({
      ...initial,
      design: designFor(initial),
    })),
    [stage, setStage] = useState(initialStage),
    [view, setView] = useState<SceneView | "plan">("perspective"),
    [selected, setSelected] = useState(""),
    [search, setSearch] = useState(""),
    [category, setCategory] = useState("All"),
    [busy, setBusy] = useState(false),
    [dirty, setDirty] = useState(false),
    [message, setMessage] = useState(""),
    [error, setError] = useState(""),
    [inspector, setInspector] = useState<"object" | "scene" | "look">("object"),
    [assistant, setAssistant] = useState(false),
    [past, setPast] = useState<StudioDesign[]>([]),
    [future, setFuture] = useState<StudioDesign[]>([]),
    [pendingHref, setPendingHref] = useState("");
  const capture = useRef<(() => string) | null>(null),
    edits = useRef(0),
    d = p.design!,
    object = d.objects.find((o) => o.id === selected),
    warnings = designWarnings(d, p.qty);
  const unavailable = useCallback(() => {
    capture.current = null;
    setView("plan");
    setMessage("3D is unavailable on this device; use the measured plan.");
  }, []);
  const ready = useCallback((fn: () => string) => {
    capture.current = fn;
  }, []);
  useEffect(() => {
    const before = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    const click = (e: MouseEvent) => {
      if (!dirty || e.ctrlKey || e.metaKey || e.shiftKey) return;
      const a = (e.target as Element).closest?.("a");
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, window.location.href);
      if (
        url.origin !== window.location.origin ||
        url.href === window.location.href ||
        a.getAttribute("href")?.startsWith("#")
      )
        return;
      e.preventDefault();
      e.stopPropagation();
      setPendingHref(url.pathname + url.search);
    };
    window.addEventListener("beforeunload", before);
    document.addEventListener("click", click, true);
    return () => {
      window.removeEventListener("beforeunload", before);
      document.removeEventListener("click", click, true);
    };
  }, [dirty]);
  function change(next: StudioProject) {
    edits.current++;
    setP(next);
    setDirty(true);
    setMessage("");
  }
  function changeDesign(next: StudioDesign, history = true) {
    if (history) {
      setPast((v) => [...v, d].slice(-30));
      setFuture([]);
    }
    const visual =
      JSON.stringify(next.objects) !== JSON.stringify(d.objects) ||
      JSON.stringify(next.surface) !== JSON.stringify(d.surface) ||
      JSON.stringify(next.artwork) !== JSON.stringify(d.artwork);
    if (visual && next.approval.status === "approved")
      next = { ...next, approval: { status: "review", by: "", at: "" } };
    change({
      ...p,
      design: next,
      materials: materialsForDesign(next, p.qty, p.materials),
      steps: buildHoursForDesign(p.steps, next, p.qty),
    });
  }
  function move(id: string, x: number, z: number) {
    const o = d.objects.find((o) => o.id === id);
    if (!o || o.locked) return;
    changeDesign({
      ...d,
      objects: d.objects.map((item) =>
        item.id === id
          ? { ...item, x, z }
          : item.parentId === id
            ? { ...item, x: item.x + x - o.x, z: item.z + z - o.z }
            : item,
      ),
    });
  }
  function update(patch: Partial<SceneObject>) {
    if (!object) return;
    const dx = (patch.x ?? object.x) - object.x,
      dz = (patch.z ?? object.z) - object.z;
    changeDesign({
      ...d,
      objects: d.objects.map((o) =>
        o.id === object.id
          ? { ...o, ...patch }
          : o.parentId === object.id
            ? { ...o, x: o.x + dx, z: o.z + dz }
            : o,
      ),
    });
  }
  function add(id: string) {
    if (d.objects.length >= 250) return;
    const c = catalogItem(id),
      v =
        object?.kind === "vessel"
          ? object
          : d.objects.find((o) => o.kind === "vessel"),
      flower = c?.kind === "flower" || c?.kind === "foliage";
    const o = newObject(
      id,
      flower && v ? { parentId: v.id, x: v.x, z: v.z, y: v.height * 0.75 } : {},
    );
    changeDesign({ ...d, objects: [...d.objects, o] });
    setSelected(o.id);
    setInspector("object");
  }
  async function save(checkpoint?: string) {
    setBusy(true);
    setError("");
    const at = edits.current;
    try {
      const result = await studioRequest(saveBody(p, d, checkpoint));
      if (at === edits.current) {
        setP(result.project);
        setDirty(false);
        setMessage("Saved to Studio");
      } else {
        setP((current) => ({
          ...current,
          version: result.project.version,
          revisions: result.project.revisions,
        }));
        setMessage("Earlier changes saved; newer edits still need saving.");
      }
      return result.project;
    } catch (e) {
      setError((e as Error).message);
      return undefined;
    } finally {
      setBusy(false);
    }
  }
  function quantity(qty: number) {
    change({
      ...p,
      qty,
      design: {
        ...d,
        approval:
          d.approval.status === "approved"
            ? { status: "review", by: "", at: "" }
            : d.approval,
      },
      materials: materialsForDesign(
        d,
        qty,
        p.materials.map((m) => ({ ...m, perUnit: m.perUnit ?? m.qty / p.qty })),
      ),
      steps: buildHoursForDesign(p.steps, d, qty),
    });
  }
  function undo() {
    const prev = past.at(-1);
    if (prev) {
      setFuture((v) => [d, ...v]);
      setPast((v) => v.slice(0, -1));
      changeDesign(prev, false);
    }
  }
  function redo() {
    const next = future[0];
    if (next) {
      setPast((v) => [...v, d]);
      setFuture((v) => v.slice(1));
      changeDesign(next, false);
    }
  }
  async function duplicate() {
    if (!(await save())) return;
    setBusy(true);
    try {
      const { project } = await studioRequest({
        action: "duplicate",
        id: p.id,
      });
      router.push(`/studio/projects/${project.id}`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  function exportImage() {
    try {
      if (!capture.current || view === "plan")
        throw new Error("Switch to a 3D view before exporting.");
      const a = document.createElement("a");
      a.href = capture.current();
      a.download = p.title.replace(/[^a-z0-9]/gi, "-") + "-mockup.png";
      a.click();
    } catch (e) {
      setError((e as Error).message);
    }
  }
  function arrangeSettings() {
    const keep = d.objects.filter(
      (o) =>
        !["plate", "glass", "napkin"].includes(o.kind) &&
        o.catalogId !== "place-card",
    );
    for (let i = 0; i < d.surface.seats; i++) {
      const half = Math.ceil(d.surface.seats / 2),
        row = i < half ? 0 : 1,
        col = i % half;
      const a =
          d.surface.shape === "rectangle"
            ? row
              ? 0
              : Math.PI
            : (i / Math.max(1, d.surface.seats)) * Math.PI * 2,
        x =
          d.surface.shape === "rectangle"
            ? ((col - (half - 1) / 2) * d.surface.width) / half
            : Math.sin(a) * d.surface.width * 0.36,
        z =
          d.surface.shape === "rectangle"
            ? (row ? 1 : -1) * (d.surface.depth / 2 - 23)
            : Math.cos(a) * d.surface.depth * 0.36;
      keep.push(
        newObject("dinner-plate", { x, z }),
        newObject("linen-napkin", {
          x,
          z,
          y: 2,
          rotation: (-a * 180) / Math.PI,
        }),
        newObject("goblet", {
          x: x * 0.8 + Math.cos(a) * 13,
          z: z * 0.8 - Math.sin(a) * 13,
        }),
        newObject("place-card", {
          x: x * 0.68,
          z: z * 0.68,
          y: 0.3,
          rotation: (-a * 180) / Math.PI,
        }),
      );
    }
    changeDesign({ ...d, objects: keep });
  }
  const panel = {
    project: p,
    onChange: change,
    onDesign: changeDesign,
    weddingDate,
    user,
  };
  return (
    <div className="studio-workspace">
      <h1 className="sr-only">{p.title}</h1>
      <header className="st-project-header">
        <div>
          <Link className="st-breadcrumb" href="/studio">
            Studio / {KIND_LABELS[p.kind]}
          </Link>
          <input
            className="st-title-input"
            aria-label="Project name"
            value={p.title}
            maxLength={150}
            onChange={(e) => change({ ...p, title: e.target.value })}
          />
          <p>
            {p.kind === "floral"
              ? "Every stem has a place. Every place has a plan."
              : "One design. Every detail needed to make it happen."}
          </p>
        </div>
        <div className="studio-actions">
          <span className="st-save-state" role="status">
            {dirty ? "Unsaved changes" : message || "All changes saved"}
          </span>
          <button
            className="st-button"
            onClick={() => setAssistant(!assistant)}
            aria-expanded={assistant}
          >
            ✧ Studio assistant
          </button>
          <button
            className="st-button st-primary"
            disabled={busy}
            onClick={() => void save()}
          >
            {busy ? "Saving…" : "Save project"}
          </button>
        </div>
      </header>
      {error && (
        <div className="st-error" role="alert">
          {error}
          {error.includes("another window") && (
            <button
              className="st-button"
              onClick={() => window.location.reload()}
            >
              Reload saved project
            </button>
          )}
        </div>
      )}
      {pendingHref && (
        <div className="st-notice" role="alert">
          <strong>Save your changes before leaving?</strong>
          <div className="studio-actions">
            <button
              className="st-button st-primary"
              disabled={busy}
              onClick={() =>
                void save().then((saved) => {
                  if (saved) router.push(pendingHref);
                })
              }
            >
              Save & continue
            </button>
            <button
              className="st-button"
              onClick={() => {
                setDirty(false);
                router.push(pendingHref);
              }}
            >
              Discard edits & continue
            </button>
            <button className="st-button" onClick={() => setPendingHref("")}>
              Stay here
            </button>
          </div>
        </div>
      )}
      <nav className="st-stage-rail" aria-label="Project stages">
        {stages.map(([key, label], i) => (
          <button
            key={key}
            className={stage === key ? "is-active" : ""}
            aria-current={stage === key ? "step" : undefined}
            onClick={() => setStage(key)}
          >
            <span>{i + 1}</span>
            {label}
          </button>
        ))}
      </nav>
      {assistant && (
        <StudioAssistant
          project={p}
          enabled={ai}
          onDesign={changeDesign}
          onClose={() => setAssistant(false)}
          capture={() => capture.current?.() || ""}
        />
      )}
      {stage === "design" ? (
        <>
          <div className="studio-workbench">
            <aside className="studio-library">
              <div className="st-panel-heading">
                <h2>Materials</h2>
                <small>{d.objects.length}/250 objects</small>
              </div>
              <label className="st-search">
                <span className="sr-only">Search materials</span>
                <input
                  type="search"
                  placeholder="Rose, linen, candle…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </label>
              <Field label="Category">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {[
                    "All",
                    ...new Set(STUDIO_CATALOG.map((c) => c.category)),
                  ].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </Field>
              <div className="studio-catalog-items">
                {STUDIO_CATALOG.filter(
                  (c) =>
                    (category === "All" || c.category === category) &&
                    (c.name + " " + c.material)
                      .toLowerCase()
                      .includes(search.toLowerCase()),
                ).map((c) => (
                  <button
                    className="studio-catalog-item"
                    key={c.id}
                    disabled={d.objects.length >= 250}
                    onClick={() => add(c.id)}
                  >
                    <span
                      className={`studio-material-swatch is-${c.kind}`}
                      style={{ "--swatch": c.color } as React.CSSProperties}
                    />
                    <span>
                      <strong>{c.name}</strong>
                      <small>
                        {c.width} × {c.height} cm · {money(c.estimate)}/{c.unit}
                      </small>
                    </span>
                    <span>+</span>
                  </button>
                ))}
              </div>
              <p className="st-help">
                Editable planning dimensions and prices. Confirm the product you
                buy with your supplier.
              </p>
            </aside>
            <section className="studio-visual">
              <div className="studio-viewbar">
                <div className="st-view-switch">
                  {(
                    [
                      ["perspective", "3D"],
                      ["plan", "Measured plan"],
                      ["eye", "Guest view"],
                      ["room", "Whole room"],
                      ["photo", "Venue photo"],
                    ] as const
                  ).map(([id, label]) => (
                    <button
                      key={id}
                      className={view === id ? "is-active" : ""}
                      aria-pressed={view === id}
                      onClick={() => setView(id)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div className="studio-actions">
                  <button
                    className="st-icon-button"
                    onClick={undo}
                    disabled={!past.length}
                    aria-label="Undo design edit"
                  >
                    ↶
                  </button>
                  <button
                    className="st-icon-button"
                    onClick={redo}
                    disabled={!future.length}
                    aria-label="Redo design edit"
                  >
                    ↷
                  </button>
                  <button
                    className="st-button"
                    onClick={exportImage}
                    disabled={view === "plan"}
                  >
                    Export image
                  </button>
                </div>
              </div>
              {view === "plan" ? (
                <MeasuredPlan
                  design={d}
                  selected={selected}
                  onSelect={setSelected}
                  onMove={move}
                />
              ) : (
                <ScenePreview
                  design={d}
                  view={view}
                  quantity={p.qty}
                  selected={selected}
                  onSelect={setSelected}
                  onExportReady={ready}
                  onUnavailable={unavailable}
                />
              )}
              {view === "photo" && !d.room.photo && (
                <div className="studio-photo-prompt">
                  <p>Place the design against a photo of your venue.</p>
                  <FileButton
                    accept="image/png,image/jpeg,image/webp"
                    onFile={async (f) => {
                      try {
                        const file = await uploadStudioFile(f);
                        changeDesign({
                          ...d,
                          room: { ...d.room, photo: file.url },
                        });
                        setInspector("scene");
                      } catch (e) {
                        setError((e as Error).message);
                      }
                    }}
                  >
                    Upload venue photo
                  </FileButton>
                </div>
              )}
              <div className="studio-canvas-foot">
                <span>
                  {d.surface.shape === "none"
                    ? "Floor arrangement"
                    : `${d.surface.width} × ${d.surface.depth} cm · ${d.surface.seats} seats`}
                </span>
                <button
                  className="st-text-link"
                  onClick={() =>
                    changeDesign({
                      ...d,
                      lighting:
                        d.lighting === "daylight" ? "evening" : "daylight",
                    })
                  }
                >
                  {d.lighting === "daylight" ? "Daylight ☀" : "Evening ◐"}
                </button>
                <span>Dimension-based preview</span>
              </div>
              <div
                className="studio-object-strip"
                aria-label="Objects in this design"
              >
                {d.objects.map((o) => (
                  <button
                    key={o.id}
                    aria-pressed={selected === o.id}
                    className={selected === o.id ? "is-active" : ""}
                    onClick={() => {
                      setSelected(o.id);
                      setInspector("object");
                    }}
                  >
                    <i style={{ background: o.color }} />
                    {o.name}
                    {o.count > 1 ? ` × ${o.count}` : ""}
                    {o.locked ? " · locked" : ""}
                  </button>
                ))}
              </div>
              {!initial.design && (
                <p className="st-notice">
                  This older project keeps its existing materials.{" "}
                  <button
                    className="st-text-link"
                    onClick={() =>
                      changeDesign({
                        ...defaultDesign(p.kind),
                        references: d.references,
                      })
                    }
                  >
                    Add a visual starting point
                  </button>
                </p>
              )}
            </section>
            <aside className="studio-inspector">
              <div className="st-inspector-tabs">
                {(["object", "scene", "look"] as const).map((t) => (
                  <button
                    key={t}
                    className={inspector === t ? "is-active" : ""}
                    onClick={() => setInspector(t)}
                  >
                    {t === "object"
                      ? "Selected"
                      : t === "scene"
                        ? "Setting"
                        : "Reference"}
                  </button>
                ))}
              </div>
              {inspector === "look" ? (
                <ReferencePanel {...panel} />
              ) : inspector === "object" ? (
                object ? (
                  <div className="st-inspector-content">
                    <p className="st-eyebrow">{object.kind}</p>
                    <h2>{object.name}</h2>
                    <p className="st-help">
                      {catalogItem(object.catalogId)?.note}
                    </p>
                    <Field label="Name">
                      <input
                        value={object.name}
                        onChange={(e) => update({ name: e.target.value })}
                      />
                    </Field>
                    <div className="st-field-grid">
                      <NumberField
                        label="Width · cm"
                        value={object.width}
                        min={0.1}
                        max={1000}
                        step={0.1}
                        onChange={(width) => update({ width })}
                      />
                      <NumberField
                        label="Depth · cm"
                        value={object.depth}
                        min={0.01}
                        max={1000}
                        step={0.1}
                        onChange={(depth) => update({ depth })}
                      />
                      <NumberField
                        label="Height · cm"
                        value={object.height}
                        min={0.01}
                        max={1000}
                        step={0.1}
                        onChange={(height) => update({ height })}
                      />
                      <NumberField
                        label={
                          object.kind === "flower" || object.kind === "foliage"
                            ? "Stems in group"
                            : "Pieces in spaced group"
                        }
                        value={object.count}
                        min={1}
                        max={100}
                        onChange={(n) => update({ count: Math.round(n) })}
                      />
                      <NumberField
                        label="Across · cm"
                        value={object.x}
                        min={-3000}
                        max={3000}
                        onChange={(x) => update({ x })}
                      />
                      <NumberField
                        label="Back · cm"
                        value={object.z}
                        min={-3000}
                        max={3000}
                        onChange={(z) => update({ z })}
                      />
                      <NumberField
                        label="Lift · cm"
                        value={object.y}
                        max={1000}
                        onChange={(y) => update({ y })}
                      />
                      <NumberField
                        label="Rotate · degrees"
                        value={object.rotation}
                        min={-360}
                        max={360}
                        onChange={(rotation) => update({ rotation })}
                      />
                    </div>
                    <Field label="Color">
                      <input
                        type="color"
                        value={object.color}
                        onChange={(e) => update({ color: e.target.value })}
                      />
                    </Field>
                    {(object.kind === "flower" ||
                      object.kind === "foliage") && (
                      <>
                        <Field label="Attached vessel">
                          <select
                            value={object.parentId || ""}
                            onChange={(e) => {
                              const v = d.objects.find(
                                (o) => o.id === e.target.value,
                              );
                              update({
                                parentId: v?.id,
                                ...(v
                                  ? { x: v.x, z: v.z, y: v.height * 0.75 }
                                  : {}),
                              });
                            }}
                          >
                            <option value="">Freestanding</option>
                            {d.objects
                              .filter((o) => o.kind === "vessel")
                              .map((o) => (
                                <option key={o.id} value={o.id}>
                                  {o.name}
                                </option>
                              ))}
                          </select>
                        </Field>
                        <Field label="Try a substitution">
                          <select
                            value={object.catalogId}
                            onChange={(e) =>
                              update({
                                ...newObject(e.target.value),
                                id: object.id,
                                x: object.x,
                                z: object.z,
                                y: object.y,
                                count: object.count,
                                parentId: object.parentId,
                              })
                            }
                          >
                            {STUDIO_CATALOG.filter(
                              (c) => c.kind === object.kind,
                            ).map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name} · {c.material}
                              </option>
                            ))}
                          </select>
                        </Field>
                        <p className="st-help">
                          Confirm seasonal availability with a local grower.
                        </p>
                      </>
                    )}
                    {(object.kind === "paper" || object.kind === "sign") && (
                      <Field label="Professional artwork">
                        <select
                          value={object.imageUrl || ""}
                          onChange={(e) =>
                            update({ imageUrl: e.target.value || undefined })
                          }
                        >
                          <option value="">No artwork selected</option>
                          {d.artwork
                            .filter((a) => a.previewUrl)
                            .map((a) => (
                              <option key={a.id} value={a.previewUrl}>
                                {a.name}
                              </option>
                            ))}
                        </select>
                        <small>
                          Attach a PNG or Canva export in Recipe & quantities.
                        </small>
                      </Field>
                    )}
                    <label className="st-check">
                      <input
                        type="checkbox"
                        checked={object.locked}
                        onChange={(e) => update({ locked: e.target.checked })}
                      />
                      Lock position
                    </label>
                    <div className="studio-actions">
                      <button
                        className="st-button"
                        onClick={() => {
                          const next = {
                            ...object,
                            id: uid(),
                            x: object.x + 12,
                            z: object.z + 12,
                            locked: false,
                          };
                          changeDesign({ ...d, objects: [...d.objects, next] });
                          setSelected(next.id);
                        }}
                      >
                        Duplicate
                      </button>
                      <button
                        className="st-button st-danger"
                        onClick={() => {
                          changeDesign({
                            ...d,
                            objects: d.objects
                              .filter((o) => o.id !== object.id)
                              .map((o) =>
                                o.parentId === object.id
                                  ? { ...o, parentId: undefined }
                                  : o,
                              ),
                          });
                          setSelected("");
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="st-inspector-content">
                    <h2>Make it yours.</h2>
                    <p>
                      Select an object in the canvas or the strip below it. Add
                      materials from the library.
                    </p>
                    <button
                      className="st-button"
                      onClick={() => setInspector("scene")}
                    >
                      Adjust the setting
                    </button>
                  </div>
                )
              ) : (
                <div className="st-inspector-content">
                  <h2>The setting</h2>
                  <Field label="Surface">
                    <select
                      value={d.surface.shape}
                      onChange={(e) =>
                        changeDesign({
                          ...d,
                          surface: {
                            ...d.surface,
                            shape: e.target
                              .value as StudioDesign["surface"]["shape"],
                          },
                        })
                      }
                    >
                      <option value="round">Round table</option>
                      <option value="rectangle">Rectangle table</option>
                      <option value="none">Floor / freestanding</option>
                    </select>
                  </Field>
                  <div className="st-field-grid">
                    <NumberField
                      label="Table width · cm"
                      value={d.surface.width}
                      min={30}
                      max={1000}
                      onChange={(width) =>
                        changeDesign({
                          ...d,
                          surface: {
                            ...d.surface,
                            width,
                            depth:
                              d.surface.shape === "round"
                                ? width
                                : d.surface.depth,
                          },
                        })
                      }
                    />
                    <NumberField
                      label="Table depth · cm"
                      value={d.surface.depth}
                      min={30}
                      max={1000}
                      onChange={(depth) =>
                        changeDesign({
                          ...d,
                          surface: {
                            ...d.surface,
                            depth,
                            width:
                              d.surface.shape === "round"
                                ? depth
                                : d.surface.width,
                          },
                        })
                      }
                    />
                    <NumberField
                      label="Table height · cm"
                      value={d.surface.height}
                      max={200}
                      onChange={(height) =>
                        changeDesign({
                          ...d,
                          surface: { ...d.surface, height },
                        })
                      }
                    />
                    <NumberField
                      label="Seats"
                      value={d.surface.seats}
                      max={40}
                      onChange={(seats) =>
                        changeDesign({
                          ...d,
                          surface: { ...d.surface, seats: Math.round(seats) },
                        })
                      }
                    />
                    <NumberField
                      label="Linen drop · cm"
                      value={d.surface.linenDrop}
                      max={150}
                      onChange={(linenDrop) =>
                        changeDesign({
                          ...d,
                          surface: { ...d.surface, linenDrop },
                        })
                      }
                    />
                    <Field label="Linen color">
                      <input
                        type="color"
                        value={d.surface.linen}
                        onChange={(e) =>
                          changeDesign({
                            ...d,
                            surface: { ...d.surface, linen: e.target.value },
                          })
                        }
                      />
                    </Field>
                  </div>
                  <button className="st-button" onClick={arrangeSettings}>
                    Arrange place settings for {d.surface.seats} guests
                  </button>
                  <label className="st-check">
                    <input
                      type="checkbox"
                      checked={!!d.surface.runner}
                      onChange={(e) =>
                        changeDesign({
                          ...d,
                          surface: {
                            ...d.surface,
                            runner: e.target.checked ? "#a8b29a" : "",
                          },
                        })
                      }
                    />
                    Include table runner
                  </label>
                  {d.surface.runner && (
                    <Field label="Runner color">
                      <input
                        type="color"
                        value={d.surface.runner}
                        onChange={(e) =>
                          changeDesign({
                            ...d,
                            surface: { ...d.surface, runner: e.target.value },
                          })
                        }
                      />
                    </Field>
                  )}
                  <p className="st-help">
                    Linen size: {d.surface.width + 2 * d.surface.linenDrop} ×{" "}
                    {d.surface.depth + 2 * d.surface.linenDrop} cm. Confirm the
                    product size.
                  </p>
                  <h3>Palette studies</h3>
                  <div className="st-palettes">
                    {PALETTES.map((palette) => (
                      <button
                        key={palette.name}
                        onClick={() =>
                          changeDesign({
                            ...d,
                            surface: {
                              ...d.surface,
                              linen: palette.colors[0],
                              runner: d.surface.runner ? palette.colors[3] : "",
                            },
                            objects: d.objects.map((o) =>
                              ["flower", "paper", "napkin"].includes(o.kind)
                                ? {
                                    ...o,
                                    color:
                                      palette.colors[
                                        o.kind === "flower" ? 1 : 2
                                      ],
                                  }
                                : o,
                            ),
                          })
                        }
                      >
                        <span>
                          {palette.colors.map((c) => (
                            <i key={c} style={{ background: c }} />
                          ))}
                        </span>
                        {palette.name}
                      </button>
                    ))}
                  </div>
                  <h3>Room & photo</h3>
                  <div className="st-field-grid">
                    <NumberField
                      label="Room width · cm"
                      value={d.room.width}
                      min={100}
                      max={10000}
                      onChange={(width) =>
                        changeDesign({ ...d, room: { ...d.room, width } })
                      }
                    />
                    <NumberField
                      label="Room depth · cm"
                      value={d.room.depth}
                      min={100}
                      max={10000}
                      onChange={(depth) =>
                        changeDesign({ ...d, room: { ...d.room, depth } })
                      }
                    />
                  </div>
                  <FileButton
                    accept="image/png,image/jpeg,image/webp"
                    onFile={async (f) => {
                      try {
                        const file = await uploadStudioFile(f);
                        changeDesign({
                          ...d,
                          room: { ...d.room, photo: file.url },
                        });
                        setView("photo");
                      } catch (e) {
                        setError((e as Error).message);
                      }
                    }}
                  >
                    Choose venue photo
                  </FileButton>
                  {d.room.photo && (
                    <>
                      <NumberField
                        label="Photo zoom · %"
                        value={d.room.photoScale}
                        min={10}
                        max={300}
                        onChange={(photoScale) =>
                          changeDesign({
                            ...d,
                            room: { ...d.room, photoScale },
                          })
                        }
                      />
                      <NumberField
                        label="Photo across · %"
                        value={d.room.photoX}
                        max={100}
                        onChange={(photoX) =>
                          changeDesign({ ...d, room: { ...d.room, photoX } })
                        }
                      />
                      <NumberField
                        label="Photo down · %"
                        value={d.room.photoY}
                        max={100}
                        onChange={(photoY) =>
                          changeDesign({ ...d, room: { ...d.room, photoY } })
                        }
                      />
                      <button
                        className="st-text-link"
                        onClick={() =>
                          changeDesign({ ...d, room: { ...d.room, photo: "" } })
                        }
                      >
                        Remove venue photo
                      </button>
                    </>
                  )}
                </div>
              )}
            </aside>
          </div>
          {warnings.length > 0 && (
            <details className="st-checks">
              <summary>{warnings.length} design checks to confirm</summary>
              <ul>
                {warnings.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            </details>
          )}
        </>
      ) : stage === "recipe" ? (
        <div className="st-stage-page">
          <div className="st-stage-intro">
            <div>
              <p className="st-eyebrow">Make one. Then make enough.</p>
              <h2>
                The recipe for {p.qty} {p.qty === 1 ? "piece" : "pieces"}.
              </h2>
              <p>
                The visual objects determine the materials. Allow room for
                spares.
              </p>
            </div>
            <div className="st-field-grid">
              <NumberField
                label="Number to make"
                value={p.qty}
                min={1}
                max={10000}
                onChange={(n) => quantity(Math.round(n))}
              />
              <NumberField
                label="Contingency · %"
                value={Math.round(d.contingency * 100)}
                max={100}
                onChange={(n) => changeDesign({ ...d, contingency: n / 100 })}
              />
              <NumberField
                label="Project budget · $"
                value={p.budget}
                onChange={(budget) => change({ ...p, budget })}
              />
            </div>
          </div>
          <SupplyPanel {...panel} recipe />
          {["table", "print", "cricut", "favors"].includes(p.kind) && (
            <ArtworkPanel {...panel} />
          )}
        </div>
      ) : stage === "source" ? (
        <div className="st-stage-page">
          <div className="st-stage-intro">
            <div>
              <p className="st-eyebrow">The real shopping list</p>
              <h2>Source what the design needs.</h2>
              <p>
                Track owned stock, supplier packs, orders and deliveries
                separately.
              </p>
            </div>
            <Link className="st-button" href="/studio/shop">
              All-project supplies ↗
            </Link>
          </div>
          <SupplyPanel {...panel} />
        </div>
      ) : stage === "build" ? (
        <BuildPanel {...panel} />
      ) : stage === "pack" ? (
        <PackPanel {...panel} onSave={save} />
      ) : (
        <ReviewPanel
          {...panel}
          selected={selected}
          onSave={save}
          onDuplicate={duplicate}
        />
      )}
      <footer className="studio-execution">
        <span>
          <strong>{p.qty}</strong> to make
        </span>
        <span>
          <strong>
            {d.objects
              .filter((o) => o.kind === "flower" || o.kind === "foliage")
              .reduce((n, o) => n + o.count, 0)}
          </strong>{" "}
          stems per design
        </span>
        <span>
          <strong>{money(projectCost(p))}</strong> materials estimate
          {p.budget > 0 && projectCost(p) > p.budget && (
            <small className="st-over-budget">
              {money(projectCost(p) - p.budget)} over budget
            </small>
          )}
        </span>
        <span>
          <strong>{hoursLeft(p).toFixed(1)} h</strong> remaining
        </span>
        <span className="st-execution-status">
          {d.approval.status === "approved"
            ? "Approved design"
            : d.approval.status === "review"
              ? "Review needed"
              : "Design in progress"}
        </span>
      </footer>
    </div>
  );
}
