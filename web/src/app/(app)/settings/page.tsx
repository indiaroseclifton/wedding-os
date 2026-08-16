"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const router = useRouter();
  const [msg, setMsg] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState("");
  const [coupleNames, setCoupleNames] = useState("");
  const [weddingDate, setWeddingDate] = useState("");
  const [location, setLocation] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/workspace")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data?.meta) return;
        setName(data.meta.name || "");
        setCoupleNames(data.meta.coupleNames || "");
        setWeddingDate(data.meta.weddingDate || "");
        setLocation(data.meta.location || "");
        setCoverUrl(data.meta.coverUrl || "");
      })
      .catch(() => {});
  }, []);

  async function saveDetails(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    const res = await fetch("/api/workspace", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, coupleNames, weddingDate, location, coverUrl }),
    });
    setSaving(false);
    if (!res.ok) {
      setMsg("Could not save wedding details");
      return;
    }
    setMsg("Wedding details saved");
    router.refresh();
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    document.cookie = "wedding_os_user=; Max-Age=0; path=/";
    router.push("/login");
    router.refresh();
  }

  async function seed() {
    const res = await fetch("/api/dev/seed", { method: "POST" });
    const data = await res.json().catch(() => ({}));
    setMsg(data.seeded ? "Sample data added" : "Already seeded (or failed)");
  }

  async function resetSample() {
    if (!confirmReset) {
      setConfirmReset(true);
      setMsg("This wipes sample data and reseeds. Click again to confirm.");
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/dev/seed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset" }),
      });
      const data = await res.json().catch(() => ({}));
      setMsg(data.seeded ? "Sample data reset" : "Reset failed");
      setConfirmReset(false);
      router.refresh();
    } catch {
      setMsg("Reset failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-slate-600">Your wedding, session, and sample data.</p>
      </div>

      <form onSubmit={saveDetails} className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 text-sm">
        <p className="font-medium">Wedding</p>
        <label className="block">
          <span className="text-xs font-medium text-slate-600">Wedding name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-slate-600">Couple names</span>
          <input
            value={coupleNames}
            onChange={(e) => setCoupleNames(e.target.value)}
            placeholder="India & …"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-medium text-slate-600">Date</span>
            <input
              type="date"
              value={weddingDate}
              onChange={(e) => setWeddingDate(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-slate-600">City</span>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Atlanta, GA"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
        </div>
        <label className="block">
          <span className="text-xs font-medium text-slate-600">Cover photo URL</span>
          <input
            value={coverUrl}
            onChange={(e) => setCoverUrl(e.target.value)}
            placeholder="A photo of you two — or leave the default"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save wedding details"}
        </button>
      </form>

      <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 text-sm">
        <p className="font-medium">Session</p>
        <p className="text-slate-600">Sign out to switch accounts or use a demo person.</p>
        <button
          type="button"
          onClick={logout}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium"
        >
          Log out
        </button>
      </div>

      <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 text-sm">
        <p className="font-medium">Sample data</p>
        <p className="text-slate-600">
          Adds a few guests, vendors, and tasks so you can click around. Reset wipes and reseeds.
        </p>
        <button
          type="button"
          onClick={seed}
          className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white"
        >
          Load sample data
        </button>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={resetSample}
            className="rounded-lg border border-rose-300 bg-white px-3 py-2 text-sm font-medium text-rose-800 disabled:opacity-50"
          >
            {confirmReset ? "Confirm reset" : "Reset sample data"}
          </button>
          {confirmReset && (
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setConfirmReset(false);
                setMsg(null);
              }}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium"
            >
              Cancel
            </button>
          )}
        </div>
        {msg && <p className="text-xs text-slate-500">{msg}</p>}
        <p className="pt-2 text-xs text-muted">
          <a href="/process" className="underline">
            Process notes
          </a>{" "}
          — just for you.
        </p>
      </div>
    </div>
  );
}
