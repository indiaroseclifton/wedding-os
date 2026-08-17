"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CopyButton } from "@/components/ui/CopyButton";

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

export default function SiteEditorPage() {
  const [site, setSite] = useState<Site | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
    fetch("/api/site")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        setSite(data.site);
        setGuests(data.guests || []);
      })
      .catch(() => {});
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!site) return;
    const res = await fetch("/api/site", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(site),
    });
    setMsg(res.ok ? "Saved" : "Could not save");
  }

  async function publish(on: boolean) {
    const res = await fetch("/api/site", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: on ? "publish" : "unpublish" }),
    });
    if (res.ok) {
      const data = await res.json();
      setSite(data.site);
      setMsg(on ? "Site is live" : "Site unpublished");
    }
  }

  if (!site) return <p className="text-sm text-slate-500">Loading…</p>;
  const url = `${origin}/w/${site.siteToken}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Wedding site</h1>
          <p className="mt-1 text-sm text-slate-600">
            The page guests open. The hero is the Vision cover. Gallery is extra pictures.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => publish(!site.published)}
            className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white"
          >
            {site.published ? "Unpublish" : "Publish"}
          </button>
          {site.published && (
            <Link href={url} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" target="_blank">
              Open site
            </Link>
          )}
          <Link href="/site/preview" className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
            Preview
          </Link>
        </div>
      </div>

      {site.published && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm">
          <span className="font-medium text-emerald-900">Live</span>
          <span className="break-all text-emerald-800">{url}</span>
          <CopyButton value={url} />
        </div>
      )}

      <ShareCard url={site.published ? url : `${origin}/site/preview`} headline={site.headline} rsvpClose={site.rsvpClose} />

      <form onSubmit={save} className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
        <label className="block text-sm">
          Look
          <select
            value={site.template || "letter"}
            onChange={(e) =>
              setSite({ ...site, template: e.target.value as Site["template"] })
            }
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="letter">Letter — one column, quiet</option>
            <option value="garden">Garden — more photo, greener</option>
            <option value="midnight">Midnight — dark, champagne type</option>
          </select>
        </label>
        <label className="block text-sm">
          Gallery URLs (one per line)
          <span className="mt-0.5 block text-xs text-slate-500">
            Extra photos under the letter. The hero is locked on{" "}
            <Link href="/planning/vision?view=board" className="underline">
              Vision
            </Link>
            .
          </span>
          <textarea
            value={(site.gallery || []).join("\n")}
            onChange={(e) =>
              setSite({
                ...site,
                gallery: e.target.value.split("\n").map((u) => u.trim()).filter(Boolean),
              })
            }
            rows={3}
            placeholder="https://…jpg"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm">
          RSVP closes
          <input
            type="date"
            value={site.rsvpClose || ""}
            onChange={(e) => setSite({ ...site, rsvpClose: e.target.value })}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm">
          Password (optional)
          <input
            value={site.gate || ""}
            onChange={(e) => setSite({ ...site, gate: e.target.value })}
            placeholder="Leave blank if anyone with the link can open it"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm">
          Headline
          <input
            value={site.headline || ""}
            onChange={(e) => setSite({ ...site, headline: e.target.value })}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm">
          Story
          <textarea
            value={site.story || ""}
            onChange={(e) => setSite({ ...site, story: e.target.value })}
            rows={4}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm">
          Day-of schedule (guest version)
          <textarea
            value={site.scheduleNote || ""}
            onChange={(e) => setSite({ ...site, scheduleNote: e.target.value })}
            rows={3}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm">
          Dress code
          <input
            value={site.dressCode || ""}
            onChange={(e) => setSite({ ...site, dressCode: e.target.value })}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm">
          RSVP note
          <input
            value={site.rsvpNote || ""}
            onChange={(e) => setSite({ ...site, rsvpNote: e.target.value })}
            placeholder="Please reply by April 1"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={site.rsvpOpen}
            onChange={(e) => setSite({ ...site, rsvpOpen: e.target.checked })}
          />
          RSVP open
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={site.collectAddress !== false}
            onChange={(e) => setSite({ ...site, collectAddress: e.target.checked })}
          />
          Ask for mailing address
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={Boolean(site.requireAddress)}
            onChange={(e) => setSite({ ...site, requireAddress: e.target.checked })}
          />
          Require address to RSVP
        </label>
        <div className="space-y-2">
          <p className="text-sm font-medium">Extra RSVP questions</p>
          {(site.rsvpQuestions || []).map((q, i) => (
            <div key={q.id} className="flex gap-2">
              <input
                value={q.prompt}
                onChange={(e) => {
                  const next = [...(site.rsvpQuestions || [])];
                  next[i] = { ...q, prompt: e.target.value };
                  setSite({ ...site, rsvpQuestions: next });
                }}
                className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={() =>
                  setSite({
                    ...site,
                    rsvpQuestions: (site.rsvpQuestions || []).filter((x) => x.id !== q.id),
                  })
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
              setSite({
                ...site,
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
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={site.showTravel}
            onChange={(e) => setSite({ ...site, showTravel: e.target.checked })}
          />
          Show travel / hotels
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={site.showRegistry}
            onChange={(e) => setSite({ ...site, showRegistry: e.target.checked })}
          />
          Show registry
        </label>
        <label className="block text-sm">
          Extra
          <textarea
            value={site.extra || ""}
            onChange={(e) => setSite({ ...site, extra: e.target.value })}
            rows={2}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
        {msg && <p className="text-xs text-slate-500">{msg}</p>}
        <button type="submit" className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white">
          Save copy
        </button>
      </form>

      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
          Personal RSVP links
        </p>
        <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
          {guests.map((g) => {
            const link =
              site.published && g.rsvpToken ? `${url}/rsvp?guest=${g.rsvpToken}` : "";
            return (
              <li key={g.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 text-sm">
                <span>
                  {g.name}{" "}
                  <span className="text-xs text-slate-500">{g.rsvp}</span>
                </span>
                {link && <CopyButton value={link} />}
              </li>
            );
          })}
        </ul>
        <p className="mt-2 text-xs text-slate-500">
          Guests can open their own link (no name lookup). Their reply updates headcount and catering.
        </p>
      </div>
    </div>
  );
}

function ShareCard({
  url,
  headline,
  rsvpClose,
}: {
  url: string;
  headline?: string;
  rsvpClose?: string;
}) {
  const [names, setNames] = useState("Our wedding");
  const [date, setDate] = useState("");
  const [place, setPlace] = useState("");

  useEffect(() => {
    fetch("/api/workspace")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d?.meta) return;
        if (d.meta.coupleNames) setNames(d.meta.coupleNames);
        if (d.meta.weddingDate) setDate(d.meta.weddingDate);
        if (d.meta.location) setPlace(d.meta.location);
      })
      .catch(() => {});
  }, []);

  const blurb = [
    names,
    headline,
    [date, place].filter(Boolean).join(" · "),
    rsvpClose ? `Please RSVP by ${rsvpClose}.` : "RSVP at the link.",
    url,
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <p className="text-sm font-medium">Text this</p>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-ink-soft">{blurb}</p>
      <div className="mt-3">
        <CopyButton value={blurb} />
      </div>
    </div>
  );
}
