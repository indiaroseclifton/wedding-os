"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/party", label: "Home" },
  { href: "/party/tasks", label: "Tasks" },
  { href: "/party/attire", label: "Dress" },
  { href: "/party/stay", label: "Stay" },
  { href: "/party/speech", label: "Speech" },
  { href: "/party/day-of", label: "Day" },
] as const;

export function PartyNav() {
  const pathname = usePathname();
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-20 border-t border-white/40 bg-paper/80 backdrop-blur-xl"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto grid max-w-lg grid-cols-6">
        {TABS.map((t) => {
          const on = t.href === "/party" ? pathname === "/party" : pathname.startsWith(t.href);
          return (
            <li key={t.href}>
              <Link
                href={t.href}
                scroll={false}
                className={`flex min-h-11 items-center justify-center text-[11px] ${
                  on ? "font-medium text-moss" : "text-muted"
                }`}
              >
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
