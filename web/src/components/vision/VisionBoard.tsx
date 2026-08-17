"use client";

import { useMemo, useState } from "react";
import { FileUpload } from "@/components/ui/FileUpload";
import { Icon } from "@/components/icons";
import { HOUSE_LIBRARY, type VisionPayload, type VisionPin } from "@/lib/vision";

const TAGS = ["Florals", "Tables", "Dress", "Venue", "Paper", "Other"];

export function VisionBoard({
  vision,
  onChange,
  onSave,
}: {
  vision: VisionPayload;
  onChange: (next: VisionPayload) => void;
  onSave: (next?: VisionPayload) => void;
}) {
  const [url, setUrl] = useState("");
  const [why, setWhy] = useState("");
  const [tag, setTag] = useState("Tables");
  const [filter, setFilter] = useState("ALL");

  const kept = vision.feel;
  const nos = vision.reject;
  const visible = useMemo(
    () => (filter === "ALL" ? kept : kept.filter((p) => p.tag === filter.toLowerCase() || tagMatch(p.tag, filter))),
    [kept, filter]
  );

  function pin(next: VisionPin) {
    if (vision.feel.some((p) => p.url === next.url)) return;
    onChange({
      ...vision,
      feel: [next, ...vision.feel],
      reject: vision.reject.filter((p) => p.url !== next.url),
    });
  }

  function drop(id: string) {
    onChange({ ...vision, feel: vision.feel.filter((p) => p.id !== id) });
  }

  return (
    <div className="space-y-6">
      <form
        className="panel space-y-3 p-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!url) return;
          pin({ id: `pin-${Date.now()}`, url, tag: tag.toLowerCase(), why });
          setUrl("");
          setWhy("");
        }}
      >
        <div className="flex flex-wrap gap-2">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste a photo URL"
            className="field min-w-[12rem] flex-1"
          />
          <FileUpload
            accept="image/jpeg,image/png,image/webp,image/gif"
            label="Upload"
            onUploaded={(href) => setUrl(href)}
          />
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          <input
            value={why}
            onChange={(e) => setWhy(e.target.value)}
            placeholder="Why — the height, not the color"
            className="field sm:col-span-2"
          />
          <select value={tag} onChange={(e) => setTag(e.target.value)} className="field">
            {TAGS.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="submit" className="btn btn-primary min-h-11">
            Pin
          </button>
          <button type="button" onClick={() => onSave(vision)} className="btn btn-ghost min-h-11">
            Save board
          </button>
        </div>
      </form>

      {!kept.length ? (
        <p className="flex items-center gap-2 text-sm text-muted">
          <Icon name="sprig" className="h-4 w-4" />
          Walk this / not this, or pin one thing you already love.
        </p>
      ) : null}

      <div>
        <p className="kicker">House library</p>
        <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
          {HOUSE_LIBRARY.map((s) => (
            <button
              key={s.url}
              type="button"
              onClick={() => pin({ id: s.id, url: s.url, tag: s.tag, why: s.label })}
              className="group overflow-hidden rounded-xl"
            >
              <img src={s.url} alt="" className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-105" />
            </button>
          ))}
        </div>
      </div>

      {nos.length ? (
        <div>
          <p className="kicker">No</p>
          <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
            {nos.map((p) => (
              <img key={p.id} src={p.url} alt="" className="h-16 w-20 shrink-0 rounded-lg object-cover opacity-55" />
            ))}
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {["ALL", ...TAGS].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setFilter(t)}
            className={`min-h-9 rounded-full px-3 text-xs ${filter === t ? "bg-moss text-moss-fg" : "border border-line"}`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="columns-2 gap-3 sm:columns-3">
        {visible.map((item) => (
          <article
            key={item.id}
            className={`group relative mb-3 break-inside-avoid overflow-hidden rounded-[1.2rem] ${
              vision.coverUrl === item.url ? "ring-2 ring-moss" : ""
            }`}
          >
            <img src={item.url} alt="" className="w-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/60 to-transparent p-3">
              <p className="font-serif text-lg leading-tight text-ivory">{item.why || item.tag}</p>
              <div className="mt-1 flex gap-2 text-[11px] text-ivory/80">
                {vision.coverUrl === item.url ? (
                  <span>On the cover</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      const next = { ...vision, coverUrl: item.url };
                      onChange(next);
                      onSave(next);
                    }}
                  >
                    Use as cover
                  </button>
                )}
                <button type="button" onClick={() => drop(item.id)}>
                  Remove
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function tagMatch(tag: string, filter: string) {
  const map: Record<string, string> = {
    Florals: "flower",
    Tables: "table",
    Dress: "dress",
    Venue: "place",
    Paper: "paper",
  };
  return tag === map[filter] || tag === "light" && filter === "Tables";
}
