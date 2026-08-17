"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { CopyButton } from "@/components/ui/CopyButton";
import { RoomSubnav } from "@/components/layout/RoomSubnav";
import { GuestHero } from "@/components/site/GuestHero";

type Site = {
  siteToken: string;
  published: boolean;
  headline?: string;
  story?: string;
  scheduleNote?: string;
  dressCode?: string;
  extra?: string;
  showTravel: boolean;
  showRegistry: boolean;
  rsvpOpen: boolean;
  rsvpNote?: string;
  collectAddress?: boolean;
  requireAddress?: boolean;
  rsvpQuestions?: { id: string; prompt: string }[];
  template?: "letter" | "garden" | "midnight";
  gallery?: string[];
  rsvpClose?: string;
  gate?: string;
};

type Guest = { id: string; name: string; rsvp: string; rsvpToken?: string };

type Look = {
  names: string;
  date: string;
  location: string;
  coverUrl: string;
  mode: "invite" | "announce";
  night: boolean;
};

const LOOKS: { id: Site["template"]; label: string; hint: string; swatch: string }[] = [
  { id: "letter", label: "Letter", hint: "Quiet column", swatch: "bg-[#f6f1e8]" },
  { id: "garden", label: "Garden", hint: "More photo", swatch: "bg-[#dce6d4]" },
  { id: "midnight", label: "Midnight", hint: "Dark, champagne", swatch: "bg-[#1c1a16]" },
];

