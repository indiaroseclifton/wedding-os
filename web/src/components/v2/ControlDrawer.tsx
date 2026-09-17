"use client";

import { useEffect, useState } from "react";
import { ControlPanel } from "@/components/v2/ControlPanel";

export function openControl() {
  window.dispatchEvent(new Event("vowfolk-control"));
}

export function ControlDrawer() {
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    function onOpen() {
      setOpen(true);
    }
    window.addEventListener("vowfolk-control", onOpen);
    return () => window.removeEventListener("vowfolk-control", onOpen);
  }, []);

  useEffect(() => {
    if (!open) {
      setShown(false);
      return;
    }
    const id = requestAnimationFrame(() => setShown(true));
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(id);
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] print:hidden">
      <button
        type="button"
        className={`absolute inset-0 bg-ink/35 transition-opacity duration-300 ${
          shown ? "opacity-100" : "opacity-0"
        }`}
        aria-label="Close control"
        onClick={() => setOpen(false)}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Control"
        className={`absolute inset-y-0 right-0 flex w-[min(100vw,26rem)] flex-col border-l border-line bg-paper shadow-[-24px_0_48px_-28px_rgba(28,26,22,0.45)] transition-transform duration-300 ease-out ${
          shown ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted">Control</p>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-full border border-line px-3 py-1 text-xs"
          >
            Close
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          <ControlPanel />
        </div>
      </aside>
    </div>
  );
}
