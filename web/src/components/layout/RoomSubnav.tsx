"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef } from "react";
import { groupsForRoom, type NavRoom } from "@/lib/rooms";
import { NAV_ITEMS } from "@/lib/visual-rooms";
import { useNavMenu } from "@/components/layout/useNavMenu";

function tabOn(pathname: string, match: readonly string[]) {
  return match.some((m) => pathname === m || pathname.startsWith(m + "/"));
}

export function RoomSubnav({ room }: { room?: NavRoom }) {
  const pathname = usePathname();
  const fromPath = NAV_ITEMS.find((item) => item.room && tabOn(pathname, item.match))?.room as NavRoom | undefined;
  const groups = groupsForRoom(fromPath || room || null);
  const { open, intend, delayClose, toggle, close } = useNavMenu();
  const wrap = useRef<HTMLDivElement>(null);
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

  if (!groups.length) return null;

  return (
    <div
      ref={wrap}
      className="-mx-1 mb-6 flex flex-wrap items-center gap-1.5"
      onBlur={(e) => {
        if (!wrap.current?.contains(e.relatedTarget as Node)) close();
      }}
    >
      {groups.map((group) => {
        const shown = open === group.label;
        const here = group.items.some((i) => pathname === i.href || pathname.startsWith(i.href + "/"));
        const current = group.items.find((i) => pathname === i.href || pathname.startsWith(i.href + "/"));
        const menuId = `${uid}-${group.label}`;
        return (
          <div
            key={group.label}
            className="relative"
            onMouseEnter={() => intend(group.label)}
            onMouseLeave={delayClose}
          >
            <button
              type="button"
              aria-expanded={shown}
              aria-haspopup="menu"
              aria-controls={menuId}
              onClick={() => toggle(group.label)}
              className={`flex min-h-9 items-center gap-1.5 rounded-full px-3.5 text-xs font-medium ${
                here ? "bg-ink text-ivory" : "bg-surface text-ink-soft hover:bg-paper"
              }`}
            >
              {current?.label && groups.length > 1 ? `${group.label} · ${current.label}` : group.label}
              <span aria-hidden className={`text-[9px] transition-transform duration-150 ${shown ? "rotate-180" : ""}`}>
                ▾
              </span>
            </button>
            {shown ? (
              <div id={menuId} role="menu" className="absolute left-0 top-full z-20 pt-2">
                <div className="min-w-[12.5rem] rounded-2xl border border-line bg-paper p-1.5 shadow-[0_16px_40px_-20px_rgba(28,26,22,0.35)]">
                  {group.items.map((item) => {
                    const on = pathname === item.href || pathname.startsWith(item.href + "/");
                    return (
                      <Link
                        key={item.href + item.label}
                        href={item.href}
                        role="menuitem"
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
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
