"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { V2_ITEMS } from "@/lib/v2-board";
import { INTAKE_HOW } from "@/lib/how-intake";
import { CONTROL_HOW } from "@/lib/how-control";
import { getHowTo, stepsFor, type HowAction, type HowGuide } from "@/lib/how-to";

const PIN_KEY = "vowfolk-pinterest-board";
const EXTRA: HowGuide[] = [INTAKE_HOW, ...CONTROL_HOW];

export function openHowTo(id: string) {
  window.dispatchEvent(new CustomEvent("vowfolk-how", { detail: id }));
}

function resolve(id: string): HowGuide {
  const extra = EXTRA.find((g) => g.id === id);
  if (extra) return extra;
  const named = getHowTo(id);
  if (named) return named;
  const item = V2_ITEMS.find((i) => i.id === id);
  if (item) return stepsFor(item.id, item.title, item.href, item.doThis);
  return {
    id,
    title: "How do I do it",
    href: "/intake",
    steps: ["Open the room this belongs to and do the next real-world step."],
    actions: [{ label: "Open Intake", href: "/intake" }],
  };
}

function extraActions(id: string): HowAction[] {
  if (id !== "pinterest" && id !== "vision") return [];
  try {
    const board = (localStorage.getItem(PIN_KEY) || "").trim();
    if (/^https?:\/\//i.test(board)) return [{ label: "Open my board", href: board, external: true }];
  } catch {
    /* ignore */
  }
  return [];
}

export function HowToPop() {
  const [id, setId] = useState("");
  const [pos, setPos] = useState({ x: 24, y: 88 });
  const drag = useRef<{ dx: number; dy: number } | null>(null);

  useEffect(() => {
    function onOpen(e: Event) {
      const next = (e as CustomEvent<string>).detail;
      if (!next) return;
      setId(next);
      setPos({ x: Math.max(16, window.innerWidth - 420), y: 88 });
    }
    window.addEventListener("vowfolk-how", onOpen);
    return () => window.removeEventListener("vowfolk-how", onOpen);
  }, []);

  useEffect(() => {
    function move(e: PointerEvent) {
      if (!drag.current) return;
      setPos({
        x: Math.max(8, e.clientX - drag.current.dx),
        y: Math.max(8, e.clientY - drag.current.dy),
      });
    }
    function up() {
      drag.current = null;
    }
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, []);

  if (!id) return null;
  const guide = resolve(id);
  const actions = [...(guide.actions || []), ...extraActions(id)].filter((a) => a.href && a.href !== "#");

  return (
    <div
      role="dialog"
      aria-label={guide.title}
      className="fixed z-[80] w-[min(92vw,380px)] rounded-2xl border border-line bg-paper shadow-xl print:hidden"
      style={{ left: pos.x, top: pos.y }}
    >
      <div
        className="flex cursor-grab items-center justify-between gap-2 rounded-t-2xl border-b border-line bg-surface px-3 py-2 active:cursor-grabbing"
        onPointerDown={(e) => {
          drag.current = { dx: e.clientX - pos.x, dy: e.clientY - drag.current.dy };
        }}
      >
        <p className="text-[10px] uppercase tracking-wide text-muted">How do I do it</p>
        <button type="button" onClick={() => setId("")} className="rounded-full border border-line px-2 py-1 text-[11px]">
          Close
        </button>
      </div>
      <div className="max-h-[70vh] overflow-y-auto px-4 py-3">
        <h2 className="font-serif text-2xl">{guide.title}</h2>
        <ol className="mt-3 space-y-3">
          {guide.steps.map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ink text-[10px] text-ivory">
                {i + 1}
              </span>
              <p className="text-sm leading-5">{step}</p>
            </li>
          ))}
        </ol>
        <div className="mt-4 flex flex-wrap gap-2">
          {actions.map((a) =>
            a.external ? (
              <a key={a.label} href={a.href} target="_blank" rel="noreferrer" className="rounded-full bg-ink px-3 py-1.5 text-xs text-ivory">
                {a.label}
              </a>
            ) : (
              <Link key={a.label} href={a.href} className="rounded-full border border-line px-3 py-1.5 text-xs">
                {a.label}
              </Link>
            ),
          )}
        </div>
      </div>
    </div>
  );
}

export function HowToButton({ id, children }: { id: string; children?: string }) {
  return (
    <button type="button" onClick={() => openHowTo(id)} className="text-sm underline">
      {children || "How do I do it"}
    </button>
  );
}
