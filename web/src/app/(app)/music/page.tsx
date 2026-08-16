"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { TrackPreview } from "@/components/music/TrackPreview";

type Request = { id: string; song: string; from?: string; status: string };
type Track = {
  title: string;
  artist: string;
  uri?: string;
  url?: string;
  appleId?: string;
  source?: string;
  previewUrl?: string;
};

declare global {
  interface Window {
    MusicKit?: {
      configure: (c: { developerToken: string; app: { name: string; build: string } }) => Promise<unknown>;
      getInstance: () => { authorize: () => Promise<string> };
    };
  }
}

async function loadMusicKit() {
  if (window.MusicKit) return;
  await new Promise<void>((resolve, reject) => {
    const done = () => resolve();
    document.addEventListener("musickitloaded", done, { once: true });
    const s = document.createElement("script");
    s.src = "https://js-cdn.music.apple.com/musickit/v3/musickit.js";
    s.async = true;
    s.onerror = () => reject(new Error("Could not load Apple Music"));
    document.head.appendChild(s);
    window.setTimeout(() => {
      if (window.MusicKit) resolve();
    }, 2500);
  });
}

function MusicInner() {
  const params = useSearchParams();
  const [mustPlay, setMustPlay] = useState("");
  const [doNotPlay, setDoNotPlay] = useState("");
  const [notes, setNotes] = useState("");
  const [requests, setRequests] = useState<Request[]>([]);
  const [reqSong, setReqSong] = useState("");
  const [reqFrom, setReqFrom] = useState("");
  const [saved, setSaved] = useState(false);
  const [configured, setConfigured] = useState(false);
  const [appleConfigured, setAppleConfigured] = useState(false);
  const [connected, setConnected] = useState(false);
  const [appleConnected, setAppleConnected] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [playlistUrl, setPlaylistUrl] = useState("");
  const [applePlaylistUrl, setApplePlaylistUrl] = useState("");
  const [catalog, setCatalog] = useState<"spotify" | "apple">("spotify");
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<Track[]>([]);
  const [listening, setListening] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/music");
    if (!res.ok) return;
    const d = await res.json();
    setConfigured(Boolean(d.spotifyConfigured));
    setAppleConfigured(Boolean(d.appleConfigured));
    if (d.music) {
      setMustPlay((d.music.mustPlay || []).join("\n"));
      setDoNotPlay((d.music.doNotPlay || []).join("\n"));
      setNotes(d.music.notes || "");
      setRequests(d.music.requests || []);
      setConnected(Boolean(d.music.spotify?.connected));
      setDisplayName(d.music.spotify?.displayName || "");
      setPlaylistUrl(d.music.spotify?.playlistUrl || "");
      setAppleConnected(Boolean(d.music.appleMusic?.connected));
      setApplePlaylistUrl(d.music.appleMusic?.playlistUrl || "");
    }
    if (!d.spotifyConfigured && d.appleConfigured) setCatalog("apple");
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const flag = params.get("spotify");
    if (flag === "connected") setMsg("Spotify connected");
    if (flag === "denied") setMsg("Spotify access was declined");
    if (flag === "error" || flag === "token" || flag === "state") setMsg("Could not finish Spotify login");
    if (flag === "missing") setMsg("Add Spotify keys in Vercel first — see Integrations");
  }, [params]);

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

  async function search(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim().length < 2) return;
    setBusy(true);
    setMsg(null);
    const res = await fetch(
      catalog === "apple"
        ? `/api/integrations/apple-music/search?q=${encodeURIComponent(query)}`
        : `/api/integrations/spotify/search?q=${encodeURIComponent(query)}`
    );
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setMsg(data.error || "Search failed");
      return;
    }
    setHits(data.tracks || []);
    setListening(null);
  }

  async function addTrack(t: Track, ban = false) {
    const res = await fetch("/api/music", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        ban
          ? { action: "ban_line", line: `${t.title} — ${t.artist}` }
          : { action: "add_track", ...t }
      ),
    });
    if (res.ok) load();
  }

  async function exportPlaylist() {
    setBusy(true);
    setMsg(null);
    const res = await fetch("/api/integrations/spotify/export", { method: "POST" });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setMsg(data.error || "Export failed");
      return;
    }
    setPlaylistUrl(data.playlistUrl || "");
    setMsg(`Wrote ${data.tracks} tracks to Spotify`);
    load();
  }

  async function connectApple() {
    setBusy(true);
    setMsg(null);
    try {
      const tokenRes = await fetch("/api/integrations/apple-music/token");
      const tokenData = await tokenRes.json().catch(() => ({}));
      if (!tokenRes.ok) throw new Error(tokenData.error || "No Apple developer token");
      await loadMusicKit();
      if (!window.MusicKit) throw new Error("Apple Music didn’t load in this browser");
      await window.MusicKit.configure({
        developerToken: tokenData.token,
        app: { name: "Wedding OS", build: "1" },
      });
      const userToken = await window.MusicKit.getInstance().authorize();
      const res = await fetch("/api/integrations/apple-music/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userToken }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not save Apple Music");
      setMsg("Apple Music connected");
      load();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Apple Music connect failed");
    } finally {
      setBusy(false);
    }
  }

  async function exportApple() {
    setBusy(true);
    setMsg(null);
    const res = await fetch("/api/integrations/apple-music/export", { method: "POST" });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setMsg(data.error || "Export failed");
      return;
    }
    setApplePlaylistUrl(data.playlistUrl || "");
    setMsg(`Wrote ${data.tracks} tracks to Apple Music`);
    load();
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
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-moss">DJ packet</p>
        <h1 className="mt-1 text-2xl font-medium tracking-tight">Music</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Search Spotify or Apple Music, preview in this page, then lock must-play / do-not-play.
        </p>
      </div>

      <div className="rounded-xl border border-line bg-surface p-4">
        <p className="text-sm font-semibold">Spotify</p>
        {!configured ? (
          <p className="mt-2 text-sm text-ink-soft">
            Add <code className="text-xs">SPOTIFY_CLIENT_ID</code> and{" "}
            <code className="text-xs">SPOTIFY_CLIENT_SECRET</code> in Vercel, then come back.{" "}
            <Link href="/integrations" className="underline">
              How
            </Link>
          </p>
        ) : connected ? (
          <div className="mt-2 space-y-2 text-sm">
            <p className="text-ink-soft">Connected as {displayName || "your account"}.</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={exportPlaylist}
                className="rounded-lg bg-moss px-3 py-2 text-xs font-medium text-moss-fg disabled:opacity-50"
              >
                {busy ? "Writing…" : playlistUrl ? "Update playlist" : "Export must-play"}
              </button>
              {playlistUrl && (
                <a href={playlistUrl} target="_blank" rel="noreferrer" className="rounded-lg border border-line px-3 py-2 text-xs font-medium">
                  Open playlist
                </a>
              )}
              <button
                type="button"
                onClick={async () => {
                  await fetch("/api/integrations/spotify/disconnect", { method: "POST" });
                  load();
                }}
                className="px-1 py-2 text-xs underline"
              >
                Disconnect
              </button>
            </div>
          </div>
        ) : (
          <a
            href="/api/integrations/spotify/start"
            className="mt-3 inline-block rounded-lg bg-moss px-3 py-2 text-xs font-medium text-moss-fg"
          >
            Connect Spotify
          </a>
        )}
        {msg && <p className="mt-2 text-xs text-muted">{msg}</p>}
      </div>

      <div className="rounded-xl border border-line bg-surface p-4">
        <p className="text-sm font-semibold">Apple Music</p>
        {!appleConfigured ? (
          <p className="mt-2 text-sm text-ink-soft">
            Add MusicKit keys in Vercel, then connect.{" "}
            <Link href="/integrations" className="underline">
              How
            </Link>
          </p>
        ) : appleConnected ? (
          <div className="mt-2 space-y-2 text-sm">
            <p className="text-ink-soft">Connected. Export writes a library playlist.</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={exportApple}
                className="rounded-lg bg-moss px-3 py-2 text-xs font-medium text-moss-fg disabled:opacity-50"
              >
                {busy ? "Writing…" : applePlaylistUrl ? "Export again" : "Export must-play"}
              </button>
              {applePlaylistUrl && (
                <a
                  href={applePlaylistUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border border-line px-3 py-2 text-xs font-medium"
                >
                  Open playlist
                </a>
              )}
              <button
                type="button"
                onClick={async () => {
                  await fetch("/api/integrations/apple-music/disconnect", { method: "POST" });
                  load();
                }}
                className="px-1 py-2 text-xs underline"
              >
                Disconnect
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            disabled={busy}
            onClick={connectApple}
            className="mt-3 rounded-lg bg-moss px-3 py-2 text-xs font-medium text-moss-fg disabled:opacity-50"
          >
            {busy ? "Connecting…" : "Connect Apple Music"}
          </button>
        )}
      </div>

      {(configured || appleConfigured) && (
        <form onSubmit={search} className="space-y-2 rounded-xl border border-line bg-surface p-4">
          <p className="text-sm font-semibold">Search the catalog</p>
          <div className="flex gap-2">
            {configured && (
              <button
                type="button"
                onClick={() => setCatalog("spotify")}
                className={`rounded-full px-3 py-1 text-[11px] font-medium ${
                  catalog === "spotify" ? "bg-moss text-moss-fg" : "border border-line"
                }`}
              >
                Spotify
              </button>
            )}
            {appleConfigured && (
              <button
                type="button"
                onClick={() => setCatalog("apple")}
                className={`rounded-full px-3 py-1 text-[11px] font-medium ${
                  catalog === "apple" ? "bg-moss text-moss-fg" : "border border-line"
                }`}
              >
                Apple
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Song or artist"
              className="min-w-0 flex-1 rounded-lg border border-line px-3 py-2 text-sm"
            />
            <button
              type="submit"
              disabled={busy}
              className="rounded-lg border border-line px-3 py-2 text-xs font-medium"
            >
              Search
            </button>
          </div>
          <ul className="divide-y divide-line">
            {hits.map((t) => {
              const key = t.uri || t.appleId || `${t.title}-${t.artist}`;
              return (
                <li key={key} className="space-y-2 py-3 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-medium">{t.title}</p>
                      <p className="text-xs text-muted">{t.artist}</p>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => addTrack(t)} className="text-xs font-medium underline">
                        Must-play
                      </button>
                      <button type="button" onClick={() => addTrack(t, true)} className="text-xs text-muted underline">
                        Ban
                      </button>
                    </div>
                  </div>
                  <TrackPreview
                    previewUrl={t.previewUrl}
                    uri={t.uri}
                    url={t.url}
                    open={listening === key}
                    onToggle={() => setListening((cur) => (cur === key ? null : key))}
                  />
                </li>
              );
            })}
          </ul>
        </form>
      )}

      <label className="block text-sm">
        <span className="font-medium">Must-play (one per line)</span>
        <textarea
          rows={5}
          value={mustPlay}
          onChange={(e) => setMustPlay(e.target.value)}
          className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm"
        />
      </label>
      <label className="block text-sm">
        <span className="font-medium">Do-not-play (one per line)</span>
        <textarea
          rows={4}
          value={doNotPlay}
          onChange={(e) => setDoNotPlay(e.target.value)}
          className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm"
        />
      </label>
      <label className="block text-sm">
        <span className="font-medium">Notes</span>
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm"
        />
      </label>
      <button
        type="button"
        onClick={save}
        className="rounded-lg bg-moss px-4 py-2.5 text-sm font-medium text-moss-fg"
      >
        Save lists
      </button>
      {saved && (
        <p className="text-xs text-moss">Saved. Refresh a DJ handoff to pull the latest lists.</p>
      )}

      <div className="rounded-xl border border-line bg-surface p-4">
        <p className="text-sm font-semibold">Guest song requests</p>
        <form onSubmit={addRequest} className="mt-3 space-y-2">
          <input
            value={reqSong}
            onChange={(e) => setReqSong(e.target.value)}
            required
            placeholder="Song / artist"
            className="w-full rounded-lg border border-line px-3 py-2 text-sm"
          />
          <input
            value={reqFrom}
            onChange={(e) => setReqFrom(e.target.value)}
            placeholder="Requested by (optional)"
            className="w-full rounded-lg border border-line px-3 py-2 text-sm"
          />
          <button type="submit" className="rounded-lg border border-line px-3 py-2 text-xs font-medium">
            Add request
          </button>
        </form>
        <ul className="mt-4 divide-y divide-line">
          {requests.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
              <div>
                <p className="font-medium">{r.song}</p>
                <p className="text-xs text-muted">
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
                    className="text-xs text-muted underline"
                  >
                    Decline
                  </button>
                </div>
              )}
            </li>
          ))}
          {!requests.length && (
            <li className="py-4 text-center text-xs text-muted">No requests yet</li>
          )}
        </ul>
      </div>
    </div>
  );
}

export default function MusicPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted">Loading…</p>}>
      <MusicInner />
    </Suspense>
  );
}
