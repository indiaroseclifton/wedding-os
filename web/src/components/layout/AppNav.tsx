"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const GROUPS: { label: string; items: { href: string; label: string }[] }[] = [
  {
    label: "Plan",
    items: [
      { href: "/dashboard", label: "Home" },
      { href: "/search", label: "Search" },
      { href: "/tasks", label: "Tasks" },
      { href: "/timeline", label: "Timeline" },
      { href: "/events", label: "Events" },
      { href: "/decisions", label: "Decisions" },
      { href: "/polls", label: "Polls" },
      { href: "/workload", label: "Workload" },
    ],
  },
  {
    label: "Guests",
    items: [
      { href: "/guests", label: "List" },
      { href: "/dietary", label: "Dietary" },
      { href: "/seating", label: "Seating" },
      { href: "/floorplan", label: "Floor plan" },
    ],
  },
  {
    label: "Vendors",
    items: [
      { href: "/vendors", label: "Vendors" },
      { href: "/payments", label: "Payments" },
      { href: "/handoffs", label: "Handoffs" },
    ],
  },
  {
    label: "Day-of",
    items: [
      { href: "/day-of", label: "Board" },
      { href: "/attire", label: "Attire" },
      { href: "/people", label: "People" },
      { href: "/party", label: "Party view" },
    ],
  },
  {
    label: "More",
    items: [
      { href: "/traditions", label: "Traditions" },
      { href: "/legal", label: "Legal" },
      { href: "/media", label: "Media" },
      { href: "/budget", label: "Budget" },
      { href: "/music", label: "Music" },
      { href: "/moodboard", label: "Moodboard" },
      { href: "/notes", label: "Notes" },
      { href: "/settings", label: "Settings" },
    ],
  },
];

export function AppNav({ userName }: { userName: string }) {
  const pathname = usePathname();

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <p className="text-sm font-semibold tracking-tight">Wedding OS</p>
        <p className="text-xs text-slate-500">{userName}</p>
      </div>
      <div className="mx-auto max-w-6xl space-y-2 px-4 pb-3">
        {GROUPS.map((group) => (
          <div key={group.label} className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="w-14 shrink-0 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              {group.label}
            </span>
            {group.items.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-xs font-medium ${
                    active ? "text-slate-900 underline" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </div>
    </header>
  );
}
