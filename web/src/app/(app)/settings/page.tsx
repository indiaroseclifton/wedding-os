"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SettingsPage() {
  const router = useRouter();
  const [msg, setMsg] = useState<string | null>(null);

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
        {msg && <p className="text-xs text-slate-500">{msg}</p>}
      </div>
    </div>
  );
}
