"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { groupsForRoom, type NavNode } from "@/lib/rooms";
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

function itemOn(pathname: string, href: string, first: boolean) {
  return pathname === href || (!first && pathname.startsWith(href + "/"));
}

export function DeskNav({
  shape,
}: {
  shape?: string;
  guestCount?: number;
  vendorCount?: number;
}) {
  const pathname = usePathname();
  const groups = groupsForRoom(roomForPath(pathname))
    .map((g) => ({
      ...g,
      items: g.items
        .filter((n) => roomVisible(n.href, shape))
        .map((n) => ({ ...n, children: n.children?.filter((c) => roomVisible(c.href, shape)) })),
    }))
    .filter((g) => g.items.length);

  const [open, setOpen] = useState<string | null>(null);

  if (!groups.length) return null;

  return (
    <nav className="space-y-5 px-2 py-4" aria-label="In this room">
      {groups.map((group) => {
        const active = group.items.some((n) => pathname === n.href || pathname.startsWith(n.href + "/"));
        const groupOpen = open === null ? groups.length === 1 || active : open === group.label;
        return (
          <div key={group.label}>
            {groups.length > 1 ? (
              <button
                type="button"
                onClick={() => setOpen(open === group.label ? "" : group.label)}
                className="flex w-full items-center justify-between px-3 pb-1 text-[10px] font-medium uppercase tracking-[0.18em] text-muted"
              >
                {group.label}
                <span aria-hidden>{groupOpen ? "–" : "+"}</span>
              </button>
            ) : (
              <p className="px-3 pb-1 text-[10px] font-medium uppercase tracking-[0.18em] text-muted">{group.label}</p>
            )}
            {groupOpen
              ? group.items.map((child: NavNode) => {
                  const on = itemOn(pathname, child.href, child.href === group.items[0]?.href && child.href === group.href);
                  const leafOn = (h: string) => pathname === h || pathname.startsWith(h + "/");
                  return (
                    <div key={child.href + child.label}>
                      <Link
                        href={child.href}
                        scroll={false}
                        prefetch
                        className={`flex min-h-11 items-center rounded-lg px-3 text-[14px] ${
                          on ? "bg-paper font-medium text-ink" : "text-ink-soft hover:bg-paper/70 hover:text-ink"
                        }`}
                      >
                        {child.label}
                      </Link>
                      {child.children && on
                        ? child.children.map((c) => (
                            <Link
                              key={c.href + c.label}
                              href={c.href}
                              scroll={false}
                              className={`ml-3 flex min-h-10 items-center rounded-lg px-3 text-[13px] ${
                                leafOn(c.href) ? "text-ink" : "text-muted hover:text-ink"
                              }`}
                            >
                              {c.label}
                            </Link>
                          ))
                        : null}
                    </div>
                  );
                })
              : null}
          </div>
        );
      })}
    </nav>
  );
}
