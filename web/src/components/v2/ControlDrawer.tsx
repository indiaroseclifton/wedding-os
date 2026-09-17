"use client";

import { useEffect, useState } from "react";
import { ControlPanel } from "@/components/v2/ControlPanel";

export function openControl() {
  window.dispatchEvent(new Event("vowfolk-control"));
}

export function ControlDrawer() {
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [ask, setAsk] = useState(false);

  useEffect(() => {
    function onOpen() {
      setOpen(true);
      setAsk(false);
    }
    function onDirty(e: Event) {
      setDirty(Boolean((e as CustomEvent<boolean>).detail));
    }
    window.addEventListener("vowfolk-control", onOpen);
    window.addEventListener("vowfolk-control-dirty", onDirty);
    return () => {
      window.removeEventListener("vowfolk-control", onOpen);
      window.removeEventListener("vowfolk-control-dirty", onDirty);
    };
  }, []);

  function requestClose() {
    if (dirty) {
      setAsk(true);
      return;
    }
    setOpen(false);
    setAsk(false);
  }

  function leaveAnyway() {
    setDirty(false);
    setAsk(false);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) {
      setShown(false);
      setDirty(false);
      setAsk(false);
      return;
    }
    const id = requestAnimationFrame(() => setShown(true));
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") requestClose();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(id);
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, dirty]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] print:hidden">
      <button
        type="button"
        className={`absolute inset-0 bg-ink/35 transition-opacity duration-300 ${
          shown ? "opacity-100" : "opacity-0"
        }`}
        aria-label="Close control"
        onClick={requestClose}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Control"
        onInput={() => {
          setDirty(true);
          window.dispatchEvent(new CustomEvent("vowfolk-control-dirty", { detail: true }));
        }}
        className={`absolute inset-y-0 right-0 flex w-[min(100vw,26rem)] flex-col border-l border-line bg-paper shadow-[-24px_0_48px_-28px_rgba(28,26,22,0.45)] transition-transform duration-300 ease-out ${
          shown ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted">Control</p>
          <button type="button" onClick={requestClose} className="rounded-full border border-line px-3 py-1 text-xs">
            Close
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          <ControlPanel />
        </div>
      </aside>
      {ask ? (
        <div className="absolute inset-0 z-[75] flex items-center justify-center px-4">
          <button type="button" className="absolute inset-0 bg-ink/40" aria-label="Keep editing" onClick={() => setAsk(false)} />
          <div role="alertdialog" aria-labelledby="leave-title" className="relative w-[min(92vw,22rem)] rounded-2xl border border-line bg-paper p-5 shadow-xl">
            <p id="leave-title" className="font-serif text-2xl">
              Save first?
            </p>
            <p className="mt-2 text-sm text-muted">You typed something that is not saved. Leave anyway and it is gone.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" onClick={() => setAsk(false)} className="rounded-full bg-ink px-4 py-2 text-xs text-ivory">
                Keep editing
              </button>
              <button type="button" onClick={leaveAnyway} className="rounded-full border border-line px-4 py-2 text-xs">
                Leave without saving
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
