"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon } from "@/components/icons";
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

function nodeOn(pathname: string, node: NavNode, siblings: NavNode[]) {
  if (pathname === node.href) return true;
  if (node.children?.some((c) => pathname === c.href || (c.href !== node.href && pathname.startsWith(c.href + "/")))) {
    return true;
  }
  const isRoot = siblings[0]?.href === node.href;
  if (isRoot) return false;
  return pathname.startsWith(node.href + "/") || pathname === node.href;
}

function leafOn(pathname: string, href: string, parentHref: string) {
  if (pathname === href) return true;
  if (href !== parentHref && pathname.startsWith(href + "/")) return true;
  return false;
}

export function DeskNav({ shape }: { shape?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const current = roomForPath(pathname);
  const [openRoom, setOpenRoom] = useState<string | null>(current);
  const [openBranch, setOpenBranch] = useState<string | null>(null);

  useEffect(() => {
    if (current) setOpenRoom(current);
    if (!current) return;
    const tree = ROOM_TREE[current].filter((n) => roomVisible(n.href, shape));
    const branch = tree.find((n) => n.children?.some((c) => pathname === c.href || pathname.startsWith(c.href + "/")));
    setOpenBranch(branch?.href ?? null);
  }, [current, pathname]);

  useEffect(() => {
    for (const list of Object.values(ROOM_TREE)) {
      for (const node of list) {
        router.prefetch(node.href);
        node.children?.forEach((c) => router.prefetch(c.href));
      }
    }
  }, [router]);

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
                  aria-label={`${expanded ? "Hide" : "Show"} ${item.label}`}
                  onClick={() => setOpenRoom(expanded ? null : item.room)}
                  className="flex h-11 w-9 shrink-0 items-center justify-center text-muted"
                >
                  <span className={`text-xs transition-transform ${expanded ? "rotate-90" : ""}`}>›</span>
                </button>
              )}
            </div>
            {kids && expanded && (
              <ul className="mb-1 ml-3 border-l border-white/50 pl-2">
                {kids.map((child) => {
                  const active = nodeOn(pathname, child, kids);
                  const hasKids = Boolean(child.children?.length);
                  const branchOpen = openBranch === child.href;
                  return (
                    <li key={child.href + child.label}>
                      <div className="flex items-center">
                        <Link
                          href={child.href}
                          scroll={false}
                          prefetch
                          className={`flex min-h-9 min-w-0 flex-1 items-center rounded-lg px-2 text-[13px] ${
                            active ? "font-medium text-ink" : "text-muted hover:text-ink"
                          }`}
                        >
                          {child.label}
                        </Link>
                        {hasKids && (
                          <button
                            type="button"
                            aria-expanded={branchOpen}
                            aria-label={`${branchOpen ? "Hide" : "Show"} ${child.label}`}
                            onClick={() => setOpenBranch(branchOpen ? null : child.href)}
                            className="flex h-9 w-7 shrink-0 items-center justify-center text-muted"
                          >
                            <span className={`text-[10px] transition-transform ${branchOpen ? "rotate-90" : ""}`}>›</span>
                          </button>
                        )}
                      </div>
                      {hasKids && branchOpen && (
                        <ul className="mb-1 ml-2 border-l border-white/40 pl-2">
                          {child.children!.map((leaf) => (
                            <li key={leaf.href}>
                              <Link
                                href={leaf.href}
                                scroll={false}
                                prefetch
                                className={`flex min-h-8 items-center rounded-md px-2 text-[12px] ${
                                  leafOn(pathname, leaf.href, child.href) ? "font-medium text-ink" : "text-muted hover:text-ink"
                                }`}
                              >
                                {leaf.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
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
  if (!item.room) return item.label;
  const tree = ROOM_TREE[item.room];
  for (const node of tree) {
    const leaf = node.children?.find((c) => pathname === c.href || (c.href !== node.href && pathname.startsWith(c.href)));
    if (leaf && leaf.label !== node.label) return `${item.label} · ${node.label} · ${leaf.label}`;
    if (pathname === node.href || (node.href !== tree[0].href && pathname.startsWith(node.href))) {
      return `${item.label} · ${node.label}`;
    }
  }
  return item.label;
}
