import Link from "next/link";
import { INTEGRATIONS } from "@/lib/integrations/catalog";
import { appleMusicConfigured } from "@/lib/integrations/apple-music";
import { spotifyConfigured } from "@/lib/integrations/spotify";

export default function IntegrationsPage() {
  const spotifyReady = spotifyConfigured();
  const appleReady = appleMusicConfigured();

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-moss">Connect</p>
        <h1 className="mt-1 text-2xl font-medium tracking-tight">Integrations</h1>
        <p className="mt-2 text-sm text-ink-soft">
          Spotify, Apple Music, and weather are live. The rest wait on their own keys.
        </p>
      </div>

      <ul className="space-y-3">
        {INTEGRATIONS.map((item) => (
          <li key={item.id} className="rounded-xl border border-line bg-surface p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-ink">{item.name}</p>
                <p className="mt-1 text-sm text-ink-soft">{item.what}</p>
                <p className="mt-2 text-xs text-muted">{item.needs}</p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  item.status === "live"
                    ? "bg-moss-soft text-moss"
                    : item.status === "link-only"
                      ? "bg-slate-100 text-slate-600"
                      : "bg-amber-50 text-amber-900"
                }`}
              >
                {item.status === "live" ? "Live" : item.status === "link-only" ? "Link only" : "Next"}
              </span>
            </div>
            <Link href={item.href} className="mt-3 inline-block text-xs font-medium underline">
              Open
            </Link>
          </li>
        ))}
      </ul>

      <div className="rounded-xl border border-line bg-surface p-4 text-sm">
        <p className="font-medium">Turn on Spotify</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-ink-soft">
          <li>
            Create an app at{" "}
            <a href="https://developer.spotify.com/dashboard" className="underline" target="_blank" rel="noreferrer">
              developer.spotify.com/dashboard
            </a>
          </li>
          <li>
            Redirect URI:{" "}
            <code className="break-all text-xs">
              https://wedding-os-taupe.vercel.app/api/integrations/spotify/callback
            </code>
          </li>
          <li>
            In Vercel → wedding-os → Settings → Environment Variables, add{" "}
            <code className="text-xs">SPOTIFY_CLIENT_ID</code> and{" "}
            <code className="text-xs">SPOTIFY_CLIENT_SECRET</code> (Production).
          </li>
          <li>Redeploy, then Connect on the Music page.</li>
        </ol>
        <p className="mt-3 text-xs text-muted">
          Keys on this project: {spotifyReady ? "present — you can connect." : "not set yet."}
        </p>
      </div>

      <div className="rounded-xl border border-line bg-surface p-4 text-sm">
        <p className="font-medium">Turn on Apple Music</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-ink-soft">
          <li>
            In{" "}
            <a
              href="https://developer.apple.com/account/resources/identifiers/list/mediaId"
              className="underline"
              target="_blank"
              rel="noreferrer"
            >
              Apple Developer → Identifiers
            </a>
            , create a MusicKit identifier and a key.
          </li>
          <li>
            In Vercel add <code className="text-xs">APPLE_MUSIC_TEAM_ID</code>,{" "}
            <code className="text-xs">APPLE_MUSIC_KEY_ID</code>, and{" "}
            <code className="text-xs">APPLE_MUSIC_PRIVATE_KEY</code> (the .p8, newlines as{" "}
            <code className="text-xs">\n</code>).
          </li>
          <li>Optional: <code className="text-xs">APPLE_MUSIC_STOREFRONT=us</code></li>
          <li>Redeploy, then Connect Apple Music on the Music page (Safari works best).</li>
        </ol>
        <p className="mt-3 text-xs text-muted">
          Keys on this project: {appleReady ? "present — you can connect." : "not set yet."}
        </p>
      </div>
    </div>
  );
}
