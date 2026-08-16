"use client";

import { useEffect, useRef } from "react";

export function spotifyTrackId(uri?: string, url?: string) {
  if (uri?.startsWith("spotify:track:")) return uri.slice("spotify:track:".length);
  const match = url?.match(/track\/([a-zA-Z0-9]+)/);
  return match?.[1];
}

export function TrackPreview({
  previewUrl,
  uri,
  url,
  open,
  onToggle,
}: {
  previewUrl?: string;
  uri?: string;
  url?: string;
  open: boolean;
  onToggle: () => void;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const embedId = spotifyTrackId(uri, url);

  useEffect(() => {
    const el = audioRef.current;
    if (!el || !previewUrl) return;
    if (open) {
      el.play().catch(() => {});
    } else {
      el.pause();
      el.currentTime = 0;
    }
  }, [open, previewUrl]);

  if (!previewUrl && !embedId) return null;

  return (
    <div className="w-full">
      <button type="button" onClick={onToggle} className="text-xs font-medium underline">
        {open ? "Stop" : previewUrl ? "Play 30s" : "Preview"}
      </button>
      {previewUrl && (
        <audio ref={audioRef} src={previewUrl} preload="none" onEnded={onToggle} className="hidden" />
      )}
      {open && !previewUrl && embedId && (
        <iframe
          title="Spotify preview"
          src={`https://open.spotify.com/embed/track/${embedId}?utm_source=generator&theme=0`}
          className="mt-2 h-20 w-full rounded-lg border-0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
        />
      )}
    </div>
  );
}
