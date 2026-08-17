"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  COLOR_STORIES,
  LOOKS,
  STEMS,
  VESSELS,
  layoutRecipe,
  rollup,
  stemById,
  type PlacedStem,
} from "@/lib/floral-studio";
import { fitLabel, stemFit, weddingMonth, zoneForCity } from "@/lib/floral-season";

type Saved = {
  id: string;
  title: string;
  vessel: string;
  story: string;
  pieces: PlacedStem[];
};

export function FloralStudio() {
  const params = useSearchParams();
  const fromUrl = params.get("story");
  const [story, setStory] = useState(fromUrl && COLOR_STORIES.some((s) => s.id === fromUrl) ? fromUrl : "linen");
  const [vessel, setVessel] = useState("bouquet");
  const [kind, setKind] = useState<"all" | "face" | "filler" | "green" | "dried">("all");
  const [material, setMaterial] = useState<"all" | "fresh" | "silk" | "mix">("all");
  const [pieces, setPieces] = useState<PlacedStem[]>([]);
  const [sel, setSel] = useState<string | null>(null);
  const [tables, setTables] = useState(10);
  const [title, setTitle] = useState("Untitled look");
  const [savedId, setSavedId] = useState<string | null>(null);
  const [saved, setSaved] = useState<Saved[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [tab, setTab] = useState<"compose" | "inspire" | "palette">("compose");
  const [place, setPlace] = useState("Atlanta, GA");
  const [month, setMonth] = useState(10);
  const [inSeasonOnly, setInSeasonOnly] = useState(false);
  const drag = useRef<{ id: string; dx: number; dy: number } | null>(null);
  const board = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/diy")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setSaved(d?.diy?.mockups || []))
      .catch(() => {});
    fetch("/api/workspace")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.meta?.location) setPlace(d.meta.location);
        if (d?.meta?.weddingDate) setMonth(weddingMonth(d.meta.weddingDate));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!sel) return;
      const step = e.shiftKey ? 4 : 1.5;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        patch(sel, { x: Math.max(6, (pieces.find((p) => p.id === sel)?.x || 50) - step) });
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        patch(sel, { x: Math.min(94, (pieces.find((p) => p.id === sel)?.x || 50) + step) });
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        patch(sel, { y: Math.max(8, (pieces.find((p) => p.id === sel)?.y || 42) - step) });
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        patch(sel, { y: Math.min(88, (pieces.find((p) => p.id === sel)?.y || 42) + step) });
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        setPieces((p) => p.filter((x) => x.id !== sel));
        setSel(null);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sel, pieces]);

  const zone = zoneForCity(place);
  const library = STEMS.filter((s) => {
    if (kind !== "all" && s.kind !== kind) return false;
    if (story !== "all" && !s.stories.includes(story)) return false;
    if (material === "fresh" && s.material !== "fresh") return false;
    if (material === "silk" && s.material !== "silk") return false;
    if (inSeasonOnly) {
      const fit = stemFit(s, month);
      if (fit === "out") return false;
    }
    return true;
  });

  const math = useMemo(() => rollup(pieces), [pieces]);
  const blocked = useMemo(() => {
    const names: string[] = [];
    for (const p of pieces) {
      const s = stemById(p.stemId);
      if (s && stemFit(s, month) === "out") names.push(s.name);
    }
    return [...new Set(names)];
  }, [pieces, month]);
  const selected = pieces.find((p) => p.id === sel);
  const vesselMeta = VESSELS.find((v) => v.id === vessel);

  function addStem(stemId: string) {
    const n = pieces.length;
    const piece: PlacedStem = {
      id: `s${Date.now()}${n}`,
      stemId,
      x: 42 + Math.random() * 16,
      y: 36 + Math.random() * 16,
      rot: Math.floor(Math.random() * 50) - 25,
      scale: 0.9 + Math.random() * 0.25,
      z: n + 1,
    };
    setPieces((p) => [...p, piece]);
    setSel(piece.id);
  }

  function patch(id: string, next: Partial<PlacedStem>) {
    setPieces((p) => p.map((x) => (x.id === id ? { ...x, ...next } : x)));
  }

  function onPointerDown(e: React.PointerEvent, id: string) {
    const box = board.current?.getBoundingClientRect();
    if (!box) return;
    const p = pieces.find((x) => x.id === id);
    if (!p) return;
    setSel(id);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = {
      id,
      dx: ((e.clientX - box.left) / box.width) * 100 - p.x,
      dy: ((e.clientY - box.top) / box.height) * 100 - p.y,
    };
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!drag.current || !board.current) return;
    const box = board.current.getBoundingClientRect();
    const x = Math.max(6, Math.min(94, ((e.clientX - box.left) / box.width) * 100 - drag.current.dx));
    const y = Math.max(8, Math.min(88, ((e.clientY - box.top) / box.height) * 100 - drag.current.dy));
    patch(drag.current.id, { x, y });
  }

  function onPointerUp() {
    drag.current = null;
  }

  function applyLook(id: string) {
    const look = LOOKS.find((l) => l.id === id);
    if (!look) return;
    setVessel(look.vessel);
    setStory(look.story);
    setTitle(look.title);
    setPieces(layoutRecipe(look.recipe));
    setSel(null);
    setTab("compose");
  }

  async function persist() {
    const res = await fetch("/api/diy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "save_mockup",
        id: savedId,
        title,
        vessel,
        story,
        pieces,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setSaved(data.diy?.mockups || []);
      const mine = (data.diy?.mockups || []).find((m: Saved) => m.title === title);
      if (mine) setSavedId(mine.id);
      setMsg("Look saved.");
    } else setMsg("Could not save");
  }

  async function toShop() {
    const res = await fetch("/api/diy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "push_floral",
        tables: vessel === "bouquet" || vessel === "bout" ? 1 : tables,
        lines: math.lines.map((l) => ({
          label: l.name,
          qty: l.count,
          estEach: stemById(l.stemId)?.estEach || 0,
        })),
      }),
    });
    setMsg(res.ok ? "On the flowers shopping list." : "Could not add to list");
  }

  return (
    <div className="space-y-5 pb-20">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="kicker kicker-moss">DIY · Floral studio</p>
          <h1 className="mt-1 font-serif text-4xl">Build the arrangement.</h1>
          <p className="mt-1 text-sm text-muted">
            Tap a stem. Drag it. Steal a look. The count becomes a shopping list.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setTab("compose")}
            className={`rounded-full px-3 py-1.5 text-xs ${tab === "compose" ? "bg-moss text-ivory" : "border border-line"}`}
          >
            Canvas
          </button>
          <button
            type="button"
            onClick={() => setTab("inspire")}
            className={`rounded-full px-3 py-1.5 text-xs ${tab === "inspire" ? "bg-moss text-ivory" : "border border-line"}`}
          >
            Inspiration
          </button>
          <button
            type="button"
            onClick={() => setTab("palette")}
            className={`rounded-full px-3 py-1.5 text-xs ${tab === "palette" ? "bg-moss text-ivory" : "border border-line"}`}
          >
            Palettes
          </button>
        </div>
      </div>

      <p className="text-sm text-ink-soft">
        {place} · zone {zone.zone} · month {month} — frost {zone.frost}. Fresh stems follow the season; silk does not.
      </p>

      {tab === "palette" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {COLOR_STORIES.map((s) => {
            const fits = STEMS.filter((st) => st.stories.includes(s.id));
            const on = story === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setStory(s.id);
                  setTab("compose");
                }}
                className={`rounded-2xl border p-5 text-left ${
                  on ? "border-moss bg-moss-soft" : "border-line bg-surface"
                }`}
              >
                <div className="flex overflow-hidden rounded-xl">
                  {s.chips.map((c) => (
                    <span key={c.hex} className="h-16 flex-1" style={{ background: c.hex }} title={c.name} />
                  ))}
                </div>
                <p className="mt-4 font-serif text-2xl">{s.name}</p>
                <p className="mt-1 text-sm text-muted">{s.line}</p>
                <p className="mt-2 text-xs text-ink-soft">{s.when}</p>
                <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted">
                  {s.chips.map((c) => (
                    <li key={c.name}>
                      {c.name}
                      <span className="text-ink-soft"> · {c.role}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 kicker kicker-moss">
                  {fits.length} stems · lock this palette
                </p>
              </button>
            );
          })}
        </div>
      ) : tab === "inspire" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {LOOKS.map((look) => (
            <button
              key={look.id}
              type="button"
              onClick={() => applyLook(look.id)}
              className="overflow-hidden rounded-2xl border border-line bg-surface text-left"
            >
              <img src={look.photo} alt="" className="aspect-[16/10] w-full object-cover" />
              <div className="p-4">
                <p className="font-serif text-2xl">{look.title}</p>
                <p className="mt-1 text-sm text-muted">{look.why}</p>
                <p className="mt-2 kicker kicker-moss">Use this recipe</p>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[13rem_minmax(0,1fr)_16rem]">
          <aside className="space-y-3">
            <div className="flex flex-wrap gap-1">
              {COLOR_STORIES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setStory(s.id)}
                  className={`min-h-11 rounded-full px-2.5 py-1 text-[11px] ${
                    story === s.id ? "bg-moss text-ivory" : "border border-line"
                  }`}
                >
                  <span className="flex overflow-hidden rounded-full">
                    {s.chips.slice(0, 3).map((c) => (
                      <i key={c.hex} className="block h-3 w-3" style={{ background: c.hex }} />
                    ))}
                  </span>
                  {s.name}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-1">
              {(["all", "fresh", "silk", "mix"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMaterial(m)}
                  className={`rounded-full px-2.5 py-1 text-[11px] ${
                    material === m ? "bg-moss text-ivory" : "border border-line"
                  }`}
                >
                  {m === "all" ? "All" : m === "fresh" ? "Real" : m === "silk" ? "Silk" : "Mix"}
                </button>
              ))}
            </div>
            {material === "mix" && (
              <p className="text-[11px] leading-4 text-muted">
                Silk faces + fresh hardy greens is the usual DIY mix. Don’t refrigerate silk with wet stems.
              </p>
            )}
            <div className="flex flex-wrap gap-1">
              {(["all", "face", "filler", "green", "dried"] as const).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setKind(k)}
                  className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide ${
                    kind === k ? "bg-ink text-ivory" : "border border-line text-muted"
                  }`}
                >
                  {k}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setInSeasonOnly((v) => !v)}
                className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide ${
                  inSeasonOnly ? "bg-moss text-ivory" : "border border-line text-muted"
                }`}
              >
                In season
              </button>
            </div>
            <ul className="grid grid-cols-2 gap-2 lg:grid-cols-1">
              {library.map((s) => {
                const fit = stemFit(s, month);
                return (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => addStem(s.id)}
                    className={`flex w-full items-center gap-2 rounded-xl border border-line bg-surface p-2 text-left ${
                      fit === "out" ? "opacity-50" : ""
                    }`}
                  >
                    <img
                      src={s.photo}
                      alt=""
                      className={`h-12 w-12 shrink-0 rounded-full object-cover ${s.tint}`}
                    />
                    <span>
                      <span className="block text-xs font-medium">
                        {s.name}{" "}
                        <span className="font-normal text-muted">{s.material === "silk" ? "silk" : "real"}</span>
                      </span>
                      <span className="block text-[10px] text-muted">
                        ${s.estEach.toFixed(2)} · {fitLabel(fit)}
                      </span>
                    </span>
                  </button>
                </li>
                );
              })}
            </ul>
          </aside>

          <section className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {VESSELS.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setVessel(v.id)}
                  className={`rounded-full px-3 py-1.5 text-xs ${
                    vessel === v.id ? "bg-moss text-ivory" : "border border-line"
                  }`}
                >
                  {v.name}
                </button>
              ))}
            </div>
            <div
              ref={board}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              className="relative aspect-[4/5] overflow-hidden rounded-[1.6rem] border border-line bg-[#efe8d8] sm:aspect-[5/4]"
            >
              <img
                src={vesselMeta?.photo || "/brand/tablescape.jpg"}
                alt=""
                className="absolute inset-0 h-full w-full object-cover opacity-35"
              />
              <div className="pointer-events-none absolute inset-x-[18%] bottom-[8%] top-[22%] rounded-[45%] border border-dashed border-moss/30" />
              {pieces
                .slice()
                .sort((a, b) => a.z - b.z)
                .map((p) => {
                  const stem = stemById(p.stemId);
                  if (!stem) return null;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onPointerDown={(e) => onPointerDown(e, p.id)}
                      aria-label={`Place ${stem.name}`}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-grab touch-none rounded-full shadow-md ${
                        sel === p.id ? "ring-2 ring-moss" : ""
                      }`}
                      style={{
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        width: `${18 * p.scale}%`,
                        zIndex: p.z + 2,
                        transform: `translate(-50%, -50%) rotate(${p.rot}deg)`,
                      }}
                    >
                      <img
                        src={stem.photo}
                        alt={stem.name}
                        draggable={false}
                        className={`aspect-square w-full rounded-full object-cover ${stem.tint}`}
                      />
                    </button>
                  );
                })}
              {!pieces.length && (
                <p className="absolute inset-0 flex items-center justify-center px-8 text-center text-sm text-ink/70">
                  Tap a stem on the left — or steal a look from Inspiration. Select one and use the arrows to move it.
                </p>
              )}
            </div>
            {selected && (
              <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-surface px-3 py-2 text-xs">
                <span className="font-medium">{stemById(selected.stemId)?.name}</span>
                <label className="flex items-center gap-1">
                  Turn
                  <input
                    type="range"
                    min={-180}
                    max={180}
                    aria-label="Rotate stem"
                    value={selected.rot}
                    onChange={(e) => patch(selected.id, { rot: Number(e.target.value) })}
                  />
                </label>
                <label className="flex items-center gap-1">
                  Size
                  <input
                    type="range"
                    min={50}
                    max={160}
                    aria-label="Scale stem"
                    value={Math.round(selected.scale * 100)}
                    onChange={(e) => patch(selected.id, { scale: Number(e.target.value) / 100 })}
                  />
                </label>
                <button type="button" onClick={() => patch(selected.id, { z: selected.z + 3 })} className="underline">
                  Front
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPieces((p) => p.filter((x) => x.id !== selected.id));
                    setSel(null);
                  }}
                  className="underline"
                >
                  Remove
                </button>
              </div>
            )}
          </section>

          <aside className="space-y-3">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-line bg-surface px-3 py-2 font-serif text-xl"
            />
            <p className="text-sm text-muted">
              {math.stems} stems · about ${math.est.toFixed(0)} for one {vesselMeta?.name.toLowerCase()}
              {pieces.some((p) => stemById(p.stemId)?.material === "silk") &&
              pieces.some((p) => stemById(p.stemId)?.material === "fresh")
                ? " · mixed real + silk"
                : ""}
            </p>
            {blocked.length > 0 && (
              <p className="text-sm text-clay">
                Off season in {place} this month: {blocked.join(", ")}. Silk the faces or swap them.
              </p>
            )}
            {vessel !== "bouquet" && vessel !== "bout" && (
              <label className="block text-xs">
                × tables
                <input
                  type="number"
                  min={1}
                  value={tables}
                  onChange={(e) => setTables(Number(e.target.value) || 1)}
                  className="mt-1 w-full rounded-lg border border-line bg-paper px-2 py-1.5"
                />
              </label>
            )}
            <ul className="space-y-1.5 text-sm">
              {math.lines.map((l) => (
                <li key={l.stemId} className="flex justify-between gap-2">
                  <span>
                    {l.count} {l.name}
                  </span>
                  <span className="text-muted">${l.est.toFixed(0)}</span>
                </li>
              ))}
            </ul>
            {vessel !== "bouquet" && vessel !== "bout" && (
              <p className="text-xs text-muted">
                For {tables} tables: ~${(math.est * tables).toFixed(0)}
              </p>
            )}
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={persist}
                className="rounded-full bg-moss px-4 py-2 text-sm font-medium text-ivory"
              >
                Save this look
              </button>
              <button type="button" onClick={toShop} className="rounded-full border border-line px-4 py-2 text-sm">
                Add stems to shopping
              </button>
              <button
                type="button"
                onClick={() => {
                  setPieces([]);
                  setSel(null);
                  setSavedId(null);
                  setTitle("Untitled look");
                }}
                className="text-xs underline"
              >
                Clear canvas
              </button>
            </div>
            {msg && <p className="text-xs text-moss">{msg}</p>}
            {saved.length > 0 && (
              <div>
                <p className="mb-1 kicker">Your looks</p>
                <ul className="space-y-1">
                  {saved.map((m) => (
                    <li key={m.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setSavedId(m.id);
                          setTitle(m.title);
                          setVessel(m.vessel);
                          setStory(m.story);
                          setPieces(m.pieces || []);
                        }}
                        className="text-left text-xs underline"
                      >
                        {m.title}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <p className="text-xs text-muted">
              Need sources and a week-of plan?{" "}
              <Link href="/diy/flowers" className="underline">
                Flowers playbook
              </Link>
            </p>
          </aside>
        </div>
      )}
    </div>
  );
}
