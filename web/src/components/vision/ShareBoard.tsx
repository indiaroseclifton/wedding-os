"use client";

import { useEffect, useState } from "react";
import { CopyButton } from "@/components/ui/CopyButton";
import type { VisionPayload } from "@/lib/vision";

export function ShareBoard({
  vision,
  onToken,
}: {
  vision: VisionPayload;
  onToken: (token: string) => void;
}) {
  const [token, setToken] = useState(vision.boardToken || "");
  const [busy, setBusy] = useState(false);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    if (vision.boardToken) setToken(vision.boardToken);
  }, [vision.boardToken]);

  async function share() {
    setBusy(true);
    const res = await fetch("/api/decisions/style-vibe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "share" }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (data.token) {
      setToken(data.token);
      onToken(data.token);
    }
  }

  const href = token ? `${origin}/b/${token}` : "";

  return (
    <div className="panel flex flex-wrap items-center gap-2 p-3">
      <p className="text-sm text-ink-soft">A link for the florist. The board, not the brief.</p>
      {token ? (
        <>
          <a href={`/b/${token}`} className="btn btn-ghost min-h-11 text-sm" target="_blank" rel="noreferrer">
            Open
          </a>
          <CopyButton value={href} label="Copy link" />
        </>
      ) : (
        <button type="button" onClick={share} disabled={busy} className="btn btn-primary min-h-11">
          {busy ? "…" : "Make the link"}
        </button>
      )}
    </div>
  );
}
