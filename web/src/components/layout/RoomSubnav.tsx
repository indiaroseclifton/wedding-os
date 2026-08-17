"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { groupsForRoom, type NavRoom } from "@/lib/rooms";
import { NAV_ITEMS } from "@/lib/visual-rooms";

function tabOn(pathname: string, match: readonly string[]) {
  return match.some((m) => pathname === m || pathname.startsWith(m + "/"));
}

export function RoomSubnav({ room }: { room?: NavRoom }) {
  const pathname = usePathname();
  const fromPath = NAV_ITEMS.find((item) => item.room && tabOn(pathname, item.match))?.room as NavRoom | undefined;
  const groups = groupsForRoom(fromPath || room || null);
  const [open, setOpen] = useState<string | null>(null);
  const wrap = useRef<HTMLDivElement>(null);

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

  if (!groups.length) return null;

  return (
    <div ref={wrap} className="-mx-1 mb-6 flex flex-wrap items-center gap-1">
      {groups.map((group) => {
        const shown = open === group.label;
        const here = group.items.some((i) => pathname === i.href || pathname.startsWith(i.href + "/"));
        return (
          <div key={group.label} className="relative">
            <button
              type="button"
              onClick={() => setOpen(shown ? null : group.label)}
              className={`flex min-h-9 items-center gap-1.5 rounded-full px-3.5 text-xs font-medium ${
                here ? "bg-ink text-ivory" : "bg-surface text-ink-soft hover:bg-paper"
              }`}
            >
              {group.label}
              <span aria-hidden className="text-[10px] opacity-70">
                {shown ? "▴" : "▾"}
              </span>
            </button>
            {shown ? (
              <div className="absolute left-0 z-20 mt-2 min-w-[12rem] rounded-2xl border border-line bg-paper p-1.5 shadow-lg">
                {group.items.map((item) => {
                  const on = pathname === item.href || pathname.startsWith(item.href + "/");
                  return (
                    <Link
                      key={item.href + item.label}
                      href={item.href}
                      scroll={false}
                      className={`flex min-h-10 items-center rounded-xl px-3 text-sm ${
                        on ? "bg-surface font-medium" : "hover:bg-surface/70"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
