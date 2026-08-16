"use client";

import { useEffect, useState } from "react";

export function SubscribeCal() {
  const [href, setHref] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/calendar")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d?.token) return;
        const origin = window.location.origin;
        setHref(`${origin}/c/${d.token}`);
      })
      .catch(() => {});
  }, []);

  if (!href) return null;
  const webcal = href.replace(/^https:/, "webcal:").replace(/^http:/, "webcal:");

  async function copy() {
    await navigator.clipboard.writeText(href);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <section className="glass-panel rounded-2xl p-4">
      <p className="text-[11px] uppercase tracking-[0.18em] text-moss">Calendar</p>
      <p className="mt-1 font-serif text-2xl">Subscribe</p>
      <p className="mt-1 text-sm text-muted">
        The day, extra events, run of show, hotel cutoffs. Add once — it updates.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <a href={webcal} className="inline-flex min-h-11 items-center rounded-full bg-moss px-4 text-sm text-ivory">
          Add to calendar
        </a>
        <a href={href} className="inline-flex min-h-11 items-center rounded-full border border-line px-4 text-sm">
          Download .ics
        </a>
        <button type="button" onClick={copy} className="min-h-11 rounded-full border border-line px-4 text-sm">
          {copied ? "Copied" : "Copy link"}
        </button>
      </div>
    </section>
  );
}
