"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CommandPalette } from "@/components/search/CommandPalette";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import {
  MORE_ROOMS,
  NAV_ITEMS,
  VISUAL_ROOMS,
  firstNames,
  shortWeddingDate,
} from "@/lib/visual-rooms";

import { Icon } from "@/components/icons";
import { RoomTile } from "@/components/layout/RoomTile";
import { DeskNav, currentRoomLabel } from "@/components/layout/DeskNav";

function tabOn(pathname: string, match: readonly string[]) {
  return match.some((m) => pathname === m || pathname.startsWith(m + "/"));
}

export function AppShell({
  userName,
  coupleNames,
  weddingDate,
  location,
  coverUrl,
  children,
}: {
  userName: string;
  coupleNames?: string;
  weddingDate?: string;
  location?: string;
  coverUrl?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const pane = useRef<HTMLElement>(null);
  const [rooms, setRooms] = useState(false);
  const names = firstNames(coupleNames, "Alex & Jordan");
  const date = shortWeddingDate(weddingDate);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
    for (const item of NAV_ITEMS) router.prefetch(item.href);
    router.prefetch("/settings");
  }, [router]);

  useEffect(() => {
    setRooms(false);
    pane.current?.scrollTo({ top: 0 });
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = rooms ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [rooms]);

  useEffect(() => {
    if (!rooms) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setRooms(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [rooms]);

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  const roomLabel = currentRoomLabel(pathname);

  return (
    <div className="relative h-dvh overflow-hidden bg-paper lg:flex">
      <a href="#main" className="skip-link">
        Skip to the desk
      </a>
      <ThemeProvider />
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <img src={coverUrl || "/brand/tablescape.jpg"} alt="" className="h-full w-full object-cover opacity-[0.22]" />
        <div className="absolute inset-0 bg-paper/55 backdrop-blur-[2px]" />
      </div>
      <aside className="hidden h-dvh w-60 shrink-0 flex-col overflow-y-auto border-r border-white/40 bg-surface/40 px-3 py-5 backdrop-blur-xl lg:flex">
        <Link href="/dashboard" scroll={false} className="mb-6 flex items-center gap-2 px-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-moss text-[11px] font-medium text-ivory">
            {names
              .split(" & ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)}
          </span>
        </Link>
        <DeskNav />
        <button
          type="button"
          onClick={() => setRooms(true)}
          className="mt-2 flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-ink-soft hover:bg-white/60"
        >
          <span className="inline-flex h-[18px] w-[18px] items-center justify-center text-lg leading-none">···</span>
          More
        </button>
        <Link
          href="/settings"
          scroll={false}
          className="mt-auto flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ink-soft hover:bg-white/40"
        >
          <Icon name="settings" />
          Settings
        </Link>
        <button type="button" onClick={signOut} className="px-3 py-2 text-left text-xs text-muted underline">
          Sign out
        </button>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-white/40 bg-paper/55 px-4 py-3 backdrop-blur-xl print:hidden sm:px-6">
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold uppercase tracking-[0.14em]">{names}</p>
            <p className="truncate text-[11px] text-muted">
              {roomLabel ? `${roomLabel}  ·  ` : ""}
              {date}
              {location ? `  ·  ${location}` : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <CommandPalette />
            <Link
              href="/settings"
              scroll={false}
              aria-label="Settings"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/50 bg-surface/50 text-ink backdrop-blur-md"
            >
              <Icon name="settings" />
            </Link>
            <span className="hidden h-9 w-9 overflow-hidden rounded-full sm:block">
              <img src={coverUrl || "/brand/setting.jpg"} alt="" className="h-full w-full object-cover" />
            </span>
            <button
              type="button"
              onClick={() => setRooms(true)}
              className="min-h-11 rounded-full border border-line px-3 py-2 text-xs font-medium lg:hidden"
            >
              More
            </button>
          </div>
        </header>

        <main
          id="main"
          ref={pane}
          tabIndex={-1}
          className="min-h-0 flex-1 overflow-y-auto px-4 py-5 pb-24 sm:px-6 lg:px-8 lg:py-7 lg:pb-10"
        >
          {children}
        </main>
      </div>

      {rooms && (
        <div className="fixed inset-0 z-50 print:hidden">
          <button type="button" className="absolute inset-0 bg-ink/40" aria-label="Close" onClick={() => setRooms(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[90vh] overflow-y-auto rounded-t-3xl bg-paper/80 px-5 pb-10 pt-5 backdrop-blur-2xl sm:inset-6 sm:rounded-3xl sm:pb-6">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-muted">
                  {date}
                  {location ? `  ·  ${location}` : ""}
                </p>
                <h2 className="mt-1 font-serif text-3xl">Rooms</h2>
              </div>
              <button type="button" onClick={() => setRooms(false)} className="text-xl leading-none">
                ×
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
              {VISUAL_ROOMS.map((room) => (
                <RoomTile key={room.href} {...room} onClick={() => setRooms(false)} />
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {MORE_ROOMS.map((r) => (
                <Link
                  key={r.href}
                  href={r.href}
                  scroll={false}
                  onClick={() => setRooms(false)}
                  className="rounded-full border border-line bg-surface px-3 py-1.5 text-xs"
                >
                  {r.label}
                </Link>
              ))}
              <p className="w-full pt-2 text-[11px] text-muted">Hi {userName.split(" ")[0]}</p>
            </div>
          </div>
        </div>
      )}

      <nav
        className="fixed inset-x-0 bottom-0 z-30 border-t border-white/40 bg-paper/60 backdrop-blur-xl lg:hidden print:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <ul className="mx-auto grid max-w-lg grid-cols-5">
          {NAV_ITEMS.slice(0, 4).map((tab) => {
            const on = tabOn(pathname, tab.match);
            return (
              <li key={tab.href}>
                <Link
                  href={tab.href}
                  scroll={false}
                  prefetch
                  className={`flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium ${
                    on ? "text-moss" : "text-muted"
                  }`}
                >
                  <Icon name={tab.icon} />
                  {tab.label}
                </Link>
              </li>
            );
          })}
          <li>
            <button
              type="button"
              onClick={() => setRooms(true)}
              className="flex w-full flex-col items-center gap-0.5 py-2 text-[10px] font-medium text-muted"
            >
              <span className="text-base leading-none">···</span>
              More
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}