export function SiteLetterEditor() {
  const [site, setSite] = useState<Site | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [look, setLook] = useState<Look | null>(null);
  const [origin, setOrigin] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [galleryAdd, setGalleryAdd] = useState("");
  const dirty = useRef(false);
  const siteRef = useRef<Site | null>(null);

  useEffect(() => {
    setOrigin(window.location.origin);
    fetch("/api/site")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        setSite(data.site);
        siteRef.current = data.site;
        setGuests(data.guests || []);
        setLook(data.look || null);
      })
      .catch(() => {});
  }, []);

  const persist = useCallback(async (next: Site) => {
    const res = await fetch("/api/site", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next),
    });
    if (res.ok) {
      const data = await res.json();
      dirty.current = false;
      setSite(data.site);
      siteRef.current = data.site;
      setMsg("Saved");
    } else {
      setMsg("Could not save");
    }
  }, []);

  useEffect(() => {
    if (!site) return;
    siteRef.current = site;
    if (!dirty.current) return;
    const t = setTimeout(() => persist(site), 700);
    return () => clearTimeout(t);
  }, [site, persist]);

  function patch(partial: Partial<Site>) {
    setSite((s) => {
      if (!s) return s;
      dirty.current = true;
      const next = { ...s, ...partial };
      siteRef.current = next;
      return next;
    });
    setMsg(null);
  }

  async function publish(on: boolean) {
    const current = siteRef.current;
    if (current && dirty.current) await persist(current);
    const res = await fetch("/api/site", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: on ? "publish" : "unpublish" }),
    });
    if (res.ok) {
      const data = await res.json();
      setSite(data.site);
      siteRef.current = data.site;
      dirty.current = false;
      setMsg(on ? "The letter is live" : "Unpublished");
    }
  }

  if (!site) return <p className="text-sm text-muted">Loading the letter…</p>;

  const url = `${origin}/w/${site.siteToken}`;
  const announce = look?.mode === "announce";
  const night = site.template === "midnight" || look?.night;
  const names = look?.names || "Your names";
  const shareUrl = site.published ? url : `${origin}/site/preview`;
  const blurb = [
    names,
    site.headline,
    [look?.date, look?.location].filter(Boolean).join(" · "),
    site.rsvpClose ? `Please RSVP by ${site.rsvpClose}.` : announce ? "" : "RSVP at the link.",
    shareUrl,
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <div className="space-y-6">
      <RoomSubnav room="guests" />

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="kicker kicker-moss">Guests</p>
          <h1 className="title mt-2">The letter</h1>
          <p className="deck mt-2 max-w-xl">
            What they open. The photograph is the Vision cover. Write under it the way they will read it.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => publish(!site.published)} className="btn btn-primary">
            {site.published ? "Unpublish" : "Publish"}
          </button>
          <Link href="/site/preview" className="btn btn-ghost" target="_blank">
            {site.published ? "Open live page" : "See as a guest"}
          </Link>
        </div>
      </div>

      {site.published && (
        <div className="glass-panel flex flex-wrap items-center gap-2 rounded-2xl px-4 py-3 text-sm">
          <span className="font-medium text-moss">Live</span>
          <span className="break-all text-ink-soft">{url}</span>
          <CopyButton value={url} />
        </div>
      )}

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_19rem]">
        <article
          className={`overflow-hidden rounded-[1.8rem] border border-line shadow-[0_18px_50px_-28px_rgba(40,36,28,0.45)] ${
            night ? "bg-[#141311] text-[#f3efe6]" : "bg-paper text-ink"
          }`}
        >
          <GuestHero
            names={names}
            date={look?.date}
            location={look?.location}
            coverUrl={look?.coverUrl || undefined}
            mode={announce ? "announce" : "invite"}
            night={Boolean(night)}
          >
            <p className="text-[11px] tracking-wide text-muted">
              Cover is locked on{" "}
              <Link href="/planning/vision?view=board" className="underline">
                Vision
              </Link>
            </p>
          </GuestHero>

          <div className="mx-auto max-w-xl space-y-8 px-5 py-10 sm:px-8">
            <label className="block">
              <span className="sr-only">Headline</span>
              <input
                value={site.headline || ""}
                onChange={(e) => patch({ headline: e.target.value })}
                placeholder="A line under your names"
                className="w-full border-0 bg-transparent text-center font-serif text-2xl italic tracking-tight outline-none placeholder:text-muted/70"
              />
            </label>

            <label className="block">
              <span className="sr-only">Story</span>
              <textarea
                value={site.story || ""}
                onChange={(e) => patch({ story: e.target.value })}
                rows={6}
                placeholder="Write the letter. How you met. What the day is. Who this is for."
                className="w-full resize-none border-0 bg-transparent text-sm leading-7 text-ink-soft outline-none placeholder:text-muted/70"
              />
            </label>

            <section>
              <p className="kicker">Gallery</p>
              <div className={`mt-3 grid gap-2 ${(site.gallery || []).length > 1 ? "grid-cols-2" : ""}`}>
                {(site.gallery || []).map((src) => (
                  <div key={src} className="group relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="aspect-[4/5] w-full rounded-2xl object-cover" />
                    <button
                      type="button"
                      onClick={() => patch({ gallery: (site.gallery || []).filter((u) => u !== src) })}
                      className="absolute right-2 top-2 rounded-full bg-paper/90 px-2 py-1 text-[10px] uppercase tracking-wide"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              <form
                className="mt-3 flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  const url = galleryAdd.trim();
                  if (!url) return;
                  patch({ gallery: [...(site.gallery || []), url].slice(0, 12) });
                  setGalleryAdd("");
                }}
              >
                <input
                  value={galleryAdd}
                  onChange={(e) => setGalleryAdd(e.target.value)}
                  placeholder="Paste a photo URL"
                  className="field min-h-11 flex-1"
                />
                <button type="submit" className="btn btn-ghost">
                  Add
                </button>
              </form>
            </section>

            <section>
              <p className="kicker">Day of</p>
              <textarea
                value={site.scheduleNote || ""}
                onChange={(e) => patch({ scheduleNote: e.target.value })}
                rows={3}
                placeholder="Ceremony at four. Dinner at six. Dancing after."
                className="field mt-2 min-h-[5.5rem] leading-6"
              />
            </section>

            <section>
              <p className="kicker">What to wear</p>
              <input
                value={site.dressCode || ""}
                onChange={(e) => patch({ dressCode: e.target.value })}
                placeholder="Garden party. Linen is welcome."
                className="field mt-2"
              />
            </section>

            <section>
              <p className="kicker">Anything else</p>
              <textarea
                value={site.extra || ""}
                onChange={(e) => patch({ extra: e.target.value })}
                rows={2}
                placeholder="Unplugged ceremony. Adults only. Shuttle from the inn."
                className="field mt-2"
              />
            </section>
          </div>
        </article>

        <aside className="space-y-4 lg:sticky lg:top-20">
          <section className="glass-panel space-y-3 rounded-2xl p-4">
            <p className="kicker">Look</p>
            <div className="grid grid-cols-3 gap-2">
              {LOOKS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => patch({ template: opt.id })}
                  className={`rounded-2xl border p-2 text-left ${
                    (site.template || "letter") === opt.id ? "border-moss" : "border-line"
                  }`}
                >
                  <span className={`block h-10 rounded-xl ${opt.swatch}`} />
                  <span className="mt-2 block text-xs font-medium">{opt.label}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="glass-panel space-y-3 rounded-2xl p-4">
            <p className="kicker">{announce ? "Announcement" : "RSVP"}</p>
            {announce ? (
              <p className="text-sm text-ink-soft">Just-us. This page is an announcement — no RSVP.</p>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => patch({ rsvpOpen: true })}
                    className={`min-h-11 rounded-full text-sm ${
                      site.rsvpOpen ? "bg-moss text-moss-fg" : "border border-line"
                    }`}
                  >
                    Open
                  </button>
                  <button
                    type="button"
                    onClick={() => patch({ rsvpOpen: false })}
                    className={`min-h-11 rounded-full text-sm ${
                      !site.rsvpOpen ? "bg-moss text-moss-fg" : "border border-line"
                    }`}
                  >
                    Closed
                  </button>
                </div>
                <label className="block text-sm">
                  Closes
                  <input
                    type="date"
                    value={site.rsvpClose || ""}
                    onChange={(e) => patch({ rsvpClose: e.target.value })}
                    className="field mt-1"
                  />
                </label>
                <label className="block text-sm">
                  Note under the button
                  <input
                    value={site.rsvpNote || ""}
                    onChange={(e) => patch({ rsvpNote: e.target.value })}
                    placeholder="Please reply by April 1"
                    className="field mt-1"
                  />
                </label>
                <label className="flex min-h-11 items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={site.collectAddress !== false}
                    onChange={(e) => patch({ collectAddress: e.target.checked })}
                  />
                  Ask for mailing address
                </label>
                <label className="flex min-h-11 items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={Boolean(site.requireAddress)}
                    onChange={(e) => patch({ requireAddress: e.target.checked })}
                  />
                  Require address
                </label>
                <div className="space-y-2">
                  <p className="text-xs text-muted">Extra questions</p>
                  {(site.rsvpQuestions || []).map((q, i) => (
                    <div key={q.id} className="flex gap-2">
                      <input
                        value={q.prompt}
                        onChange={(e) => {
                          const next = [...(site.rsvpQuestions || [])];
                          next[i] = { ...q, prompt: e.target.value };
                          patch({ rsvpQuestions: next });
                        }}
                        className="field flex-1"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          patch({ rsvpQuestions: (site.rsvpQuestions || []).filter((x) => x.id !== q.id) })
                        }
                        className="text-xs underline"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      patch({
                        rsvpQuestions: [
                          ...(site.rsvpQuestions || []),
                          { id: `q${Date.now()}`, prompt: "Song request?" },
                        ],
                      })
                    }
                    className="text-xs underline"
                  >
                    Add question
                  </button>
                </div>
              </>
            )}
          </section>

          <section className="glass-panel space-y-3 rounded-2xl p-4">
            <p className="kicker">Also on the letter</p>
            <label className="flex min-h-11 items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={site.showTravel}
                onChange={(e) => patch({ showTravel: e.target.checked })}
              />
              Travel / hotels
            </label>
            <label className="flex min-h-11 items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={site.showRegistry}
                onChange={(e) => patch({ showRegistry: e.target.checked })}
              />
              Registry links
            </label>
            <label className="block text-sm">
              Password
              <input
                value={site.gate || ""}
                onChange={(e) => patch({ gate: e.target.value })}
                placeholder="Blank = anyone with the link"
                className="field mt-1"
              />
            </label>
          </section>

          <section className="glass-panel space-y-3 rounded-2xl p-4">
            <p className="kicker">Text this</p>
            <p className="whitespace-pre-wrap text-sm leading-6 text-ink-soft">{blurb}</p>
            <CopyButton value={blurb} label="Copy the text" />
          </section>

          <details className="glass-panel rounded-2xl p-4">
            <summary className="cursor-pointer text-sm font-medium">Personal RSVP links</summary>
            <ul className="mt-3 divide-y divide-line">
              {guests.map((g) => {
                const link = site.published && g.rsvpToken ? `${url}/rsvp?guest=${g.rsvpToken}` : "";
                return (
                  <li key={g.id} className="flex min-h-11 items-center justify-between gap-2 py-1 text-sm">
                    <span>
                      {g.name} <span className="text-xs text-muted">{g.rsvp}</span>
                    </span>
                    {link ? <CopyButton value={link} /> : <span className="text-xs text-muted">Publish first</span>}
                  </li>
                );
              })}
            </ul>
          </details>

          {msg && <p className="text-xs text-muted">{msg}</p>}
        </aside>
      </div>
    </div>
  );
}
