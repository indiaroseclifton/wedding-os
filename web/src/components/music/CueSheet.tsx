"use client";

import { useMemo, useState } from "react";
import { DJ_BANNED_STARTERS, DJ_CUES, type MusicCue } from "@/lib/dj-cues";

const ACTS = [
  { id: "ceremony", label: "Ceremony" },
  { id: "cocktail", label: "Cocktail" },
  { id: "reception", label: "Reception" },
] as const;

export function CueSheet({
  cues,
  onChange,
  genres,
  energy,
  noLineDances,
  announceNames,
  onMeta,
}: {
  cues: MusicCue[];
  onChange: (next: MusicCue[]) => void;
  genres: string;
  energy: string;
  noLineDances: boolean;
  announceNames: string;
  onMeta: (p: { genres?: string; energy?: string; noLineDances?: boolean; announceNames?: string }) => void;
}) {
  const [act, setAct] = useState<(typeof ACTS)[number]["id"]>("ceremony");
  const [openId, setOpenId] = useState<string | null>("processional");
  const rows = useMemo(() => DJ_CUES.filter((c) => c.act === act), [act]);

  function patch(id: string, p: Partial<MusicCue>) {
    onChange(cues.map((c) => (c.id === id ? { ...c, ...p } : c)));
  }

  const filled = cues.filter((c) => c.song || c.skip).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-moss">Cue sheet</p>
          <h2 className="font-serif text-3xl">What the DJ actually needs</h2>
          <p className="mt-1 text-sm text-muted">
            {filled} of {DJ_CUES.length} moments set. Skip the ones you’re not doing.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {ACTS.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => setAct(a.id)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium ${
              act === a.id ? "bg-moss text-ivory" : "border border-line"
            }`}
          >
            {a.label}
          </button>
        ))}
      </div>

      <ul className="space-y-2">
        {rows.map((def) => {
          const row = cues.find((c) => c.id === def.id) || { id: def.id };
          const open = openId === def.id;
          return (
            <li key={def.id} className="overflow-hidden rounded-2xl border border-line bg-surface/70">
              <button
                type="button"
                onClick={() => setOpenId(open ? null : def.id)}
                className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left"
              >
                <div>
                  <p className="text-sm font-medium">{def.label}</p>
                  <p className="text-[11px] text-muted">{def.when}</p>
                  {row.skip ? (
                    <p className="mt-1 text-xs text-muted">Skipping</p>
                  ) : row.song ? (
                    <p className="mt-1 text-xs text-moss">{row.song}</p>
                  ) : (
                    <p className="mt-1 text-xs text-clay">Not set</p>
                  )}
                </div>
                <span className="text-xs text-muted">{open ? "–" : "+"}</span>
              </button>
              {open && (
                <div className="space-y-3 border-t border-line px-4 py-3">
                  <p className="text-xs text-ink-soft">{def.hint}</p>
                  <label className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={!!row.skip}
                      onChange={(e) => patch(def.id, { skip: e.target.checked })}
                    />
                    We’re not doing this
                  </label>
                  {!row.skip && (
                    <>
                      <input
                        value={row.song || ""}
                        onChange={(e) => patch(def.id, { song: e.target.value })}
                        placeholder="Song — artist"
                        className="w-full rounded-lg border border-line bg-paper/50 px-3 py-2 text-sm"
                      />
                      <input
                        value={row.who || ""}
                        onChange={(e) => patch(def.id, { who: e.target.value })}
                        placeholder="Who is walking / dancing / speaking"
                        className="w-full rounded-lg border border-line bg-paper/50 px-3 py-2 text-sm"
                      />
                      <input
                        value={row.notes || ""}
                        onChange={(e) => patch(def.id, { notes: e.target.value })}
                        placeholder="Fade at 1:30, start at the chorus, announce as…"
                        className="w-full rounded-lg border border-line bg-paper/50 px-3 py-2 text-sm"
                      />
                      <label className="block text-xs">
                        Energy {row.energy || 3}
                        <input
                          type="range"
                          min={1}
                          max={5}
                          aria-label={`Energy for ${def.label}`}
                          value={row.energy || 3}
                          onChange={(e) => patch(def.id, { energy: Number(e.target.value) })}
                          className="mt-1 w-full"
                        />
                      </label>
                      <div>
                        <p className="mb-1 text-[11px] uppercase tracking-wider text-muted">Inspiration</p>
                        <div className="flex flex-wrap gap-1.5">
                          {def.suggestions.map((s) => {
                            const line = `${s.title} — ${s.artist}`;
                            return (
                              <button
                                key={line}
                                type="button"
                                onClick={() => patch(def.id, { song: line })}
                                className="rounded-full border border-line px-2.5 py-1 text-[11px] hover:border-moss"
                              >
                                {s.title}
                                {s.note ? ` · ${s.note}` : ""}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <EnergyGraph cues={cues} />

      <div className="space-y-3 rounded-2xl border border-line bg-surface/70 p-4">
        <p className="text-sm font-medium">How the night should feel</p>
        <input
          value={genres}
          onChange={(e) => onMeta({ genres: e.target.value })}
          placeholder="Genres you’ll actually dance to (disco, 90s hip-hop, no country…)"
          className="w-full rounded-lg border border-line px-3 py-2 text-sm"
        />
        <input
          value={energy}
          onChange={(e) => onMeta({ energy: e.target.value })}
          placeholder="Energy (packed floor by 9, dinner stays conversational…)"
          className="w-full rounded-lg border border-line px-3 py-2 text-sm"
        />
        <input
          value={announceNames}
          onChange={(e) => onMeta({ announceNames: e.target.value })}
          placeholder="How to announce you (phonetic names help)"
          className="w-full rounded-lg border border-line px-3 py-2 text-sm"
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={noLineDances}
            onChange={(e) => onMeta({ noLineDances: e.target.checked })}
          />
          No line dances ({DJ_BANNED_STARTERS.slice(0, 3).join(", ")}…)
        </label>
      </div>
    </div>
  );
}

function EnergyGraph({ cues }: { cues: MusicCue[] }) {
  const pts = DJ_CUES.map((d, i) => {
    const row = cues.find((c) => c.id === d.id);
    return { x: i, y: row?.skip ? 0 : row?.energy || 3, skip: !!row?.skip, label: d.label };
  });
  const w = 320;
  const h = 72;
  const path = pts
    .map((p, i) => {
      const x = (i / Math.max(1, pts.length - 1)) * w;
      const y = h - (p.y / 5) * (h - 8) - 4;
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
  return (
    <div className="rounded-2xl border border-line bg-surface/70 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">Night energy</p>
      <svg viewBox={`0 0 ${w} ${h}`} className="mt-2 h-16 w-full" aria-hidden>
        <path d={path} fill="none" stroke="currentColor" className="text-moss" strokeWidth="2" />
      </svg>
      <p className="text-[11px] text-muted">Prelude quiet → dancing loud. Skip is a flat zero.</p>
    </div>
  );
}
