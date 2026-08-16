"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Hit = { type: string; title: string; href: string; meta?: string };

const ROOMS: Hit[] = [
  { title: "This week", href: "/dashboard", type: "Room" },
  { title: "Guests", href: "/guests", type: "Room" },
  { title: "Vendors", href: "/vendors", type: "Room" },
  { title: "DIY studio", href: "/diy", type: "Room" },
  { title: "Day-of board", href: "/day-of", type: "Room" },
  { title: "Run of show", href: "/run-of-show", type: "Room" },
  { title: "Seating", href: "/seating", type: "Room" },
  { title: "Music", href: "/music", type: "Room" },
  { title: "Payments", href: "/payments", type: "Room" },
  { title: "Guest site", href: "/site", type: "Room" },
  { title: "Settings", href: "/settings", type: "Room" },
  { title: "Integrations", href: "/integrations", type: "Room" },
];

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [remote, setRemote] = useState<Hit[]>([]);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) return;
    setQ("");
    setRemote([]);
    setActive(0);
    const t = window.setTimeout(() => inputRef.current?.focus(), 20);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open || q.trim().length < 2) {
      setRemote([]);
      return;
    }
    const t = window.setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(q)}`)
        .then((r) => r.json())
        .then((d) => setRemote(d.results || []))
        .catch(() => setRemote([]));
    }, 160);
    return () => window.clearTimeout(t);
  }, [q, open]);

  const items = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const rooms = needle
      ? ROOMS.filter((r) => r.title.toLowerCase().includes(needle))
      : ROOMS;
    const seen = new Set(rooms.map((r) => r.href));
    const extra = remote.filter((r) => !seen.has(r.href));
    return [...rooms, ...extra].slice(0, 12);
  }, [q, remote]);

  useEffect(() => {
    setActive(0);
  }, [items.length, q]);

  function go(href: string) {
    setOpen(false);
    router.push(href);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hidden items-center gap-2 rounded-lg border border-line px-2.5 py-1.5 text-xs text-muted sm:inline-flex"
      >
        Search
        <kbd className="rounded border border-line bg-paper px-1.5 py-0.5 text-[10px] font-medium text-ink-soft">
          ⌘K
        </kbd>
      </button>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-line sm:hidden"
        aria-label="Search"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="11" cy="11" r="6" />
          <path d="M16 16l4 4" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 print:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-ink/40"
            aria-label="Close search"
            onClick={() => setOpen(false)}
          />
          <div className="glass relative mx-auto mt-[12vh] w-[min(92%,32rem)] overflow-hidden rounded-[1.2rem]">
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setActive((i) => Math.min(i + 1, Math.max(items.length - 1, 0)));
                }
                if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setActive((i) => Math.max(i - 1, 0));
                }
                if (e.key === "Enter" && items[active]) go(items[active].href);
              }}
              placeholder="Jump to a room, guest, vendor…"
              className="w-full border-b border-white/10 bg-transparent px-4 py-3 text-sm text-[#f6f1e8] outline-none placeholder:text-white/40"
            />
            <ul className="max-h-80 overflow-y-auto py-1">
              {items.map((item, i) => (
                <li key={`${item.href}-${item.title}`}>
                  <button
                    type="button"
                    onMouseEnter={() => setActive(i)}
                    onClick={() => go(item.href)}
                    className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm ${
                      i === active ? "bg-white/10" : ""
                    }`}
                  >
                    <span className="font-medium">{item.title}</span>
                    <span className="text-[11px] text-white/50">{item.meta || item.type}</span>
                  </button>
                </li>
              ))}
              {!items.length && (
                <li className="px-4 py-8 text-center text-sm text-white/50">Nothing matches</li>
              )}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
