"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CommandPalette } from "@/components/search/CommandPalette";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { MORE_ROOMS, NAV_ITEMS, VISUAL_ROOMS, firstNames, shortWeddingDate } from "@/lib/visual-rooms";
import { roomVisible } from "@/lib/shape";
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
  shape,
  guestCount,
  vendorCount,
  children,
}: {
  userName: string;
  coupleNames?: string;
  weddingDate?: string;
  location?: string;
  coverUrl?: string;
  shape?: string;
  guestCount?: number;
  vendorCount?: number;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const pane = useRef<HTMLElement>(null);
  const [rooms, setRooms] = useState(false);
  const names = firstNames(coupleNames, "Alex & Jordan");
  const date = shortWeddingDate(weddingDate);
  const home = pathname === "/dashboard" || pathname === "/";
  const roomLabel = currentRoomLabel(pathname);
  const photo = coverUrl || "/brand/tablescape.jpg";

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

  return (
    <div className={`desk ${home ? "is-home" : ""}`}>
      <a href="#main" className="skip-link">
        Skip to the desk
      </a>
      <ThemeProvider />

      <aside className="desk-rail rail relative">
        <img src={photo} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="rail-wash absolute inset-0" />
        <div className="relative z-10 flex h-full flex-col px-4 pb-5 pt-7">
          <Link href="/dashboard" scroll={false} className="px-2">
            <p className="font-serif text-[1.65rem] leading-tight tracking-tight text-moss-fg">{names}</p>
            <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.16em] text-moss-fg/55">
              {date}
              {location ? ` · ${location}` : ""}
            </p>
          </Link>
          <div className="mt-8 min-h-0 flex-1 overflow-y-auto pr-1">
            <DeskNav shape={shape} guestCount={guestCount} vendorCount={vendorCount} />
          </div>
          <div className="mt-4 space-y-1 border-t border-white/10 pt-3">
            <button
              type="button"
              onClick={() => setRooms(true)}
              className="flex min-h-10 w-full items-center rounded-lg px-3 text-sm text-moss-fg/70 hover:bg-white/10 hover:text-moss-fg"
            >
              More rooms
            </button>
            <Link
              href="/settings"
              scroll={false}
              className="flex min-h-10 items-center rounded-lg px-3 text-sm text-moss-fg/70 hover:bg-white/10 hover:text-moss-fg"
            >
              Settings
            </Link>
            <button type="button" onClick={signOut} className="px-3 py-1 text-left text-[11px] text-moss-fg/40 underline">
              Sign out
            </button>
          </div>
        </div>
      </aside>

      <header
        className={`desk-mast flex items-center justify-between gap-3 print:hidden ${
          home ? "px-6 py-6 sm:px-10" : "border-b border-line/70 px-1 py-3 sm:px-2"
        }`}
      >
        <div className="min-w-0">
          <p className={`kicker ${home ? "kicker-soft" : ""}`}>{roomLabel || "Home"}</p>
          {!home && (
            <p className="truncate text-sm text-ink-soft lg:hidden">
              {names}
              {date ? ` · ${date}` : ""}
            </p>
          )}
        </div>
        <div className="pointer-events-auto flex items-center gap-2">
          <CommandPalette tone={home ? "onPhoto" : "paper"} />
          <button
            type="button"
            onClick={() => setRooms(true)}
            className="min-h-11 rounded-full border border-line/80 bg-surface/70 px-3 py-2 text-xs font-medium backdrop-blur lg:hidden"
          >
            Menu
          </button>
        </div>
      </header>

      <main id="main" ref={pane} tabIndex={-1} className="desk-canvas">
        {children}
      </main>

      {rooms && (
        <div className="fixed inset-0 z-50 print:hidden">
          <button type="button" className="absolute inset-0 bg-ink/40" aria-label="Close" onClick={() => setRooms(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[90vh] overflow-y-auto rounded-t-3xl bg-paper px-5 pb-10 pt-5 sm:inset-6 sm:rounded-3xl sm:pb-6">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <p className="kicker">
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
              {VISUAL_ROOMS.filter((room) => roomVisible(room.href, shape)).map((room) => (
                <RoomTile key={room.href} {...room} onClick={() => setRooms(false)} />
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {MORE_ROOMS.filter((r) => roomVisible(r.href, shape)).map((r) => (
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
        className="desk-dock border-t border-line/70 bg-paper/90 backdrop-blur-xl print:hidden"
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
