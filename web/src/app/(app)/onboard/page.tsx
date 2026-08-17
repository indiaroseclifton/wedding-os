"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FAITHS } from "@/lib/preferences";
import { ENTER_CARDS, SHAPE_CARDS, type EnterHow, type WeddingShape } from "@/lib/shape";
import { Icon } from "@/components/icons";

const STEPS = ["Shape", "Enter", "When", "Where", "Faith", "Make"];

export default function OnboardPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [shape, setShape] = useState<WeddingShape>("weekend");
  const [enterHow, setEnterHow] = useState<EnterHow | "">("");
  const [weddingDate, setWeddingDate] = useState("");
  const [gatheringDate, setGatheringDate] = useState("");
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
        if (d.meta.shape) setShape(d.meta.shape);
        if (d.meta.enterHow) setEnterHow(d.meta.enterHow);
        if (d.meta.weddingDate) setWeddingDate(d.meta.weddingDate);
        if (d.meta.gatheringDate) setGatheringDate(d.meta.gatheringDate);
        if (d.meta.location) setLocation(d.meta.location);
        if (d.meta.faith) setFaith(d.meta.faith);
        if (d.meta.diyBias) setDiyBias(d.meta.diyBias);
      })
      .catch(() => {});
  }, [router]);

  async function finish(next = "/start") {
    setBusy(true);
    setMsg(null);
    const res = await fetch("/api/workspace", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        shape,
        enterHow: enterHow || "together",
        weddingDate,
        gatheringDate: shape === "two" ? gatheringDate : undefined,
        location,
        faith,
        diyBias,
        onboarded: true,
        applyShapeDefaults: true,
      }),
    });
    setBusy(false);
    if (!res.ok) {
      setMsg("Could not save");
      return;
    }
    router.push(next);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 py-6">
      <div>
        <p className="kicker kicker-moss">The desk follows this</p>
        <h1 className="mt-2 font-serif text-4xl sm:text-5xl">What kind of day is it?</h1>
        <p className="mt-2 max-w-lg text-sm text-muted">
          Not a theme. Whether there’s an aisle, a dinner, or just the two of you. Everything else reads this.
        </p>
      </div>

      <ol className="flex gap-2">
        {STEPS.map((s, i) => (
          <li key={s} className={`h-1 flex-1 rounded-full ${i <= step ? "bg-moss" : "bg-line"}`} />
        ))}
      </ol>

      {step === 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {SHAPE_CARDS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setShape(c.id)}
              className={`overflow-hidden rounded-[1.4rem] border text-left transition ${
                shape === c.id ? "border-moss ring-2 ring-moss/30" : "border-line"
              }`}
            >
              <img src={c.cover} alt="" className="h-32 w-full object-cover" />
              <div className="bg-surface px-4 py-3">
                <p className="font-serif text-2xl leading-tight">{c.title}</p>
                <p className="mt-1 text-xs text-muted">{c.line}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {step === 1 && (
        <div className="space-y-3">
          <p className="text-sm font-medium">How do you enter?</p>
          <p className="text-xs text-muted">Pick one. We will not assume an aisle.</p>
          {ENTER_CARDS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setEnterHow(c.id)}
              className={`w-full rounded-2xl border px-4 py-4 text-left ${
                enterHow === c.id ? "border-moss bg-moss-soft" : "border-line bg-surface"
              }`}
            >
              <p className="font-serif text-xl">{c.title}</p>
              <p className="mt-1 text-xs text-muted">{c.line}</p>
            </button>
          ))}
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <label className="block space-y-2">
            <span className="flex items-center gap-2 text-sm font-medium">
              <Icon name="calendar" /> {shape === "two" ? "When do you marry?" : "When is the day?"}
            </span>
            <input
              type="date"
              value={weddingDate}
              onChange={(e) => setWeddingDate(e.target.value)}
              className="w-full rounded-xl border border-line bg-surface px-3 py-3"
            />
          </label>
          {shape === "two" && (
            <label className="block space-y-2">
              <span className="text-sm font-medium">When do you gather?</span>
              <input
                type="date"
                value={gatheringDate}
                onChange={(e) => setGatheringDate(e.target.value)}
                className="w-full rounded-xl border border-line bg-surface px-3 py-3"
              />
            </label>
          )}
        </div>
      )}

      {step === 3 && (
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

      {step === 4 && (
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

      {step === 5 && (
        <div className="space-y-3">
          <p className="flex items-center gap-2 text-sm font-medium">
            <Icon name="flower" /> Hire the work, or make it?
          </p>
          {(
            [
              ["hire", "Hire vendors", "We’ll point you at the people this day actually needs."],
              ["diy", "Mostly DIY", "Playbooks and lists — no fake ballroom."],
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
          <button type="button" onClick={() => setStep((s) => s - 1)} className="min-h-11 rounded-full border border-line px-4 text-sm">
            Back
          </button>
        )}
        {step < 5 ? (
          <button
            type="button"
            onClick={() => {
              if (step === 1 && !enterHow) {
                setMsg("Pick how you enter — we will not assume an aisle.");
                return;
              }
              setMsg(null);
              setStep((s) => s + 1);
            }}
            className="min-h-11 rounded-full bg-moss px-5 text-sm font-medium text-moss-fg"
          >
            Continue
          </button>
        ) : (
          <>
          <button
            type="button"
            disabled={busy}
            onClick={() => finish("/start")}
            className="min-h-11 rounded-full bg-moss px-5 text-sm font-medium text-moss-fg disabled:opacity-50"
          >
            {busy ? "Building…" : "Open my desk"}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => finish("/planning/vision?walk=1")}
            className="min-h-11 rounded-full border border-line px-5 text-sm"
          >
            Look first
          </button>
          </>
        )}
        <button
          type="button"
          onClick={() => {
            fetch("/api/workspace", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ onboarded: true }),
            }).then(() => router.push("/start"));
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
