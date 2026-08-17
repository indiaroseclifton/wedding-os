"use client";

import { useState } from "react";

export function SiteGate({ token }: { token: string }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/public/site/unlock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    setBusy(false);
    if (!res.ok) {
      setError("That password isn’t it.");
      return;
    }
    window.location.reload();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-5 text-ink">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 text-center">
        <p className="kicker kicker-moss">Private</p>
        <h1 className="font-serif text-4xl">This wedding is for invited guests.</h1>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="Password from the couple"
          className="w-full rounded-xl border border-line bg-surface px-3 py-3 text-sm"
        />
        {error && <p className="text-xs text-clay">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="rounded-full bg-moss px-5 py-2 text-sm font-medium text-ivory"
        >
          {busy ? "Checking…" : "Open"}
        </button>
      </form>
    </div>
  );
}
