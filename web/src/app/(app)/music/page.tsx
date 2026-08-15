"use client";

import { useEffect, useState } from "react";

export default function MusicPage() {
  const [mustPlay, setMustPlay] = useState("");
  const [doNotPlay, setDoNotPlay] = useState("");
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/music")
      .then((r) => r.json())
      .then((d) => {
        if (d.music) {
          setMustPlay((d.music.mustPlay || []).join("\n"));
          setDoNotPlay((d.music.doNotPlay || []).join("\n"));
          setNotes(d.music.notes || "");
        }
      })
      .catch(() => {});
  }, []);

  async function save() {
    setSaved(false);
    await fetch("/api/music", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mustPlay: mustPlay.split("\n").map((s) => s.trim()).filter(Boolean),
        doNotPlay: doNotPlay.split("\n").map((s) => s.trim()).filter(Boolean),
        notes,
      }),
    });
    setSaved(true);
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Music</h1>
        <p className="mt-1 text-sm text-slate-600">Must-play and do-not-play for the DJ handoff.</p>
      </div>
      <label className="block text-sm">
        <span className="font-medium">Must-play (one per line)</span>
        <textarea rows={5} value={mustPlay} onChange={(e) => setMustPlay(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      </label>
      <label className="block text-sm">
        <span className="font-medium">Do-not-play (one per line)</span>
        <textarea rows={4} value={doNotPlay} onChange={(e) => setDoNotPlay(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      </label>
      <label className="block text-sm">
        <span className="font-medium">Notes</span>
        <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      </label>
      <button type="button" onClick={save} className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white">
        Save
      </button>
      {saved && <p className="text-xs text-emerald-700">Saved. You can pull these into a DJ handoff package.</p>}
    </div>
  );
}
