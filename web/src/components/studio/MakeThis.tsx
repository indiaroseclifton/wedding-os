"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { INTENTS, TEMPLATES, type StudioIntent } from "@/lib/studio-project";

export function MakeThis() {
  const router = useRouter();
  const [intent, setIntent] = useState<StudioIntent>("recreate");
  const [templateId, setTemplateId] = useState(TEMPLATES[0].id);
  const [inspiration, setInspiration] = useState("");
  const [qty, setQty] = useState(12);
  const [budget, setBudget] = useState(750);
  const [title, setTitle] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [referenceName, setReferenceName] = useState("");
  const tmpl = TEMPLATES.find((t) => t.id === templateId) || TEMPLATES[0];

  function uploadReference(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) return setMsg("Choose an image file");
    if (file.size > 4_000_000) return setMsg("Keep the reference image under 4 MB");
    const reader = new FileReader();
    reader.onload = () => {
      setInspiration(String(reader.result || ""));
      setReferenceName(file.name);
      setMsg(null);
    };
    reader.readAsDataURL(file);
  }

  async function make() {
    setBusy(true);
    const res = await fetch("/api/studio/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "make", templateId, qty, title, inspiration, intent, budget }),
    });
    setBusy(false);
    if (!res.ok) {
      setMsg("Could not create the project");
      return;
    }
    const data = await res.json();
    const id = data.studio?.projects?.at(-1)?.id;
    if (intent === "style") {
      router.push("/planning/vision");
      return;
    }
    router.push(id ? `/studio/projects/${id}` : "/studio");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <p className="kicker">Studio</p>
        <h1 className="mt-2 font-serif text-[clamp(2.2rem,6vw,3.6rem)] leading-none tracking-tight">Make this</h1>
        <p className="home-script mt-2">See it. Spec it. Build it.</p>
        <p className="mt-2 text-sm text-muted">Upload the reference. Confirm or correct the closest starting recipe, then Vowfolk turns it into quantities, sourcing and build work.</p>
      </header>

      <section className="grid gap-4 rounded-[1.5rem] border border-line bg-surface p-5 sm:grid-cols-[13rem_minmax(0,1fr)]">
        <label className="flex min-h-52 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-line bg-paper text-center">
          {inspiration.startsWith("data:image/") ? <img src={inspiration} alt="Uploaded inspiration" className="h-full min-h-52 w-full object-cover" /> : <><span className="font-serif text-2xl">Add a photo</span><span className="mt-2 px-4 text-xs text-muted">JPG, PNG or WebP · up to 4 MB</span></>}
          <input type="file" accept="image/*" className="sr-only" onChange={(e) => uploadReference(e.target.files?.[0])} />
        </label>
        <div>
          <p className="kicker kicker-moss">1 · The reference</p>
          <p className="mt-2 font-serif text-2xl">{referenceName || "Photo or link"}</p>
          <label className="mt-4 block text-sm">
        <span className="kicker">Or paste a link / describe it</span>
        <textarea
          className="field mt-1 min-h-24"
          placeholder="Pinterest URL, or: low garden centerpiece, hydrangea and trailing green"
          value={inspiration.startsWith("data:image/") ? "" : inspiration}
          onChange={(e) => { setInspiration(e.target.value); setReferenceName(""); }}
        />
      </label>
        </div>
      </section>

      <div>
        <p className="kicker">What do you want to do with it?</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {INTENTS.map((i) => (
            <button
              key={i.id}
              type="button"
              onClick={() => setIntent(i.id)}
              className={`min-h-16 rounded-xl border px-3 py-2 text-left ${intent === i.id ? "border-ink bg-paper" : "border-line"}`}
            >
              <span className="block text-sm font-medium">{i.label}</span>
              <span className="block text-xs text-muted">{i.line}</span>
            </button>
          ))}
        </div>
      </div>

      {intent !== "style" ? (
        <>
          <div>
            <p className="kicker kicker-moss">2 · Confirm or correct our starting read</p>
            <p className="mt-2 text-sm text-muted">The first match is only a starting point. Pick the recipe that is actually closest to the reference.</p>
            <div className="mt-2 grid gap-2">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTemplateId(t.id)}
                  className={`min-h-14 rounded-xl border px-3 py-2 text-left ${templateId === t.id ? "border-ink bg-paper" : "border-line"}`}
                >
                  <span className="block text-sm font-medium">{t.title}</span>
                  <span className="block text-xs text-muted">{t.line}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="kicker">How many</span>
              <input type="number" min={1} className="field mt-1" value={qty} onChange={(e) => setQty(Number(e.target.value) || 1)} />
              <span className="mt-1 block text-xs text-muted">{tmpl.kind === "floral" ? "Arrangements" : "Pieces"}</span>
            </label>
            <label className="block text-sm">
              <span className="kicker">Budget for this</span>
              <input type="number" min={0} className="field mt-1" value={budget} onChange={(e) => setBudget(Number(e.target.value) || 0)} />
            </label>
          </div>
          <label className="block text-sm">
            <span className="kicker">Call it</span>
            <input className="field mt-1" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={tmpl.title} />
          </label>
        </>
      ) : (
        <p className="text-sm text-muted">We’ll take you to Vision to pin it. No shopping list until you choose Recreate.</p>
      )}

      <button type="button" disabled={busy} onClick={make} className="btn btn-primary">
        {intent === "style" ? "Pin to vision" : "Create the project"}
      </button>
      {msg ? <p className="text-xs text-muted">{msg}</p> : null}
    </div>
  );
}
