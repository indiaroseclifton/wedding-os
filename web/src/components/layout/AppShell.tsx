"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CommandPalette } from "@/components/search/CommandPalette";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { NAV_ITEMS, firstNames, shortWeddingDate } from "@/lib/visual-rooms";
import { roomVisible } from "@/lib/shape";
import { Icon } from "@/components/icons";

function tabOn(pathname: string, match: readonly string[]) {
  return match.some((m) => pathname === m || pathname.startsWith(m + "/"));
}

function initials(names: string) {
  const parts = names.split(" & ").map((n) => n[0]).filter(Boolean);
  return (parts.join("&") || "A&J").slice(0, 3);
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
  kickTitle,
  kickWhen,
  kickHref,
  alerts,
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
  kickTitle?: string;
  kickWhen?: string;
  kickHref?: string;
  alerts?: number;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const pane = useRef<HTMLElement>(null);
  const [railOpen, setRailOpen] = useState(false);
  const names = firstNames(coupleNames, "Alex & Jordan");
  const date = shortWeddingDate(weddingDate);
  const home = pathname === "/dashboard" || pathname === "/";
  const roomsPage = pathname === "/rooms";
  const photo = coverUrl || "/brand/flowers.jpg";
  const mark = initials(names);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
    for (const item of NAV_ITEMS) router.prefetch(item.href);
    router.prefetch("/settings");
    router.prefetch("/rooms");
  }, [router]);

  useEffect(() => {
    setRailOpen(false);
    pane.current?.scrollTo({ top: 0 });
  }, [pathname]);

  const nav = NAV_ITEMS.filter((item) => !item.room || roomVisible(item.href, shape));

  return (
    <div className={`desk ${home ? "is-home" : ""}`}>
      <a href="#main" className="skip-link">
        Skip to the desk
      </a>
      <ThemeProvider />

      <aside className={`desk-rail light-rail ${railOpen ? "is-open" : ""}`}>
        <Link href="/dashboard" scroll={false} className="flex flex-col items-center px-4 pt-7 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-moss font-serif text-lg tracking-tight text-moss-fg">
            {mark}
          </span>
          <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink">{names}</p>
          <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-muted">{date || "Set the date"}</p>
        </Link>

        <nav className="mt-6 flex-1 space-y-0.5 overflow-y-auto px-3" aria-label="Rooms">
          {nav.map((item) => {
            const on = tabOn(pathname, item.match);
            return (
              <Link
                key={item.href}
                href={item.href}
                scroll={false}
                prefetch
                className={`flex min-h-11 items-center gap-3 rounded-full px-3 text-sm ${
                  on ? "bg-champagne/80 font-medium text-ink" : "text-ink-soft hover:bg-paper"
                }`}
              >
                <Icon name={item.icon} className="h-[18px] w-[18px]" />
                {item.label}
              </Link>
            );
          })}
          <Link
            href="/moodboard"
            scroll={false}
            className={`flex min-h-11 items-center gap-3 rounded-full px-3 text-sm ${
              pathname.startsWith("/moodboard") ? "bg-champagne/80 font-medium text-ink" : "text-ink-soft hover:bg-paper"
            }`}
          >
            <Icon name="ideas" className="h-[18px] w-[18px]" />
            Ideas
          </Link>
          <Link
            href="/rooms"
            scroll={false}
            className={`flex min-h-11 items-center gap-3 rounded-full px-3 text-sm ${
              roomsPage ? "bg-champagne/80 font-medium text-ink" : "text-ink-soft hover:bg-paper"
            }`}
          >
            <Icon name="more" className="h-[18px] w-[18px]" />
            More
          </Link>
        </nav>

        {(kickTitle || guestCount != null) && (
          <Link
            href={kickHref || "/checklist"}
            className="mx-3 mb-3 overflow-hidden rounded-2xl bg-paper"
          >
            <div className="relative h-24">
              <img src={photo} alt="" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-paper via-paper/40 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-3">
                <p className="text-sm font-medium text-ink">{kickTitle || "This week"}</p>
                <p className="text-[11px] text-muted">{kickWhen || `${guestCount ?? 0} guests · ${vendorCount ?? 0} vendors`}</p>
                <p className="mt-1 text-[11px] text-moss">
                  View details <span aria-hidden>→</span>
                </p>
              </div>
            </div>
          </Link>
        )}

        <div className="flex items-center justify-center gap-1 border-t border-line px-2 py-3">
          <button type="button" onClick={() => document.dispatchEvent(new Event("wedding-search"))} className="flex h-11 w-11 items-center justify-center rounded-full text-ink-soft hover:bg-paper" aria-label="Search">
            <Icon name="search" />
          </button>
          <Link href="/checklist" className="relative flex h-11 w-11 items-center justify-center rounded-full text-ink-soft hover:bg-paper" aria-label="Alerts">
            <Icon name="bell" />
            {alerts ? (
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-moss" />
            ) : null}
          </Link>
          <Link href="/settings" className="flex h-11 w-11 items-center justify-center rounded-full text-ink-soft hover:bg-paper" aria-label="Settings">
            <Icon name="settings" />
          </Link>
        </div>
      </aside>

      {railOpen && (
        <button type="button" className="fixed inset-0 z-30 bg-ink/25 lg:hidden" aria-label="Close menu" onClick={() => setRailOpen(false)} />
      )}

      <header className="desk-mast light-mast print:hidden">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setRailOpen((v) => !v)}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-surface lg:hidden"
            aria-label="Menu"
          >
            <Icon name="menu" />
          </button>
          <button
            type="button"
            onClick={() => setRailOpen((v) => !v)}
            className="hidden h-11 w-11 items-center justify-center rounded-xl border border-line bg-surface lg:flex"
            aria-label="Toggle menu"
          >
            <Icon name="menu" />
          </button>
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
            {nav.map((item) => {
              const on = tabOn(pathname, item.match);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  scroll={false}
                  className={`px-3 py-2 text-sm ${on ? "border-b border-ink font-medium text-ink" : "text-ink-soft hover:text-ink"}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          {roomsPage ? (
            <Link href="/dashboard" className="flex h-11 w-11 items-center justify-center rounded-full text-ink-soft hover:bg-paper" aria-label="Close">
              ×
            </Link>
          ) : (
            <>
              <CommandPalette tone="paper" iconOnly />
              <Link href="/checklist" className="relative flex h-11 w-11 items-center justify-center rounded-full text-ink-soft hover:bg-paper" aria-label="Notifications">
                <Icon name="bell" />
                {alerts ? (
                  <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-moss px-1 text-[9px] text-moss-fg">
                    {alerts}
                  </span>
                ) : null}
              </Link>
              <span className="h-9 w-9 overflow-hidden rounded-full border border-line">
                <img src={photo} alt="" className="h-full w-full object-cover" />
              </span>
            </>
          )}
        </div>
      </header>

      <main id="main" ref={pane} tabIndex={-1} className="desk-canvas">
        {children}
      </main>

      <nav
        className="desk-dock border-t border-line bg-surface/95 print:hidden"
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
                  className={`flex min-h-11 flex-col items-center justify-center gap-0.5 text-[10px] font-medium ${
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
            <Link
              href="/rooms"
              className={`flex min-h-11 w-full flex-col items-center justify-center gap-0.5 text-[10px] font-medium ${
                roomsPage ? "text-moss" : "text-muted"
              }`}
            >
              <Icon name="more" />
              More
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
