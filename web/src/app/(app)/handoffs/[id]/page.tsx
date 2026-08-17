"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PrintButton } from "@/components/ui/PrintButton";
import { ExportTextButton } from "@/components/handoffs/ExportTextButton";
import { CopyButton } from "@/components/ui/CopyButton";

const LABELS: Record<string, string> = {
  date_locations: "Date & locations",
  timeline_notes: "Timeline notes",
  key_contacts: "Key contacts",
  special_notes: "Special notes",
  vendor_list: "Vendor list",
  must_play: "Must-play",
  do_not_play: "Do-not-play",
  music_moments: "Music moments",
  tone_notes: "Tone / energy",
  day_of_contact: "Day-of contact",
  must_have_moments: "Must-have moments",
  group_notes: "Family / group notes",
  style_notes: "Style notes",
  constraints: "Constraints",
  headcount: "Headcount",
  dietary_summary: "Dietary summary",
  dietary_detail: "Guest dietary detail",
  service_notes: "Service notes",
  arrangement_list: "What you're making",
  palette_notes: "Palette",
  diy_mix: "DIY pieces on site",
  party_count: "Party count",
  call_times: "Call times",
  flavor_notes: "Flavors",
  display_notes: "Display / cutting",
  pickup_plan: "Pickup plan",
  hotel_addresses: "Hotels / addresses",
};

type Pkg = {
  id: string;
  title: string;
  template: string;
  status: string;
  recipientName?: string;
  sections: Record<string, string>;
  shareToken?: string;
  lastRefreshedAt?: string;
  lastRefreshedFrom?: "music" | "guests";
};

function formatStamp(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function HandoffDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [pkg, setPkg] = useState<Pkg | null>(null);
  const [sections, setSections] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/handoffs/${id}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Not found");
        const data = await res.json();
        setPkg(data.package);
        setSections(data.package.sections || {});
        if (data.package.shareToken) {
          setShareUrl(`${window.location.origin}/p/${data.package.shareToken}`);
        }
      })
      .catch((e) => setError(e.message));
  }, [id]);

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/handoffs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sections }),
      });
      if (!res.ok) throw new Error("Could not save");
      const data = await res.json();
      setPkg(data.package);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save");
    } finally {
      setSaving(false);
    }
  }

  async function refreshFromSource() {
    const hasContent = Object.values(sections).some((v) => (v || "").trim());
    if (hasContent) {
      const source = pkg?.template === "DJ" ? "Music" : "Guests";
      const ok = window.confirm(
        `Refresh will overwrite pulled sections with the latest ${source} data. Continue?`,
      );
      if (!ok) return;
    }
    setSaving(true);
    setError(null);
    setInfo(null);
    try {
      const res = await fetch(`/api/handoffs/${id}/refresh`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not refresh");
      setPkg(data.package);
      setSections(data.package.sections || {});
      setInfo(data.message || "Refreshed");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not refresh");
    } finally {
      setSaving(false);
    }
  }

  async function toSend() {
    setSaving(true);
    setError(null);
    try {
      await save();
      const res = await fetch(`/api/handoffs/${id}/to-send`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not put this on Send");
      router.push(`/send/${data.vendorId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not put this on Send");
    } finally {
      setSaving(false);
    }
  }

  async function share() {
    setSaving(true);
    setError(null);
    try {
      await save();
      const res = await fetch(`/api/handoffs/${id}/share`, { method: "POST" });
      if (!res.ok) throw new Error("Could not share");
      const data = await res.json();
      setPkg(data.package);
      if (data.sharePath) {
        setShareUrl(`${window.location.origin}${data.sharePath}`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not share");
    } finally {
      setSaving(false);
    }
  }

  if (error && !pkg) return <p className="text-sm text-rose-600">{error}</p>;
  if (!pkg) return <p className="text-sm text-muted">Loading…</p>;

  const canRefresh = pkg.template === "DJ" || pkg.template === "CATERING";
  const sourceLabel = pkg.template === "DJ" ? "Music" : "Guests";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="title">{pkg.title}</h1>
          <p className="mt-1 text-sm text-muted">
            {pkg.template.replace("_", " ")} · {pkg.status}
            {pkg.recipientName ? ` · ${pkg.recipientName}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ExportTextButton title={pkg.title} sections={sections} />
          <PrintButton />
        </div>
      </div>

      {canRefresh && (
        <div className="rounded-xl border border-sky-200 bg-sky-50 p-3 text-sm text-sky-900 print:hidden">
          <p className="font-medium">Keep this package in sync</p>
          <p className="mt-1 text-xs text-sky-800">
            {pkg.template === "DJ"
              ? "Refresh pulls the latest Music lists into this package."
              : "Refresh pulls the latest guest headcount and dietary notes."}
          </p>
          {pkg.lastRefreshedAt && (
            <p className="mt-1 text-xs text-sky-800">
              Last refreshed {formatStamp(pkg.lastRefreshedAt)}
              {pkg.lastRefreshedFrom ? ` from ${pkg.lastRefreshedFrom}` : ""}
            </p>
          )}
          <button
            type="button"
            disabled={saving}
            onClick={refreshFromSource}
            className="mt-2 rounded-lg border border-sky-300 bg-surface px-3 py-1.5 text-xs font-medium disabled:opacity-50"
          >
            Refresh from {sourceLabel}
          </button>
        </div>
      )}

      <div className="space-y-4 glass-panel rounded-2xl p-4 print:border-0 print:p-0">
        {Object.keys(sections).map((key) => (
          <label key={key} className="block text-sm">
            <span className="font-medium text-ink">{LABELS[key] || key}</span>
            <textarea
              rows={3}
              value={sections[key] || ""}
              onChange={(e) => setSections((s) => ({ ...s, [key]: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm print:border-0 print:p-0"
            />
          </label>
        ))}
      </div>

      {error && <p className="text-xs text-rose-600 print:hidden">{error}</p>}
      {info && <p className="text-xs text-emerald-700 print:hidden">{info}</p>}

      <div className="flex flex-wrap gap-2 print:hidden">
        <button
          type="button"
          onClick={toSend}
          disabled={saving}
          className="btn btn-primary"
        >
          {saving ? "Working…" : "Put on their packet"}
        </button>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="btn btn-ghost"
        >
          Save
        </button>
        <button
          type="button"
          onClick={share}
          disabled={saving}
          className="text-xs text-muted underline"
        >
          Make the old /p link
        </button>
      </div>

      {shareUrl && (
        <div className="glass-panel rounded-2xl p-4 text-sm print:hidden">
          <p className="kicker">Old door</p>
          <p className="mt-2 text-sm text-ink-soft">
            This /p link is archive. The live page is Send.
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <p className="break-all text-xs text-muted">{shareUrl}</p>
            <CopyButton value={shareUrl} label="Copy old link" />
          </div>
        </div>
      )}
    </div>
  );
}
