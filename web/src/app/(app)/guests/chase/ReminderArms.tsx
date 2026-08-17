"use client";

import { useEffect, useState } from "react";

type Arms = {
  digest: boolean;
  digestTo?: string;
  autoRsvp: boolean;
  autoAddress: boolean;
  lastDigestAt?: string;
  lastTickAt?: string;
};

export function ReminderArms() {
  const [arms, setArms] = useState<Arms | null>(null);
  const [to, setTo] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/remind")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data?.arms) return;
        setArms(data.arms);
        setTo(data.arms.digestTo || "");
      });
  }, []);

  async function save(patch: Partial<Arms>) {
    const res = await fetch("/api/remind", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) setArms(data.arms);
  }

  async function runNow() {
    setBusy(true);
    setMsg(null);
    const res = await fetch("/api/remind", { method: "POST" });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setMsg(data.error || "Could not run");
      return;
    }
    setMsg(
      `Digest: ${data.digest}. Follow-up RSVPs: ${data.rsvp}. Addresses: ${data.address}.`
    );
    const next = await fetch("/api/remind").then((r) => r.json());
    if (next?.arms) setArms(next.arms);
  }

  if (!arms) return null;

  return (
    <section className="panel space-y-4 p-5">
      <div>
        <p className="kicker kicker-moss">The clock</p>
        <h2 className="mt-1 font-serif text-2xl">What goes out without a click</h2>
        <p className="mt-1 text-sm text-muted">
          First invite stays yours. The tick runs in the morning and uses the same rules as Send.
        </p>
      </div>
      <label className="flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          className="mt-1"
          checked={arms.digest}
          onChange={(e) => save({ digest: e.target.checked })}
        />
        <span>
          <span className="font-medium">Desk digest to us</span>
          <span className="mt-0.5 block text-xs text-muted">
            What next, overdue pay, After — once a day. Not to guests.
          </span>
        </span>
      </label>
      <label className="block text-sm">
        Where to send it
        <input
          type="email"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          onBlur={() => save({ digestTo: to })}
          placeholder="you@yourmail.com"
          className="field mt-1"
        />
      </label>
      <label className="flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          className="mt-1"
          checked={arms.autoRsvp}
          onChange={(e) => save({ autoRsvp: e.target.checked })}
        />
        <span>
          <span className="font-medium">Second RSVP on its own</span>
          <span className="mt-0.5 block text-xs text-muted">
            Only after you’ve sent the first, or they’re a maybe / silent yes. Same 5- then 10-day wait.
          </span>
        </span>
      </label>
      <label className="flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          className="mt-1"
          checked={arms.autoAddress}
          onChange={(e) => save({ autoAddress: e.target.checked })}
        />
        <span>
          <span className="font-medium">Need an address</span>
          <span className="mt-0.5 block text-xs text-muted">Said yes, no street and city.</span>
        </span>
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" disabled={busy} onClick={runNow} className="btn btn-ghost min-h-11">
          {busy ? "Running…" : "Run the tick now"}
        </button>
        {arms.lastTickAt ? (
          <p className="text-xs text-muted">Last tick {new Date(arms.lastTickAt).toLocaleString()}</p>
        ) : (
          <p className="text-xs text-muted">Hasn’t run yet.</p>
        )}
      </div>
      {msg ? <p className="text-sm text-ink-soft">{msg}</p> : null}
    </section>
  );
}
