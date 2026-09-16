"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CommandPalette } from "@/components/search/CommandPalette";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { DeskNav, currentRoomLabel } from "@/components/layout/DeskNav";
import { TopNav } from "@/components/layout/TopNav";
import { Wordmark } from "@/components/brand/Wordmark";
import { MORE_ROOMS, NAV_ITEMS, firstNames } from "@/lib/visual-rooms";
import { roomVisible } from "@/lib/shape";
import { Icon } from "@/components/icons";

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
  const [more, setMore] = useState(false);
  const names = firstNames(coupleNames, userName || "You");
  const home = pathname === "/dashboard" || pathname === "/";
  const photo = coverUrl || "/brand/flowers.jpg";
  const extras = MORE_ROOMS.filter((r) => roomVisible(r.href, shape));
  const hasRail = NAV_ITEMS.some((item) => item.room && tabOn(pathname, item.match));

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
    for (const item of NAV_ITEMS) router.prefetch(item.href);
    router.prefetch("/settings");
    router.prefetch("/v2");
  }, [router]);

  useEffect(() => {
    setRailOpen(false);
    setMore(false);
    pane.current?.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <div className={`desk ${home ? "is-home" : ""} ${hasRail ? "has-rail" : ""}`}>
      <a href="#main" className="skip-link">
        Skip to the desk
      </a>
      <ThemeProvider />

      <div className="print:hidden border-b border-line bg-ink text-center text-[11px] tracking-wide text-ivory">
        <Link href="/v2" className="inline-block min-h-10 px-3 py-2">
          V2 PREVIEW — not production · open items and notes
        </Link>
      </div>

      <header className="desk-mast light-mast print:hidden">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={() => setRailOpen((v) => !v)}
            className="flex h-11 w-11 items-center justify-center rounded-lg border border-line bg-surface lg:hidden"
            aria-label="Menu"
          >
            <Icon name="menu" />
          </button>
          <Wordmark />
        </div>
        <TopNav />
        <div className="flex items-center gap-1">
          <CommandPalette tone="paper" iconOnly />
          <Link
            href="/dashboard#attention"
            className="relative flex h-11 w-11 items-center justify-center rounded-full text-ink-soft hover:bg-paper"
            aria-label="Notifications"
          >
            <Icon name="bell" />
            {alerts ? (
              <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-ink px-1 text-[9px] text-ivory">
                {alerts}
              </span>
            ) : null}
          </Link>
          <Link href="/settings" className="h-9 w-9 overflow-hidden rounded-full border border-line" aria-label="Settings">
            <img src={photo} alt="" className="h-full w-full object-cover" />
          </Link>
        </div>
      </header>

      {hasRail ? (
        <aside className={`desk-rail light-rail ${railOpen ? "is-open" : ""}`}>
          <p className="px-5 pt-6 text-[10px] font-medium uppercase tracking-[0.2em] text-muted">
            {currentRoomLabel(pathname) || "Vowfolk"}
          </p>
          <div className="min-h-0 flex-1 overflow-y-auto">
            <DeskNav shape={shape} guestCount={guestCount} vendorCount={vendorCount} />
          </div>
        </aside>
      ) : null}

      {railOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-ink/20 lg:hidden"
          aria-label="Close menu"
          onClick={() => setRailOpen(false)}
        />
      )}

      <main id="main" ref={pane} tabIndex={-1} className="desk-canvas">
        {children}
      </main>

      <nav
        className="desk-dock border-t border-line bg-surface/95 print:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <ul className="mx-auto grid max-w-lg grid-cols-5">
          {NAV_ITEMS.map((tab) => {
            const on = tabOn(pathname, tab.match);
            return (
              <li key={tab.href}>
                <Link
                  href={tab.href}
                  scroll={false}
                  prefetch
                  className={`flex min-h-12 flex-col items-center justify-center gap-0.5 text-[10px] font-medium tracking-wide ${
                    on ? "text-ink" : "text-muted"
                  }`}
                  aria-current={on ? "page" : undefined}
                >
                  {tab.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {more && (
        <div className="fixed inset-0 z-50 print:hidden">
          <button type="button" className="absolute inset-0 bg-ink/30" aria-label="Close" onClick={() => setMore(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[86vh] overflow-y-auto rounded-t-3xl bg-paper px-5 pb-10 pt-5">
            <nav className="flex flex-wrap gap-2">
              {extras.map((r) => (
                <Link key={r.href} href={r.href} className="inline-flex min-h-11 items-center rounded-full border border-line bg-surface px-3.5 text-[13px]">
                  {r.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
