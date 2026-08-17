"use client";

import { useState } from "react";
import { FileUpload } from "@/components/ui/FileUpload";
import { Icon } from "@/components/icons";
import {
  BOARD_SECTIONS,
  HOUSE_LIBRARY,
  pinSection,
  type BoardSection,
  type VisionPayload,
  type VisionPin,
} from "@/lib/vision";

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
  const [tag, setTag] = useState<BoardSection>("Tables");
  const [editing, setEditing] = useState<string | null>(null);
  const [draftWhy, setDraftWhy] = useState("");
  const [draftTag, setDraftTag] = useState<BoardSection>("Other");

  function commit(next: VisionPayload) {
    onChange(next);
    onSave(next);
  }

  function pin(next: VisionPin) {
    if (vision.feel.some((p) => p.url === next.url)) return;
    commit({
      ...vision,
      feel: [next, ...vision.feel],
      reject: vision.reject.filter((p) => p.url !== next.url),
    });
  }

  function patchPin(id: string, patch: Partial<VisionPin>) {
    commit({
      ...vision,
      feel: vision.feel.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    });
    setEditing(null);
  }

  function drop(id: string) {
    const gone = vision.feel.find((p) => p.id === id);
    commit({
      ...vision,
      feel: vision.feel.filter((p) => p.id !== id),
      coverUrl: gone && vision.coverUrl === gone.url ? "" : vision.coverUrl,
    });
    setEditing(null);
  }

  function moveTo(id: string, section: BoardSection) {
    commit({
      ...vision,
      feel: vision.feel.map((p) => (p.id === id ? { ...p, tag: section.toLowerCase() } : p)),
    });
  }

  function openEdit(item: VisionPin) {
    setEditing(item.id);
    setDraftWhy(item.why || "");
    setDraftTag(pinSection(item.tag));
  }

  const nos = vision.reject;

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
            onUploaded={(href) => {
              pin({ id: `pin-${Date.now()}`, url: href, tag: tag.toLowerCase(), why });
              setWhy("");
            }}
          />
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          <input
            value={why}
            onChange={(e) => setWhy(e.target.value)}
            placeholder="Why — the height, not the color"
            className="field sm:col-span-2"
          />
          <select
            value={tag}
            onChange={(e) => setTag(e.target.value as BoardSection)}
            className="field"
          >
            {BOARD_SECTIONS.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn btn-primary min-h-11">
          Pin
        </button>
      </form>

      {!vision.feel.length ? (
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

      <div className="flex gap-3 overflow-x-auto pb-1 md:grid md:grid-cols-3 md:overflow-visible xl:grid-cols-6">
        {BOARD_SECTIONS.map((section) => {
          const items = vision.feel.filter((p) => pinSection(p.tag) === section);
          return (
            <section
              key={section}
              className="min-w-[13.5rem] shrink-0 md:min-w-0"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const id = e.dataTransfer.getData("text/pin-id");
                if (id) moveTo(id, section);
              }}
            >
              <p className="kicker">
                {section}
                <span className="ml-1 tabular-nums text-muted">{items.length}</span>
              </p>
              <div className="mt-2 min-h-28 space-y-2 rounded-[1.2rem] border border-dashed border-line bg-surface/40 p-1.5">
                {items.map((item) => (
                  <article
                    key={item.id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/pin-id", item.id);
                      e.dataTransfer.effectAllowed = "move";
                    }}
                    className={`overflow-hidden rounded-xl bg-paper ${
                      vision.coverUrl === item.url ? "ring-2 ring-moss" : ""
                    }`}
                  >
                    <button type="button" className="block w-full" onClick={() => openEdit(item)}>
                      <img src={item.url} alt="" className="aspect-[4/3] w-full object-cover" />
                    </button>
                    {editing === item.id ? (
                      <div className="space-y-2 p-2">
                        <input
                          value={draftWhy}
                          onChange={(e) => setDraftWhy(e.target.value)}
                          placeholder="Why this stays"
                          className="field text-sm"
                        />
                        <select
                          value={draftTag}
                          onChange={(e) => setDraftTag(e.target.value as BoardSection)}
                          className="field text-sm"
                        >
                          {BOARD_SECTIONS.map((t) => (
                            <option key={t}>{t}</option>
                          ))}
                        </select>
                        <div className="flex flex-wrap gap-2 text-[11px]">
                          <button
                            type="button"
                            className="rounded-full bg-moss px-3 py-1.5 text-ivory"
                            onClick={() =>
                              patchPin(item.id, { why: draftWhy, tag: draftTag.toLowerCase() })
                            }
                          >
                            Save
                          </button>
                          <button type="button" className="text-muted" onClick={() => setEditing(null)}>
                            Cancel
                          </button>
                          {vision.coverUrl === item.url ? (
                            <span className="ml-auto text-moss">On the cover</span>
                          ) : (
                            <button
                              type="button"
                              className="ml-auto text-moss"
                              onClick={() => commit({ ...vision, coverUrl: item.url })}
                            >
                              Cover
                            </button>
                          )}
                          <button type="button" className="text-clay" onClick={() => drop(item.id)}>
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => openEdit(item)}
                        className="block w-full px-2 py-1.5 text-left"
                      >
                        <p className="truncate font-serif text-sm leading-tight">{item.why || section}</p>
                        {vision.coverUrl === item.url ? (
                          <p className="text-[10px] uppercase tracking-wide text-moss">Cover</p>
                        ) : null}
                      </button>
                    )}
                  </article>
                ))}
                {!items.length ? (
                  <p className="px-2 py-6 text-center text-[11px] text-muted">Drop here</p>
                ) : null}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
