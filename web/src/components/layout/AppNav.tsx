"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BrandMark } from "@/components/brand/BrandMark";
import { CommandPalette } from "@/components/search/CommandPalette";
import { RoomTile } from "@/components/layout/RoomTile";
import { MORE_ROOMS, VISUAL_ROOMS, firstNames, prettyWeddingDate } from "@/lib/visual-rooms";

const TABS: { href: string; label: string; match: string[]; icon: string }[] = [
  { href: "/dashboard", label: "Week", match: ["/dashboard"], icon: "week" },
  { href: "/guests", label: "Guests", match: ["/guests", "/site", "/seating", "/floorplan", "/dietary", "/travel"], icon: "guests" },
  { href: "/vendors", label: "Vendors", match: ["/vendors", "/payments", "/handoffs", "/music", "/send"], icon: "vendors" },
  { href: "/diy", label: "Make", match: ["/diy"], icon: "diy" },
  { href: "/day-of", label: "Day", match: ["/day-of", "/run-of-show", "/packet", "/people", "/party", "/attire"], icon: "day" },
];

function tabActive(pathname: string, match: string[]) {
  return match.some((m) => pathname === m || pathname.startsWith(m + "/"));
}

function Icon({ name }: { name: string }) {
  const cn = "h-5 w-5";
  if (name === "week") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={cn}>
        <rect x="4" y="5" width="16" height="15" rx="2" />
        <path d="M8 3v4M16 3v4M4 10h16" />
      </svg>
    );
  }
  if (name === "guests") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={cn}>
        <circle cx="9" cy="8" r="3" />
        <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
      </svg>
    );
  }
  if (name === "vendors") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={cn}>
        <path d="M4 10h16l-1 10H5L4 10Z" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      </svg>
    );
  }
  if (name === "diy") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={cn}>
        <path d="M12 4c2 3 6 5 6 9a6 6 0 1 1-12 0c0-4 4-6 6-9Z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={cn}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v5l3 2" />
    </svg>
  );
}

export function AppNav({
  userName,
  weddingName,
  weddingDate,
  coupleNames,
}: {
  userName: string;
  weddingName?: string;
  weddingDate?: string;
  coupleNames?: string;
}) {
  const pathname = usePathname();
  const [rooms, setRooms] = useState(false);
  const names = firstNames(coupleNames, weddingName || "Wedding OS");
  const date = prettyWeddingDate(weddingDate);

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

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-line/80 bg-paper/80 backdrop-blur-md print:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/dashboard" className="flex min-w-0 items-center gap-3">
            <span className="hidden h-10 w-10 overflow-hidden rounded-full sm:block">
              <img src="/brand/setting.jpg" alt="" className="h-full w-full object-cover" />
            </span>
            <span className="min-w-0 sm:hidden">
              <BrandMark size={22} />
            </span>
            <span className="min-w-0">
              <p className="truncate font-serif text-lg leading-tight tracking-tight">{names}</p>
              {date && <p className="truncate text-[11px] text-muted">{date}</p>}
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <CommandPalette />
            <button
              type="button"
              onClick={() => setRooms(true)}
              className="rounded-full bg-moss px-3 py-2 text-xs font-medium text-moss-fg"
            >
              Rooms
            </button>
          </div>
        </div>
      </header>

      {rooms && (
        <div className="fixed inset-0 z-50 print:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-ink/50"
            aria-label="Close rooms"
            onClick={() => setRooms(false)}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[88vh] overflow-y-auto rounded-t-[1.5rem] bg-paper px-4 pb-10 pt-5 sm:inset-y-8 sm:inset-x-auto sm:left-1/2 sm:w-[min(92%,40rem)] sm:-translate-x-1/2 sm:rounded-[1.5rem] sm:pb-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="font-serif text-2xl">{names}</p>
                <p className="text-xs text-muted">Hi {userName.split(" ")[0]}</p>
              </div>
              <button type="button" onClick={() => setRooms(false)} className="text-sm underline">
                Close
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {VISUAL_ROOMS.map((room) => (
                <RoomTile key={room.href} {...room} onClick={() => setRooms(false)} />
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
              <button type="button" onClick={signOut} className="rounded-full px-3 py-1.5 text-xs underline">
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}

      <nav
        className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/95 backdrop-blur lg:hidden print:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <ul className="mx-auto grid max-w-lg grid-cols-5">
          {TABS.map((tab) => {
            const on = tabActive(pathname, tab.match);
            return (
              <li key={tab.href}>
                <Link
                  href={tab.href}
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
        </ul>
      </nav>
    </>
  );
}
