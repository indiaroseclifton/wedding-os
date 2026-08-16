"use client";

import { useEffect, useState } from "react";
import { faceFor } from "@/lib/vendor-face";

export function VendorFace({
  vendorId,
  category,
  initial,
  onSaved,
}: {
  vendorId: string;
  category: string;
  initial?: Record<string, string>;
  onSaved?: (face: Record<string, string>) => void;
}) {
  const def = faceFor(category);
  const [face, setFace] = useState<Record<string, string>>(initial || {});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setFace(initial || {});
  }, [vendorId, category, initial]);

  async function persist(next: Record<string, string>) {
    setFace(next);
    setSaved(false);
    const res = await fetch(`/api/vendors/${vendorId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "face", face: next }),
    });
    if (res.ok) {
      setSaved(true);
      onSaved?.(next);
    }
  }

  return (
    <section className="rounded-[1.6rem] border border-line bg-surface p-5 sm:p-7">
      <p className="text-[11px] uppercase tracking-[0.18em] text-moss">{def.eyebrow}</p>
      <h2 className="mt-1 font-serif text-3xl">{def.line}</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {def.fields.map((f) => (
          <label key={f.id} className="block">
            <span className="text-[11px] uppercase tracking-[0.14em] text-muted">{f.label}</span>
            <input
              value={face[f.id] || ""}
              onChange={(e) => {
                const value = e.target.value;
                setFace((cur) => ({ ...cur, [f.id]: value }));
              }}
              onBlur={(e) => persist({ ...face, [f.id]: e.target.value })}
              placeholder={f.placeholder}
              className="mt-1.5 w-full border-0 border-b border-line bg-transparent pb-2 font-serif text-xl leading-snug outline-none placeholder:text-ink/25 focus:border-moss"
            />
          </label>
        ))}
      </div>
      <p className="mt-4 text-xs text-muted">{saved ? "On the card." : "Blurs save."}</p>
    </section>
  );
}
