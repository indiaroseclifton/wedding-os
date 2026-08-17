"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ROOM_GROUPS } from "@/lib/rooms";
import { NAV_ITEMS } from "@/lib/visual-rooms";

function tabOn(pathname: string, match: readonly string[]) {
  return match.some((m) => pathname === m || pathname.startsWith(m + "/"));
}

export function TopNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState<string | null>(null);
  const wrap = useRef<HTMLElement>(null);

  useEffect(() => {
    setOpen(null);
  }, [pathname]);

  useEffect(() => {
    function close(e: MouseEvent) {
      if (!wrap.current?.contains(e.target as Node)) setOpen(null);
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <nav ref={wrap} className="hidden items-center gap-1 lg:flex" aria-label="Main">
      {NAV_ITEMS.map((tab) => {
        const on = tabOn(pathname, tab.match);
        const groups = tab.room ? ROOM_GROUPS[tab.room] : [];
        const hasMenu = Boolean(tab.room);
        return (
          <div key={tab.href} className="relative flex items-center">
            <Link
              href={tab.href}
              scroll={false}
              prefetch
              className={`relative px-2 py-2 text-[11px] font-medium uppercase tracking-[0.18em] ${
                on ? "text-ink" : "text-muted hover:text-ink"
              }`}
            >
              {tab.label}
              {on ? <span className="absolute inset-x-2 -bottom-1 h-px bg-dusty" /> : null}
            </Link>
            {hasMenu ? (
              <button
                type="button"
                aria-label={`${tab.label} menu`}
                onClick={() => setOpen(open === tab.label ? null : tab.label)}
                className={`-ml-1 px-1 py-2 text-[10px] ${on ? "text-ink" : "text-muted"}`}
              >
                ▾
              </button>
            ) : null}
            {hasMenu && open === tab.label ? (
              <div className="absolute left-0 top-full z-30 mt-2 flex gap-6 rounded-2xl border border-line bg-paper p-4 shadow-lg">
                {groups.map((g) => (
                  <div key={g.label} className="min-w-[9.5rem]">
                    <Link
                      href={g.href}
                      className="mb-2 block text-[10px] font-medium uppercase tracking-[0.16em] text-muted"
                    >
                      {g.label}
                    </Link>
                    <ul className="space-y-0.5">
                      {g.items.map((item) => (
                        <li key={item.href + item.label}>
                          <Link
                            href={item.href}
                            className={`flex min-h-9 items-center rounded-lg px-2 text-sm ${
                              pathname === item.href || pathname.startsWith(item.href + "/")
                                ? "bg-surface font-medium"
                                : "hover:bg-surface/70"
                            }`}
                          >
                            {item.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        );
      })}
    </nav>
  );
}
