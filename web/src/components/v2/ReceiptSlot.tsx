"use client";

import { useState } from "react";

export function ReceiptSlot() {
  const [name, setName] = useState<string | null>(null);
  return (
    <section className="rounded-2xl border border-dashed border-line bg-surface p-4">
      <p className="kicker">Receipts</p>
      <p className="mt-1 text-sm text-muted">Photo lands here. OCR is later (receipt-scanner). Today it is a reminder plus a file name.</p>
      <label className="mt-3 inline-flex min-h-11 cursor-pointer items-center rounded-full border border-line px-4 text-sm">
        Attach a receipt
        <input
          type="file"
          accept="image/*,.pdf"
          className="hidden"
          onChange={(e) => setName(e.target.files?.[0]?.name || null)}
        />
      </label>
      {name ? <p className="mt-2 text-xs text-muted">Held in this browser: {name}</p> : null}
    </section>
  );
}
