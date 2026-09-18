"use client";

import { useEffect, useState } from "react";
import { HowToButton } from "@/components/v2/HowToPop";

const KEY = "vowfolk-pinterest-board";

declare global {
  interface Window {
    PinUtils?: { build: () => void };
  }
}

function loadPinit() {
  if (document.querySelector("script[data-vowfolk-pinit]")) {
    window.PinUtils?.build();
    return;
  }
  const script = document.createElement("script");
  script.src = "https://assets.pinterest.com/js/pinit.js";
  script.async = true;
  script.defer = true;
  script.setAttribute("data-vowfolk-pinit", "1");
  script.onload = () => window.PinUtils?.build();
  document.body.appendChild(script);
}

function isBoard(url: string) {
  try {
    const u = new URL(url);
    if (!/(^|\.)pinterest\./i.test(u.hostname) && !/^pin\.it$/i.test(u.hostname)) return false;
    const parts = u.pathname.split("/").filter(Boolean);
    return parts.length >= 2;
  } catch {
    return false;
  }
}

export function PinterestLink({
  value,
  onChange,
}: {
  value?: string;
  onChange?: (url: string) => void;
}) {
  const [url, setUrl] = useState(value || "");

  useEffect(() => {
    if (value) return;
    try {
      setUrl(localStorage.getItem(KEY) || "");
    } catch {
      /* ignore */
    }
  }, [value]);

  useEffect(() => {
    if (!isBoard(url)) return;
    loadPinit();
    const t = window.setTimeout(() => window.PinUtils?.build(), 400);
    return () => window.clearTimeout(t);
  }, [url]);

  function update(next: string) {
    setUrl(next);
    onChange?.(next);
    try {
      localStorage.setItem(KEY, next);
    } catch {
      /* ignore */
    }
  }

  const href = url.trim();
  const ready = isBoard(href);

  return (
    <section className="rounded-2xl border border-line bg-surface p-4">
      <p className="kicker">Pinterest</p>
      <h2 className="mt-1 font-serif text-2xl">Link the board</h2>
      <p className="mt-2 text-sm leading-6 text-muted">Paste a public board URL. Pins show under the field.</p>
      <p className="mt-2">
        <HowToButton id="pinterest" />
      </p>
      <label className="mt-3 block text-sm">
        <span className="font-medium">Board URL</span>
        <input
          value={url}
          onChange={(e) => update(e.target.value)}
          placeholder="https://www.pinterest.com/you/wedding/"
          className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm"
        />
      </label>
      <div className="mt-3 flex flex-wrap gap-2">
        {ready ? (
          <a href={href} target="_blank" rel="noreferrer" className="rounded-full bg-ink px-4 py-2 text-sm text-ivory">
            Open on Pinterest
          </a>
        ) : null}
        <a href="https://www.pinterest.com/login/" target="_blank" rel="noreferrer" className="rounded-full border border-line px-4 py-2 text-sm">
          Sign in to Pinterest
        </a>
        <a href="https://www.pinterest.com/" target="_blank" rel="noreferrer" className="rounded-full border border-line px-4 py-2 text-sm">
          Open Pinterest
        </a>
      </div>
      {ready ? (
        <div key={href} className="mt-4 min-h-[240px] overflow-hidden rounded-xl bg-paper p-2">
          <a data-pin-do="embedBoard" data-pin-board-width="720" data-pin-scale-height="320" data-pin-scale-width="100" href={href}>
            {" "}
          </a>
        </div>
      ) : (
        <p className="mt-3 text-xs text-muted">Needs pinterest.com/name/board-name. Secret boards will not show.</p>
      )}
    </section>
  );
}
