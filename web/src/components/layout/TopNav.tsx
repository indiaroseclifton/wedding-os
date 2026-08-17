"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef } from "react";
import { ROOM_GROUPS } from "@/lib/rooms";
import { NAV_ITEMS } from "@/lib/visual-rooms";
import { useNavMenu } from "@/components/layout/useNavMenu";

function tabOn(pathname: string, match: readonly string[]) {
  return match.some((m) => pathname === m || pathname.startsWith(m + "/"));
}

export function TopNav() {
  const pathname = usePathname();
  const { open, intend, delayClose, toggle, close } = useNavMenu();
  const wrap = useRef<HTMLElement>(null);
  const uid = useId();

  useEffect(() => {
    close();
  }, [pathname]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <nav
      ref={wrap}
      className="hidden items-center gap-0.5 lg:flex"
      aria-label="Main"
      onBlur={(e) => {
        if (!wrap.current?.contains(e.relatedTarget as Node)) close();
      }}
    >
      {NAV_ITEMS.map((tab, i) => {
        const on = tabOn(pathname, tab.match);
        const groups = tab.room ? ROOM_GROUPS[tab.room] : [];
        const hasMenu = Boolean(tab.room);
        const shown = open === tab.label;
        const menuId = `${uid}-${tab.label}`;
        const end = i === NAV_ITEMS.length - 1;
        return (
          <div
            key={tab.href}
            className="relative flex items-center"
            onMouseEnter={() => hasMenu && intend(tab.label)}
            onMouseLeave={delayClose}
          >
            <Link
              href={tab.href}
              scroll={false}
              prefetch
              className={`relative px-2.5 py-2 text-[11px] font-medium uppercase tracking-[0.18em] ${
                on ? "text-ink" : "text-muted hover:text-ink"
              }`}
            >
              {tab.label}
              {on ? <span className="absolute inset-x-2.5 -bottom-1 h-px bg-dusty" /> : null}
            </Link>
            {hasMenu ? (
              <button
                type="button"
                aria-label={`${tab.label} menu`}
                aria-expanded={shown}
                aria-haspopup="menu"
                aria-controls={menuId}
                onClick={() => toggle(tab.label)}
                className={`-ml-1 flex h-8 w-7 items-center justify-center rounded-full text-ink-soft hover:bg-paper ${
                  on ? "text-ink" : ""
                }`}
              >
                <span
                  aria-hidden
                  className={`text-[9px] leading-none transition-transform duration-150 ${shown ? "rotate-180" : ""}`}
                >
                  ▾
                </span>
              </button>
            ) : null}
            {hasMenu && shown ? (
              <div
                id={menuId}
                role="menu"
                className={`absolute top-full z-30 pt-2 ${end ? "right-0" : "left-0"}`}
              >
                <div className="flex gap-6 rounded-2xl border border-line bg-paper p-4 shadow-[0_16px_40px_-20px_rgba(28,26,22,0.35)]">
                  {groups.map((g) => (
                    <div key={g.label} className="min-w-[10rem]">
                      <Link
                        href={g.href}
                        role="menuitem"
                        className="mb-1.5 block px-2 text-[10px] font-medium uppercase tracking-[0.16em] text-muted hover:text-ink"
                      >
                        {g.label}
                      </Link>
                      <ul>
                        {g.items.map((item) => {
                          const here = pathname === item.href || pathname.startsWith(item.href + "/");
                          return (
                            <li key={item.href + item.label}>
                              <Link
                                href={item.href}
                                role="menuitem"
                                className={`flex min-h-9 items-center rounded-lg px-2 text-sm ${
                                  here ? "bg-surface font-medium" : "hover:bg-surface/70"
                                }`}
                              >
                                {item.label}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        );
      })}
    </nav>
  );
}
