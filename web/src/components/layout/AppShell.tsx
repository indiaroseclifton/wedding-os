"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CommandPalette } from "@/components/search/CommandPalette";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import {
  MORE_ROOMS,
  NAV_ITEMS,
  VISUAL_ROOMS,
  firstNames,
  shortWeddingDate,
} from "@/lib/visual-rooms";

function tabOn(pathname: string, match: readonly string[]) {
  return match.some((m) => pathname === m || pathname.startsWith(m + "/"));
}

function NavIcon({ name }: { name: string }) {
  const cn = "h-[18px] w-[18px]";
  if (name === "home") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={cn}>
        <path d="M4 11.5 12 5l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-8.5Z" />
      </svg>
    );
  }
  if (name === "guests") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={cn}>
        <circle cx="9" cy="8" r="3" />
        <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
        <circle cx="17" cy="9" r="2.2" />
        <path d="M16 19a4.5 4.5 0 0 1 5-4.4" />
      </svg>
    );
  }
  if (name === "vendors") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={cn}>
        <path d="M4 10h16l-1 10H5L4 10Z" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      </svg>
    );
  }
  if (name === "planning") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={cn}>
        <rect x="4" y="5" width="16" height="15" rx="2" />
        <path d="M8 3v4M16 3v4M4 10h16" />
      </svg>
    );
  }
  if (name === "day") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={cn}>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4" />
      </svg>
    );
  }
  if (name === "budget") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={cn}>
        <rect x="3" y="6" width="18" height="13" rx="2" />
        <path d="M3 10h18M8 15h3" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={cn}>
      <path d="M12 5v14M6 9h4l2 3 2-3h4" />
    </svg>
  );
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
  const [rooms, setRooms] = useState(false);
  const names = firstNames(coupleNames, "Alex & Jordan");
  const date = shortWeddingDate(weddingDate);

  useEffect(() => {
    setRooms(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = rooms ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [rooms]);

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  const links = (
    <nav className="space-y-0.5">
      {NAV_ITEMS.map((item) => {
        const on = tabOn(pathname, item.match);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm ${
              on ? "bg-white/70 font-medium text-ink shadow-sm backdrop-blur" : "text-ink-soft hover:bg-white/40"
            }`}
          >
            <NavIcon name={item.icon} />
            {item.label}
          </Link>
        );
      })}
      <button
        type="button"
        onClick={() => setRooms(true)}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-ink-soft hover:bg-white/60"
      >
        <span className="inline-flex h-[18px] w-[18px] items-center justify-center text-lg leading-none">···</span>
        More
      </button>
    </nav>
  );

  return (
    <div className="relative min-h-screen bg-paper lg:flex">
      <ThemeProvider />
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <img src="/brand/tablescape.jpg" alt="" className="h-full w-full object-cover opacity-[0.14]" />
        <div className="absolute inset-0 bg-paper/70" />
      </div>
      <aside className="hidden w-56 shrink-0 flex-col border-r border-white/40 bg-surface/40 px-3 py-5 backdrop-blur-xl lg:flex">
        <Link href="/dashboard" className="mb-8 flex items-center gap-2 px-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-moss text-[11px] font-medium text-ivory">
            {names
              .split(" & ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)}
          </span>
        </Link>
        {links}
        <button type="button" onClick={signOut} className="mt-auto px-3 py-2 text-left text-xs text-muted underline">
          Sign out
        </button>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-white/40 bg-paper/55 px-4 py-3 backdrop-blur-xl print:hidden sm:px-6">
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold uppercase tracking-[0.14em]">{names}</p>
            <p className="truncate text-[11px] text-muted">
              {date}
              {location ? `  ·  ${location}` : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <CommandPalette />
            <span className="hidden h-9 w-9 overflow-hidden rounded-full sm:block">
              <img src={coverUrl || "/brand/setting.jpg"} alt="" className="h-full w-full object-cover" />
            </span>
            <button
              type="button"
              onClick={() => setRooms(true)}
              className="rounded-full border border-line px-3 py-2 text-xs font-medium lg:hidden"
            >
              More
            </button>
          </div>
        </header>

        <main className="px-4 py-5 pb-24 sm:px-6 lg:px-8 lg:py-7 lg:pb-10">{children}</main>
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
                <Link
                  key={room.href}
                  href={room.href}
                  onClick={() => setRooms(false)}
                  className="group relative aspect-[5/4] overflow-hidden rounded-2xl"
                >
                  <img src={room.photo} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-3 text-ivory">
                    <p className="font-serif text-xl">{room.label}</p>
                    <p className="mt-0.5 text-[11px] leading-4 text-white/70">{room.line}</p>
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {MORE_ROOMS.map((r) => (
                <Link
                  key={r.href}
                  href={r.href}
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
                  className={`flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium ${
                    on ? "text-moss" : "text-muted"
                  }`}
                >
                  <NavIcon name={tab.icon} />
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
