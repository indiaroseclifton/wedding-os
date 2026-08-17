"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROOM_SUBNAV } from "@/lib/rooms";

export function RoomSubnav({ room }: { room: keyof typeof ROOM_SUBNAV }) {
  const pathname = usePathname();
  const items = ROOM_SUBNAV[room];

  return (
    <div className="-mx-1 mb-6 flex gap-1 overflow-x-auto pb-1">
      {items.map((item) => {
        const on = pathname === item.href || (item.href !== items[0].href && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            scroll={false}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ${
              on ? "bg-moss text-moss-fg" : "bg-surface text-ink-soft hover:bg-paper"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
