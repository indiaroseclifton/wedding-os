"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FAITHS } from "@/lib/preferences";
import { Icon } from "@/components/icons";

const STEPS = ["When", "Where", "Faith", "Make or hire"];

export default function OnboardPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [weddingDate, setWeddingDate] = useState("");
  const [location, setLocation] = useState("");
  const [faith, setFaith] = useState("none");
  const [diyBias, setDiyBias] = useState<"hire" | "diy" | "mix">("mix");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/workspace")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d?.meta) return;
        if (d.meta.onboarded) router.replace("/dashboard");
        if (d.meta.weddingDate) setWeddingDate(d.meta.weddingDate);
        if (d.meta.location) setLocation(d.meta.location);
        if (d.meta.faith) setFaith(d.meta.faith);
        if (d.meta.diyBias) setDiyBias(d.meta.diyBias);
      })
      .catch(() => {});
  }, [router]);

  async function finish() {
    setBusy(true);
    setMsg(null);
    const res = await fetch("/api/workspace", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        weddingDate,
        location,
        faith,
        diyBias,
        onboarded: true,
      }),
    });
    setBusy(false);
    if (!res.ok) {
      setMsg("Could not save");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-lg space-y-8 py-6">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-moss">Four questions</p>
        <h1 className="mt-2 font-serif text-4xl">We’ll build the desk around this.</h1>
        <p className="mt-2 text-sm text-muted">
          Date, city, tradition, and whether you’re hiring or making. The checklist and vendors follow.
        </p>
      </div>

      <ol className="flex gap-2">
        {STEPS.map((s, i) => (
          <li
            key={s}
            className={`h-1 flex-1 rounded-full ${i <= step ? "bg-moss" : "bg-line"}`}
          />
        ))}
      </ol>

      {step === 0 && (
        <label className="block space-y-2">
          <span className="flex items-center gap-2 text-sm font-medium">
            <Icon name="calendar" /> When is the day?
          </span>
          <input
            type="date"
            value={weddingDate}
            onChange={(e) => setWeddingDate(e.target.value)}
            className="w-full rounded-xl border border-line bg-surface px-3 py-3"
          />
        </label>
      )}
      {step === 1 && (
        <label className="block space-y-2">
          <span className="flex items-center gap-2 text-sm font-medium">
            <Icon name="pin" /> Which city?
          </span>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Atlanta, GA"
            className="w-full rounded-xl border border-line bg-surface px-3 py-3"
          />
        </label>
      )}
      {step === 2 && (
        <div className="space-y-3">
          <p className="flex items-center gap-2 text-sm font-medium">
            <Icon name="heart" /> Any religious or cultural ceremony?
          </p>
          <div className="grid grid-cols-2 gap-2">
            {FAITHS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFaith(f.id)}
                className={`rounded-xl border px-3 py-3 text-left text-sm ${
                  faith === f.id ? "border-moss bg-moss-soft" : "border-line bg-surface"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      )}
      {step === 3 && (
        <div className="space-y-3">
          <p className="flex items-center gap-2 text-sm font-medium">
            <Icon name="flower" /> Hire the work, or make it?
          </p>
          {(
            [
              ["hire", "Hire vendors", "We’ll point you at florists, cake, tables."],
              ["diy", "Mostly DIY", "Playbooks, lists, cost compare — like you did the flowers."],
              ["mix", "A mix", "Pick a lane per category later."],
            ] as const
          ).map(([id, title, line]) => (
            <button
              key={id}
              type="button"
              onClick={() => setDiyBias(id)}
              className={`w-full rounded-xl border px-4 py-4 text-left ${
                diyBias === id ? "border-moss bg-moss-soft" : "border-line bg-surface"
              }`}
            >
              <p className="font-medium">{title}</p>
              <p className="mt-1 text-xs text-muted">{line}</p>
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {step > 0 && (
          <button type="button" onClick={() => setStep((s) => s - 1)} className="rounded-full border border-line px-4 py-2 text-sm">
            Back
          </button>
        )}
        {step < 3 ? (
          <button
            type="button"
            onClick={() => setStep((s) => s + 1)}
            className="rounded-full bg-moss px-5 py-2 text-sm font-medium text-ivory"
          >
            Continue
          </button>
        ) : (
          <button
            type="button"
            disabled={busy}
            onClick={finish}
            className="rounded-full bg-moss px-5 py-2 text-sm font-medium text-ivory disabled:opacity-50"
          >
            {busy ? "Building…" : "Open my desk"}
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            fetch("/api/workspace", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ onboarded: true }),
            }).then(() => router.push("/dashboard"));
          }}
          className="text-xs text-muted underline"
        >
          Skip for now
        </button>
      </div>
      {msg && <p className="text-xs text-clay">{msg}</p>}
    </div>
  );
}
