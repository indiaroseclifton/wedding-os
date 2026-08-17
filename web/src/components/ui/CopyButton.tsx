"use client";

import { useState } from "react";

export function CopyButton({
  value,
  label = "Copy",
  primary = false,
}: {
  value: string;
  label?: string;
  primary?: boolean;
}) {
  const [done, setDone] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setDone(true);
      setTimeout(() => setDone(false), 1500);
    } catch {
      setDone(false);
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={`btn !min-h-8 px-3 text-xs ${primary ? "btn-primary" : "btn-ghost"}`}
    >
      {done ? "Copied" : label}
    </button>
  );
}
