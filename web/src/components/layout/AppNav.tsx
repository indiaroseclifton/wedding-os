"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function formatNavDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const GROUPS: { label: string; items: { href: string; label: string }[] }[] = [
  {
    label: "Core",
    items: [
      { href: "/dashboard", label: "Home" },
      { href: "/checklist", label: "Checklist" },
      { href: "/diy", label: "DIY" },
      { href: "/demo", label: "Demo" },
      { href: "/search", label: "Search" },
      { href: "/tasks", label: "Tasks" },
      { href: "/decisions", label: "Decisions" },
    ],
  },
  {
    label: "Guests",
    items: [
      { href: "/guests", label: "List" },
      { href: "/dietary", label: "Dietary" },
      { href: "/seating", label: "Seating" },
      { href: "/floorplan", label: "Floor plan" },
      { href: "/travel", label: "Travel" },
    ],
  },
  {
    label: "Vendors",
    items: [
      { href: "/vendors", label: "Vendors" },
      { href: "/payments", label: "Payments" },
      { href: "/handoffs", label: "Handoffs" },
      { href: "/music", label: "Music" },
    ],
  },
  {
    label: "Day-of",
    items: [
      { href: "/day-of", label: "Board" },
      { href: "/people", label: "People" },
      { href: "/party", label: "Party view" },
      { href: "/attire", label: "Attire" },
    ],
  },
  {
    label: "More",
    items: [
      { href: "/timeline", label: "Timeline" },
      { href: "/events", label: "Events" },
      { href: "/polls", label: "Polls" },
      { href: "/traditions", label: "Traditions" },
      { href: "/legal", label: "Legal" },
      { href: "/registry", label: "Registry" },
      { href: "/thanks", label: "Thank-yous" },
      { href: "/media", label: "Media" },
      { href: "/budget", label: "Budget" },
      { href: "/moodboard", label: "Moodboard" },
      { href: "/notes", label: "Notes" },
      { href: "/workload", label: "Workload" },
      { href: "/settings", label: "Settings" },
    ],
  },
];

export function AppNav({
  userName,
  weddingName,
  weddingDate,
}: {
  userName: string;
  weddingName?: string;
  weddingDate?: string;
}) {
  const pathname = usePathname();

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div>
          <p className="text-sm font-semibold tracking-tight">{weddingName || "Wedding OS"}</p>
          {weddingDate && (
            <p className="text-[11px] text-slate-500">{formatNavDate(weddingDate)}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <p className="text-xs text-slate-500">{userName}</p>
          <button
            type="button"
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              window.location.href = "/login";
            }}
            className="text-xs font-medium text-slate-500 underline hover:text-slate-900"
          >
            Sign out
          </button>
        </div>
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
