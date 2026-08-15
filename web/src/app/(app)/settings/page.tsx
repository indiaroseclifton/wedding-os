"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SettingsPage() {
  const router = useRouter();
  const [msg, setMsg] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [busy, setBusy] = useState(false);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    // Clear demo cookie client-side as well
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
      setMsg("This wipes local sample data and reseeds. Click again to confirm.");
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
        <p className="mt-1 text-sm text-slate-600">Demo session and sample data.</p>
      </div>

      <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 text-sm">
        <p className="font-medium">Session</p>
        <p className="text-slate-600">
          Demo auth uses Alex / Jordan cookies. Log out to switch users.
        </p>
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
          Adds a few guests, vendors, and tasks once per local data folder.
        </p>
        <button
          type="button"
          onClick={seed}
          className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white"
        >
          Load sample data
        </button>
        <p className="pt-2 text-slate-600">
          Reset wipes the local data folder and reseeds. Use this after a messy
          demo — do not force-seed without a wipe (that duplicates rows).
        </p>
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
      </div>
    </div>
  );
}
