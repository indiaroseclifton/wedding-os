"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { PrintButton } from "@/components/ui/PrintButton";
import { ExportTextButton } from "@/components/handoffs/ExportTextButton";

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
};

type Pkg = {
  id: string;
  title: string;
  template: string;
  status: string;
  recipientName?: string;
  sections: Record<string, string>;
  shareToken?: string;
};

export default function HandoffDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [pkg, setPkg] = useState<Pkg | null>(null);
  const [sections, setSections] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
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
  if (!pkg) return <p className="text-sm text-slate-600">Loading…</p>;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{pkg.title}</h1>
          <p className="mt-1 text-sm text-slate-600">
            {pkg.template.replace("_", " ")} · {pkg.status}
            {pkg.recipientName ? ` · ${pkg.recipientName}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ExportTextButton title={pkg.title} sections={sections} />
          <PrintButton />
        </div>
      </div>

      <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 print:border-0 print:p-0">
        {Object.keys(sections).map((key) => (
          <label key={key} className="block text-sm">
            <span className="font-medium text-slate-800">{LABELS[key] || key}</span>
            <textarea
              rows={3}
              value={sections[key] || ""}
              onChange={(e) => setSections((s) => ({ ...s, [key]: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm print:border-0 print:p-0"
            />
          </label>
        ))}
      </div>

      {error && <p className="text-xs text-rose-600 print:hidden">{error}</p>}

      <div className="flex flex-wrap gap-2 print:hidden">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save draft"}
        </button>
        <button
          type="button"
          onClick={share}
          disabled={saving}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800"
        >
          Share link
        </button>
      </div>

      {shareUrl && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm print:hidden">
          <p className="font-medium text-emerald-900">Share this link with your vendor</p>
          <p className="mt-2 break-all text-emerald-800">{shareUrl}</p>
        </div>
      )}
    </div>
  );
}
