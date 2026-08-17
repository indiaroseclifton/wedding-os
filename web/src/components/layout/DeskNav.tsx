"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
}: {
  shape?: string;
  guestCount?: number;
  vendorCount?: number;
}) {
  const pathname = usePathname();
  const current = roomForPath(pathname);
  const kids = current
    ? ROOM_TREE[current]
        .filter((n) => roomVisible(n.href, shape))
        .map((n) => ({
          ...n,
          children: n.children?.filter((c) => roomVisible(c.href, shape)),
        }))
    : [];

  if (!kids.length) return null;

  return (
    <nav className="space-y-0.5 px-2 py-4" aria-label="In this room">
      {kids.map((child: NavNode) => {
        const on = pathname === child.href || (child.href !== kids[0].href && pathname.startsWith(child.href + "/"));
        return (
          <Link
            key={child.href + child.label}
            href={child.href}
            scroll={false}
            prefetch
            className={`flex min-h-11 items-center rounded-lg px-3 text-[14px] ${
              on ? "bg-paper font-medium text-ink" : "text-ink-soft hover:bg-paper/70 hover:text-ink"
            }`}
          >
            {child.label}
          </Link>
        );
      })}
    </nav>
  );
}
