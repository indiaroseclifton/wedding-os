"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const TEMPLATES = [
  { id: "DJ", label: "DJ / Band", title: "DJ package" },
  { id: "CATERING", label: "Catering", title: "Catering package" },
  { id: "DAY_OF", label: "Day-of / planner", title: "Day-of package" },
  { id: "PHOTOGRAPHER", label: "Photographer", title: "Photo package" },
  { id: "FLORIST", label: "Florist", title: "Florist package" },
  { id: "PLANNER", label: "Planner", title: "Planner package" },
  { id: "HMU", label: "Hair / makeup", title: "HMU package" },
  { id: "CAKE", label: "Cake", title: "Cake package" },
  { id: "TRANSPORT", label: "Transportation", title: "Transport package" },
  { id: "VENUE", label: "Venue", title: "Venue package" },
];

export default function NewHandoffPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [template, setTemplate] = useState("DJ");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/handoffs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template: form.get("template"),
          title: form.get("title"),
          recipientName: form.get("recipientName") || undefined,
          recipientEmail: form.get("recipientEmail") || undefined,
          prefillFromMusic: form.get("prefillFromMusic") === "on",
          prefillFromGuests: form.get("prefillFromGuests") === "on",
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Could not create");
      }
      const data = await res.json();
      router.push(`/handoffs/${data.package.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">New handoff package</h1>
        <p className="mt-1 text-sm text-slate-600">
          DJ pulls from Music; Catering pulls dietary notes from Guests.
        </p>
      </div>
      <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
        <label className="block text-sm">
          <span className="font-medium">Template</span>
          <select
            name="template"
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            {TEMPLATES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="font-medium">Title</span>
          <input name="title" required defaultValue="Handoff package" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </label>
        <label className="block text-sm">
          <span className="font-medium">Recipient name</span>
          <input name="recipientName" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </label>
        <label className="block text-sm">
          <span className="font-medium">Recipient email</span>
          <input name="recipientEmail" type="email" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </label>
        {template === "DJ" && (
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="prefillFromMusic" defaultChecked />
            <span>Prefill from Music</span>
          </label>
        )}
        {template === "CATERING" && (
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="prefillFromGuests" defaultChecked />
            <span>Prefill headcount & dietary from Guests</span>
          </label>
        )}
        {error && <p className="text-xs text-rose-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-slate-900 px-3 py-2.5 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? "Creating…" : "Create package"}
        </button>
      </form>
    </div>
  );
}
