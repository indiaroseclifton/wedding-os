"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ROOM_TREE, type NavNode } from "@/lib/rooms";
import { NAV_ITEMS } from "@/lib/visual-rooms";
import { roomVisible } from "@/lib/shape";

function tabOn(pathname: string, match: readonly string[]) {
  return match.some((m) => pathname === m || pathname.startsWith(m + "/"));
}

function roomForPath(pathname: string) {
  const hit = NAV_ITEMS.find((item) => tabOn(pathname, item.match) && item.room);
  return hit?.room ?? null;
}

export function currentRoomLabel(pathname: string) {
  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) return "Home";
  const hit = NAV_ITEMS.find((item) => tabOn(pathname, item.match));
  return hit?.label || "";
}

export function DeskNav({
  shape,
  guestCount,
  vendorCount,
}: {
  shape?: string;
  guestCount?: number;
  vendorCount?: number;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const current = roomForPath(pathname);
  const [openRoom, setOpenRoom] = useState<string | null>(null);

  useEffect(() => {
    for (const list of Object.values(ROOM_TREE)) {
      for (const node of list) {
        router.prefetch(node.href);
        node.children?.forEach((c) => router.prefetch(c.href));
      }
    }
  }, [router]);

  function countFor(href: string) {
    if (href === "/guests" && guestCount != null) return String(guestCount);
    if (href === "/vendors" && vendorCount != null) return String(vendorCount);
    return null;
  }

  return (
    <nav className="space-y-0.5" aria-label="Rooms">
      {NAV_ITEMS.map((item) => {
        const on = tabOn(pathname, item.match);
        const kids = item.room
          ? ROOM_TREE[item.room]
              .filter((n) => roomVisible(n.href, shape))
              .map((n) => ({
                ...n,
                children: n.children?.filter((c) => roomVisible(c.href, shape)),
              }))
          : null;
        const expanded = item.room != null && openRoom === item.room;
        const count = countFor(item.href);
        return (
          <div key={item.href}>
            <div className="flex items-center">
              <Link
                href={item.href}
                scroll={false}
                prefetch
                className={`flex min-h-11 min-w-0 flex-1 items-center justify-between rounded-lg px-3 text-[15px] ${
                  on
                    ? "bg-surface font-medium text-ink shadow-sm"
                    : "text-moss-fg/80 hover:bg-white/10 hover:text-moss-fg"
                }`}
              >
                <span>{item.label}</span>
                {count ? <span className={`text-xs tabular-nums ${on ? "text-muted" : "text-moss-fg/45"}`}>{count}</span> : null}
              </Link>
              {kids && (
                <button
                  type="button"
                  aria-expanded={expanded}
                  aria-label={`${expanded ? "Hide" : "Show"} ${item.label}`}
                  onClick={() => setOpenRoom(expanded ? null : item.room)}
                  className={`flex h-11 w-9 shrink-0 items-center justify-center text-lg ${
                    on ? "text-muted" : "text-moss-fg/45"
                  }`}
                >
                  {expanded ? "–" : "+"}
                </button>
              )}
            </div>
            {kids && expanded && (
              <ul className="mb-2 ml-2 mt-0.5 space-y-0.5 border-l border-white/15 pl-2">
                {kids.map((child: NavNode) => (
                  <li key={child.href + child.label}>
                    <Link
                      href={child.href}
                      scroll={false}
                      prefetch
                      className={`block rounded-md px-2 py-1.5 text-[13px] ${
                        pathname === child.href || pathname.startsWith(child.href + "/")
                          ? "text-moss-fg"
                          : "text-moss-fg/55 hover:text-moss-fg"
                      }`}
                    >
                      {child.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </nav>
  );
}
