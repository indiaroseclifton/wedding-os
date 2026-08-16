"use client";

import { useEffect, useState } from "react";

type Prompt = { prompt: () => Promise<void> };

export function InstallApp({ compact = false }: { compact?: boolean }) {
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [standalone, setStandalone] = useState(false);
  const [ios, setIos] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(display-mode: standalone)");
    const nav = window.navigator as Navigator & { standalone?: boolean };
    const cap = Boolean((window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor);
    setStandalone(media.matches || nav.standalone === true || cap);
    setIos(/iphone|ipad|ipod/i.test(navigator.userAgent));

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setPrompt(e as unknown as Prompt);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (standalone) {
    return compact ? null : (
      <p className="text-sm text-muted">This phone already has the desk on the home screen.</p>
    );
  }

  return (
    <div className={compact ? "" : "rounded-2xl border border-line bg-surface p-4"}>
      {prompt ? (
        <button
          type="button"
          onClick={() => prompt.prompt()}
          className="rounded-full bg-moss px-4 py-2 text-sm font-medium text-ivory"
        >
          Install on this phone
        </button>
      ) : ios ? (
        <p className="text-sm leading-6">
          On iPhone: tap <span className="font-medium">Share</span>, then{" "}
          <span className="font-medium">Add to Home Screen</span>. It opens like an app.
        </p>
      ) : (
        <p className="text-sm text-muted">
          In Chrome, open the menu and choose Install app — or Add to Home screen.
        </p>
      )}
    </div>
  );
}
