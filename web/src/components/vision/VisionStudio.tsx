"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Icon } from "@/components/icons";
import { COLOR_STORIES } from "@/lib/floral-studio";
import {
  FORMAL,
  MUSTS,
  VENUES,
  VIBES,
  VISION_PAIRS,
  type PairSide,
  type VisionPayload,
  colorsLine,
  mergeVision,
  paletteForStory,
  storyLabel,
  suggestFromSides,
  visionSummary,
} from "@/lib/vision";
import { VisionBoard } from "./VisionBoard";

type Mode = "walk" | "board" | "brief";

export function VisionStudio({
  initial,
  startWalk,
  startView,
}: {
  initial: VisionPayload;
  startWalk?: boolean;
  startView?: Mode;
}) {
  const hadWalk = initial.feel.length > 0;
  const [mode, setMode] = useState<Mode>(startView || (startWalk || !hadWalk ? "walk" : "brief"));
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<PairSide[]>([]);
  const [rejected, setRejected] = useState<PairSide[]>([]);
  const [vision, setVision] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const pair = VISION_PAIRS[index];
  const setName = pair?.set;
  const setPairs = useMemo(() => VISION_PAIRS.filter((p) => p.set === setName), [setName]);
  const setPos = setPairs.findIndex((p) => p.id === pair?.id) + 1;

  function applySides(keep: PairSide[], drop: PairSide[]) {
    const nextFeel = [
      ...vision.feel,
      ...keep.map((s) => ({ id: s.id, url: s.url, tag: s.tag, why: s.label })),
    ];
    const nextReject = [
      ...vision.reject,
      ...drop.map((s) => ({ id: s.id, url: s.url, tag: s.tag })),
    ];
    const allKeep = [...picked, ...keep];
    const suggestion = suggestFromSides(allKeep);
    return mergeVision(vision, {
      feel: dedupePins(nextFeel),
      reject: dedupePins(nextReject),
      vibe: vision.vibe || suggestion.vibe,
      formal: vision.formal || suggestion.formal,
      story: vision.story || suggestion.story,
      palette: vision.palette || suggestion.palette,
      colors: vision.colors || colorsLine({ ...vision, palette: suggestion.palette }),
    });
  }

  function choose(side: "left" | "right" | "neither") {
    if (!pair) return;
    const keep = side === "neither" ? [] : [pair[side]];
    const drop = side === "neither" ? [pair.left, pair.right] : [side === "left" ? pair.right : pair.left];
    const nextPicked = [...picked, ...keep];
    const nextRejected = [...rejected, ...drop];
    setPicked(nextPicked);
    setRejected(nextRejected);
    if (index + 1 >= VISION_PAIRS.length) {
      setVision(applySides(keep, drop));
      setMode("brief");
      return;
    }
    setVision(applySides(keep, drop));
    setIndex((i) => i + 1);
  }

  function skipSet() {
    const rest = VISION_PAIRS.slice(index).filter((p) => p.set === setName);
    setIndex(index + rest.length);
    if (index + rest.length >= VISION_PAIRS.length) setMode("brief");
  }

  async function save(status: "EXPLORING" | "DECIDED") {
    setSaving(true);
    setMsg(null);
    const payload = {
      ...vision,
      lockedAt: status === "DECIDED" ? new Date().toISOString() : vision.lockedAt,
    };
    const res = await fetch("/api/decisions/style-vibe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status,
        summary: visionSummary(payload),
        payload,
      }),
    });
    setSaving(false);
    setMsg(res.ok ? (status === "DECIDED" ? "Locked. The desk will follow this." : "Saved.") : "Could not save");
    if (res.ok) setVision(payload);
  }

  if (mode === "walk" && pair) {
    return (
      <div className="mx-auto max-w-5xl">
        <VisionTabs mode={mode} onMode={setMode} />
        <p className="kicker kicker-moss">
          {pair.set} · {setPos} of {setPairs.length}
        </p>
        <h1 className="headline mt-2">{pair.ask}</h1>
        <p className="deck mt-2 max-w-xl">
          Tap the one that feels more like your day. Not prettier — yours.
        </p>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          <PickCard side={pair.left} onPick={() => choose("left")} />
          <PickCard side={pair.right} onPick={() => choose("right")} />
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => choose("neither")} className="btn btn-ghost min-h-11">
            Neither
          </button>
          {setPos < setPairs.length ? (
            <button type="button" onClick={skipSet} className="btn btn-ghost min-h-11">
              Skip the rest of {pair.set.toLowerCase()}
            </button>
          ) : null}
          <button type="button" onClick={() => setMode("brief")} className="text-sm text-muted underline">
            Skip to the brief
          </button>
          <span className="ml-auto text-xs tabular-nums text-muted">
            {index + 1} / {VISION_PAIRS.length}
          </span>
        </div>
      </div>
    );
  }

  if (mode === "board") {
    return (
      <div className="mx-auto max-w-4xl">
        <VisionTabs mode={mode} onMode={setMode} />
        <p className="kicker kicker-moss mt-6">The board</p>
        <h1 className="headline mt-2">Pictures you keep</h1>
        <p className="deck mt-2 max-w-xl">Kept from the walk, plus anything you pin. The No strip stays visible.</p>
        <div className="mt-6">
          <VisionBoard vision={vision} onChange={setVision} onSave={() => save("EXPLORING")} />
        </div>
        {msg ? <p className="mt-3 text-sm text-muted">{msg}</p> : null}
      </div>
    );
  }

  const cover = vision.feel[0]?.url;
  const hex = vision.palette?.hex || [];

  return (
    <div className="mx-auto max-w-3xl">
      <VisionTabs mode={mode} onMode={setMode} />
      <p className="kicker kicker-moss mt-6">The brief</p>
      <h1 className="headline mt-2">How it should feel</h1>
      <p className="deck mt-2 max-w-xl">
        Pictures first. The word is a caption. Lock it when you’d hand this to a florist.
      </p>

      <article className="panel mt-8 overflow-hidden">
        {cover ? (
          <img src={cover} alt="" className="aspect-[16/8] w-full object-cover" />
        ) : (
          <div className="flex aspect-[16/8] items-center justify-center bg-paper text-moss/70">
            <Icon name="sprig" className="h-8 w-8" />
          </div>
        )}
        <div className="space-y-6 p-5 sm:p-6">
          {hex.length ? (
            <div className="flex flex-wrap items-center gap-2">
              {hex.map((c) => (
                <span key={c} className="h-8 w-8 rounded-full border border-line" style={{ background: c }} title={c} />
              ))}
              <span className="text-sm text-muted">{storyLabel(vision.story) || "Your colors"}</span>
            </div>
          ) : null}

          {vision.feel.length ? (
            <div>
              <p className="kicker">Kept</p>
              <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
                {vision.feel.slice(0, 8).map((pin) => (
                  <div key={pin.id} className="overflow-hidden rounded-xl">
                    <img src={pin.url} alt="" className="aspect-[4/3] w-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="flex items-center gap-2 text-sm text-muted">
              <Icon name="sprig" className="h-4 w-4" />
              Walk this / not this, or pick a word below.
            </p>
          )}

          {vision.reject.length ? (
            <div>
              <p className="kicker">No</p>
              <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                {vision.reject.slice(0, 8).map((pin) => (
                  <img key={pin.id} src={pin.url} alt="" className="h-16 w-20 shrink-0 rounded-lg object-cover opacity-60" />
                ))}
              </div>
            </div>
          ) : null}

          <div>
            <p className="text-sm font-medium">The word — last</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {VIBES.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setVision((cur) => ({ ...cur, vibe: v }))}
                  className={`min-h-11 rounded-full px-3.5 text-sm ${
                    vision.vibe === v ? "bg-moss text-moss-fg" : "border border-line bg-surface"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium">How dressed</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {FORMAL.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setVision((cur) => ({ ...cur, formal: v }))}
                  className={`min-h-11 rounded-full px-3.5 text-sm ${
                    vision.formal === v ? "bg-moss text-moss-fg" : "border border-line bg-surface"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium">Color story</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {COLOR_STORIES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() =>
                    setVision((cur) => ({
                      ...cur,
                      story: s.id,
                      palette: paletteForStory(s.id),
                      colors: s.chips.map((c) => c.hex).join(" · "),
                    }))
                  }
                  className={`min-h-11 rounded-full px-3.5 text-sm ${
                    vision.story === s.id ? "bg-moss text-moss-fg" : "border border-line bg-surface"
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium">The place</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {VENUES.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setVision((cur) => ({ ...cur, venueType: v }))}
                  className={`min-h-11 rounded-full px-3.5 text-sm ${
                    vision.venueType === v ? "bg-moss text-moss-fg" : "border border-line bg-surface"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium">If something has to win</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {MUSTS.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() =>
                    setVision((cur) => ({
                      ...cur,
                      must: cur.must.includes(v) ? cur.must.filter((x) => x !== v) : [...cur.must, v],
                    }))
                  }
                  className={`min-h-11 rounded-full px-3.5 text-sm ${
                    vision.must.includes(v) ? "bg-moss text-moss-fg" : "border border-line bg-surface"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <label className="block text-sm">
            <span className="font-medium">Hard no</span>
            <input
              value={vision.avoid}
              onChange={(e) => setVision((cur) => ({ ...cur, avoid: e.target.value }))}
              placeholder="No blush, no mason jars, no sparkler send-off"
              className="field mt-1"
            />
          </label>

          <label className="block text-sm">
            <span className="font-medium">Anything else they should know</span>
            <textarea
              value={vision.notes}
              onChange={(e) => setVision((cur) => ({ ...cur, notes: e.target.value }))}
              rows={3}
              className="field mt-1"
            />
          </label>

          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={saving} onClick={() => save("EXPLORING")} className="btn btn-ghost min-h-11">
              Save draft
            </button>
            <button type="button" disabled={saving} onClick={() => save("DECIDED")} className="btn btn-primary min-h-11">
              Lock this vision
            </button>
            <Link href="/planning/vision/print" className="btn btn-ghost min-h-11">
              Print the brief
            </Link>
            <button
              type="button"
              onClick={() => {
                setIndex(0);
                setPicked([]);
                setRejected([]);
                setMode("walk");
              }}
              className="btn btn-ghost min-h-11"
            >
              Walk again
            </button>
          </div>
          {msg ? <p className="text-sm text-muted">{msg}</p> : null}
        </div>
      </article>

      <p className="mt-6 text-sm text-ink-soft">
        Next:{" "}
        <Link href="/decisions/path" className="underline">
          hire or make
        </Link>
        ,{" "}
        <Link href="/planning/vision?view=board" className="underline">
          pin more
        </Link>
        , or{" "}
        <Link href="/diy/studio/floral" className="underline">
          open floral
        </Link>
        .
      </p>
    </div>
  );
}

function VisionTabs({ mode, onMode }: { mode: Mode; onMode: (m: Mode) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {(
        [
          ["walk", "This / not this"],
          ["board", "Board"],
          ["brief", "Brief"],
        ] as const
      ).map(([id, label]) => (
        <button
          key={id}
          type="button"
          onClick={() => onMode(id)}
          className={`min-h-10 rounded-full px-4 text-sm ${
            mode === id ? "bg-moss text-moss-fg" : "border border-line"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function PickCard({ side, onPick }: { side: PairSide; onPick: () => void }) {
  return (
    <button
      type="button"
      onClick={onPick}
      className="group overflow-hidden rounded-[1.35rem] text-left outline-none focus-visible:ring-2 focus-visible:ring-moss focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
    >
      <span className="relative block aspect-[3/2] overflow-hidden">
        <img
          src={side.url}
          alt=""
          className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
        />
        <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/55 to-transparent p-4">
          <span className="font-serif text-xl text-ivory">{side.label}</span>
        </span>
      </span>
    </button>
  );
}

function dedupePins<T extends { id: string }>(rows: T[]) {
  const seen = new Set<string>();
  return rows.filter((r) => {
    if (seen.has(r.id)) return false;
    seen.add(r.id);
    return true;
  });
}
