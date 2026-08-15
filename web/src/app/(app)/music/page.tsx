"use client";

import { useEffect, useState } from "react";

type Request = {
  id: string;
  song: string;
  from?: string;
  status: string;
};

export default function MusicPage() {
  const [mustPlay, setMustPlay] = useState("");
  const [doNotPlay, setDoNotPlay] = useState("");
  const [notes, setNotes] = useState("");
  const [requests, setRequests] = useState<Request[]>([]);
  const [reqSong, setReqSong] = useState("");
  const [reqFrom, setReqFrom] = useState("");
  const [saved, setSaved] = useState(false);

  async function load() {
    const res = await fetch("/api/music");
    if (!res.ok) return;
    const d = await res.json();
    if (d.music) {
      setMustPlay((d.music.mustPlay || []).join("\n"));
      setDoNotPlay((d.music.doNotPlay || []).join("\n"));
      setNotes(d.music.notes || "");
      setRequests(d.music.requests || []);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function save() {
    setSaved(false);
    await fetch("/api/music", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mustPlay: mustPlay
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
        doNotPlay: doNotPlay
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
        notes,
      }),
    });
    setSaved(true);
  }

  async function addRequest(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/music", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "request", song: reqSong, from: reqFrom }),
    });
    setReqSong("");
    setReqFrom("");
    load();
  }

  async function setStatus(id: string, status: string) {
    await fetch("/api/music", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "request_status", id, status }),
    });
    load();
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Music</h1>
        <p className="mt-1 text-sm text-slate-600">
          Must-play, do-not-play, and guest song requests for the DJ handoff.
        </p>
      </div>

      <label className="block text-sm">
        <span className="font-medium">Must-play (one per line)</span>
        <textarea
          rows={5}
          value={mustPlay}
          onChange={(e) => setMustPlay(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </label>
      <label className="block text-sm">
        <span className="font-medium">Do-not-play (one per line)</span>
        <textarea
          rows={4}
          value={doNotPlay}
          onChange={(e) => setDoNotPlay(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </label>
      <label className="block text-sm">
        <span className="font-medium">Notes</span>
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </label>
      <button
        type="button"
        onClick={save}
        className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white"
      >
        Save lists
      </button>
      {saved && (
        <p className="text-xs text-emerald-700">
          Saved. Refresh a DJ handoff to pull the latest lists.
        </p>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-sm font-semibold">Guest song requests</p>
        <form onSubmit={addRequest} className="mt-3 space-y-2">
          <input
            value={reqSong}
            onChange={(e) => setReqSong(e.target.value)}
            required
            placeholder="Song / artist"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            value={reqFrom}
            onChange={(e) => setReqFrom(e.target.value)}
            placeholder="Requested by (optional)"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <button type="submit" className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium">
            Add request
          </button>
        </form>
        <ul className="mt-4 divide-y divide-slate-100">
          {requests.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
              <div>
                <p className="font-medium">{r.song}</p>
                <p className="text-xs text-slate-500">
                  {r.from || "Guest"} · {r.status}
                </p>
              </div>
              {r.status === "PENDING" && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStatus(r.id, "ACCEPTED")}
                    className="text-xs font-medium underline"
                  >
                    Accept → must-play
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus(r.id, "DECLINED")}
                    className="text-xs text-slate-500 underline"
                  >
                    Decline
                  </button>
                </div>
              )}
            </li>
          ))}
          {!requests.length && (
            <li className="py-4 text-center text-xs text-slate-500">No requests yet</li>
          )}
        </ul>
      </div>
    </div>
  );
}
