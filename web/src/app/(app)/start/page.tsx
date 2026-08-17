"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const STEPS = ["People", "One vendor", "Publish"];

export default function StartPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [names, setNames] = useState("");
  const [vendor, setVendor] = useState("");
  const [category, setCategory] = useState("Venue");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function post(body: Record<string, unknown>) {
    setBusy(true);
    setMsg(null);
    const res = await fetch("/api/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setMsg(data.error || "Could not save");
      return null;
    }
    return data;
  }

  return (
    <div className="mx-auto max-w-lg space-y-8 py-6">
      <div>
        <p className="kicker kicker-moss">First wedding</p>
        <h1 className="mt-2 font-serif text-4xl">Three things. Then the desk is yours.</h1>
        <p className="mt-2 text-sm text-muted">
          Names, someone you’ve hired, and a site you can text. Or{" "}
          <a href="/planning/vision?walk=1" className="underline">
            look first
          </a>{" "}
          if the words aren’t there yet.
        </p>
      </div>
      <ol className="flex gap-2">
        {STEPS.map((s, i) => (
          <li key={s} className={`h-1 flex-1 rounded-full ${i <= step ? "bg-moss" : "bg-line"}`} />
        ))}
      </ol>

      {step === 0 && (
        <label className="block space-y-2">
          <span className="text-sm font-medium">Who’s invited? One name per line.</span>
          <textarea
            value={names}
            onChange={(e) => setNames(e.target.value)}
            rows={8}
            placeholder={"Maya Chen\nJordan Hale + Sam\nAunt May"}
            className="w-full rounded-2xl border border-line bg-surface px-3 py-3 text-sm"
          />
          <p className="text-xs text-muted">Add a plus-one later by opening the guest. Ten is plenty to start.</p>
        </label>
      )}

      {step === 1 && (
        <div className="space-y-3">
          <p className="text-sm font-medium">One person you’ve already hired — or will.</p>
          <input
            value={vendor}
            onChange={(e) => setVendor(e.target.value)}
            placeholder="Oak & Lantern"
            className="w-full rounded-xl border border-line bg-surface px-3 py-3 text-sm"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-xl border border-line bg-surface px-3 py-3 text-sm"
          >
            {["Venue", "Photographer", "Florist", "Catering", "DJ / Band", "Planner"].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
      )}

      {step === 2 && (
        <p className="text-sm leading-6 text-ink-soft">
          We’ll publish a simple guest page with your names. If this day is just the two of you, it’s an announcement — no RSVP. You can dress it later.
        </p>
      )}

      {msg && <p className="text-xs text-clay">{msg}</p>}

      <div className="flex flex-wrap gap-2">
        {step === 0 && (
          <button
            type="button"
            disabled={busy}
            onClick={async () => {
              const ok = await post({ action: "guests", names });
              if (ok) setStep(1);
            }}
            className="rounded-full bg-moss px-5 py-2 text-sm font-medium text-moss-fg disabled:opacity-50"
          >
            {busy ? "Saving…" : "Save names"}
          </button>
        )}
        {step === 1 && (
          <button
            type="button"
            disabled={busy}
            onClick={async () => {
              const ok = await post({ action: "vendor", name: vendor, category });
              if (ok) setStep(2);
            }}
            className="rounded-full bg-moss px-5 py-2 text-sm font-medium text-moss-fg disabled:opacity-50"
          >
            {busy ? "Saving…" : "Add vendor"}
          </button>
        )}
        {step === 2 && (
          <button
            type="button"
            disabled={busy}
            onClick={async () => {
              const data = await post({ action: "publish" });
              if (data?.token) router.push(`/w/${data.token}`);
              else if (data) router.push("/dashboard");
            }}
            className="rounded-full bg-moss px-5 py-2 text-sm font-medium text-moss-fg disabled:opacity-50"
          >
            {busy ? "Publishing…" : "Publish the site"}
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            fetch("/api/start", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "skip" }),
            }).then(() => router.push("/dashboard"));
          }}
          className="text-xs text-muted underline"
        >
          Skip — I’ll wander
        </button>
      </div>
    </div>
  );
}
