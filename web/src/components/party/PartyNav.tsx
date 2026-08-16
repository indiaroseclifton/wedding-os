"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/icons";

const TABS = [
  { href: "/party", label: "Home", icon: "home" },
  { href: "/party/tasks", label: "Tasks", icon: "check" },
  { href: "/party/attire", label: "Dress", icon: "shirt" },
  { href: "/party/stay", label: "Stay", icon: "pin" },
  { href: "/party/speech", label: "Speech", icon: "mic" },
  { href: "/party/day-of", label: "Day", icon: "sun" },
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
                className={`flex min-h-11 flex-col items-center justify-center gap-0.5 text-[10px] ${
                  on ? "font-medium text-moss" : "text-muted"
                }`}
              >
                <Icon name={t.icon} className="h-4 w-4" />
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
