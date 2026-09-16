"use client";

import { useEffect, useState } from "react";

const KEY = "vowfolk-pinterest-board";

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
  const ready = /^https?:\/\/(www\.)?pinterest\./i.test(href);

  return (
    <section className="rounded-2xl border border-line bg-surface p-4">
      <p className="kicker">Pinterest</p>
      <h2 className="mt-1 font-serif text-2xl">The board you already have</h2>
      <p className="mt-2 text-sm text-muted">
        Paste the board. We do not import pins. Open it when you want more pictures.
      </p>
      <label className="mt-3 block text-sm">
        <span className="font-medium">Board URL</span>
        <input
          value={url}
          onChange={(e) => update(e.target.value)}
          placeholder="https://www.pinterest.com/you/wedding/"
          className="field mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm"
        />
      </label>
      <div className="mt-3 flex flex-wrap gap-2">
        {ready ? (
          <a href={href} target="_blank" rel="noreferrer" className="rounded-full bg-ink px-4 py-2 text-sm text-ivory">
            Open my board
          </a>
        ) : null}
        <a
          href="https://www.pinterest.com/search/pins/?q=wedding%20moodboard"
          target="_blank"
          rel="noreferrer"
          className="rounded-full border border-line px-4 py-2 text-sm"
        >
          Search Pinterest
        </a>
        <a href="https://www.pinterest.com/" target="_blank" rel="noreferrer" className="rounded-full border border-line px-4 py-2 text-sm">
          Open Pinterest
        </a>
      </div>
    </section>
  );
}
