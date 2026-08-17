"use client";

import { useEffect } from "react";
import { zolaKey } from "@/lib/registry-stores";

export function ZolaEmbed({ url }: { url: string }) {
  const key = zolaKey(url);

  useEffect(() => {
    if (!key) return;
    const prev = document.getElementById("zola-wjs");
    if (prev) prev.remove();
    const s = document.createElement("script");
    s.id = "zola-wjs";
    s.async = true;
    s.src = "https://widget.zola.com/js/widget.js";
    document.body.appendChild(s);
    return () => {
      s.remove();
    };
  }, [key]);

  if (!key) return null;

  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <p className="kicker">Zola</p>
      <a className="zola-registry-embed mt-2 block min-h-11" href={url} data-registry-key={key}>
        Our Zola registry
      </a>
    </div>
  );
}
