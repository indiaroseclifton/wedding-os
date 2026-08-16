"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon } from "@/components/icons";
import { ROOM_SUBNAV } from "@/lib/rooms";
import { NAV_ITEMS } from "@/lib/visual-rooms";

function tabOn(pathname: string, match: readonly string[]) {
  return match.some((m) => pathname === m || pathname.startsWith(m + "/"));
}

function roomForPath(pathname: string) {
  const hit = NAV_ITEMS.find((item) => tabOn(pathname, item.match) && item.room);
  return hit?.room ?? null;
}

export function DeskNav() {
  const pathname = usePathname();
  const router = useRouter();
  const current = roomForPath(pathname);
  const [open, setOpen] = useState<string | null>(current);

  useEffect(() => {
    if (current) setOpen(current);
  }, [current]);

  useEffect(() => {
    for (const list of Object.values(ROOM_SUBNAV)) {
      for (const child of list) router.prefetch(child.href);
    }
  }, [router]);

  return (
    <nav className="space-y-0.5" aria-label="Rooms">
      {NAV_ITEMS.map((item) => {
        const on = tabOn(pathname, item.match);
        const kids = item.room ? ROOM_SUBNAV[item.room] : null;
        const expanded = item.room != null && open === item.room;
        return (
          <div key={item.href}>
            <div className="flex items-center">
              <Link
                href={item.href}
                scroll={false}
                prefetch
                className={`flex min-h-11 min-w-0 flex-1 items-center gap-3 rounded-xl px-3 py-2 text-sm ${
                  on ? "bg-white/70 font-medium text-ink shadow-sm" : "text-ink-soft hover:bg-white/40"
                }`}
              >
                <Icon name={item.icon} />
                {item.label}
              </Link>
              {kids && (
                <button
                  type="button"
                  aria-expanded={expanded}
                  aria-label={`${expanded ? "Hide" : "Show"} ${item.label} rooms`}
                  onClick={() => setOpen(expanded ? null : item.room)}
                  className="flex h-11 w-9 shrink-0 items-center justify-center text-muted"
                >
                  <span className={`text-xs transition-transform ${expanded ? "rotate-90" : ""}`}>›</span>
                </button>
              )}
            </div>
            {kids && expanded && (
              <ul className="mb-1 ml-4 border-l border-white/50 pl-2">
                {kids.map((child) => {
                  const childOn = pathname === child.href || (child.href !== kids[0].href && pathname.startsWith(child.href));
                  return (
                    <li key={child.href}>
                      <Link
                        href={child.href}
                        scroll={false}
                        prefetch
                        className={`flex min-h-10 items-center rounded-lg px-2 text-[13px] ${
                          childOn ? "font-medium text-ink" : "text-muted hover:text-ink"
                        }`}
                      >
                        {child.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}
    </nav>
  );
}

export function currentRoomLabel(pathname: string) {
  const item = NAV_ITEMS.find((n) => tabOn(pathname, n.match));
  if (!item) return null;
  const kids = item.room ? ROOM_SUBNAV[item.room] : null;
  const child = kids?.find((c) => pathname === c.href || (c.href !== kids[0].href && pathname.startsWith(c.href)));
  if (child && child.href !== item.href) return `${item.label} · ${child.label}`;
  return item.label;
}
