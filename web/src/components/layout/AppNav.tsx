"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BrandMark } from "@/components/brand/BrandMark";

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
      { href: "/dashboard", label: "This week" },
      { href: "/checklist", label: "Checklist" },
      { href: "/diy", label: "DIY" },
      { href: "/diy/calendar", label: "DIY week" },
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
      { href: "/site", label: "Guest site" },
      { href: "/dietary", label: "Dietary" },
      { href: "/seating", label: "Seating" },
      { href: "/floorplan", label: "Floor plan" },
      { href: "/travel", label: "Travel" },
    ],
  },
  {
    label: "Vendors",
    items: [
      { href: "/vendors", label: "My vendors" },
      { href: "/vendors/browse", label: "Browse" },
      { href: "/vendors/shortlist", label: "Compare" },
      { href: "/payments", label: "Payments" },
      { href: "/handoffs", label: "Handoffs" },
      { href: "/music", label: "Music" },
    ],
  },
  {
    label: "Day-of",
    items: [
      { href: "/day-of", label: "Board" },
      { href: "/run-of-show", label: "Run of show" },
      { href: "/packet", label: "Packet" },
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
      { href: "/integrations", label: "Integrations" },
    ],
  },
];

const TABS: { href: string; label: string; match: string[]; icon: string }[] = [
  { href: "/dashboard", label: "Week", match: ["/dashboard"], icon: "week" },
  { href: "/guests", label: "Guests", match: ["/guests", "/site", "/seating", "/floorplan", "/dietary", "/travel"], icon: "guests" },
  { href: "/vendors", label: "Vendors", match: ["/vendors", "/payments", "/handoffs", "/music"], icon: "vendors" },
  { href: "/diy", label: "DIY", match: ["/diy"], icon: "diy" },
  { href: "/day-of", label: "Day-of", match: ["/day-of", "/run-of-show", "/packet", "/people", "/party", "/attire"], icon: "day" },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

function tabActive(pathname: string, match: string[]) {
  return match.some((m) => pathname === m || pathname.startsWith(m + "/"));
}

function Icon({ name, className }: { name: string; className?: string }) {
  const cn = className || "h-5 w-5";
  if (name === "week") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={cn}>
        <rect x="4" y="5" width="16" height="15" rx="2" />
        <path d="M8 3v4M16 3v4M4 10h16" />
      </svg>
    );
  }
  if (name === "guests") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={cn}>
        <circle cx="9" cy="8" r="3" />
        <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
        <circle cx="17" cy="9" r="2.2" />
        <path d="M16 19a4.5 4.5 0 0 1 5-4.4" />
      </svg>
    );
  }
  if (name === "vendors") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={cn}>
        <path d="M4 10h16l-1 10H5L4 10Z" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      </svg>
    );
  }
  if (name === "diy") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={cn}>
        <path d="M12 4c2 3 6 5 6 9a6 6 0 1 1-12 0c0-4 4-6 6-9Z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={cn}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v5l3 2" />
    </svg>
  );
}

function NavLinks({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <div className="space-y-4">
      {GROUPS.map((group) => (
        <div key={group.label}>
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            {group.label}
          </p>
          <div className="flex flex-wrap gap-x-3 gap-y-1.5">
            {group.items.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={`text-sm font-medium ${
                    active ? "text-slate-900 underline" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

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
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur print:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/dashboard" className="flex min-w-0 items-center gap-2">
            <BrandMark size={22} />
            <span className="min-w-0">
            <p className="truncate text-[15px] font-medium tracking-tight text-ink">
              {weddingName || "Wedding OS"}
            </p>
            {weddingDate && (
              <p className="text-[11px] text-muted">{formatNavDate(weddingDate)}</p>
            )}
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <p className="hidden text-xs text-slate-500 sm:block">{userName}</p>
            <button
              type="button"
              onClick={signOut}
              className="hidden text-xs font-medium text-slate-500 underline hover:text-slate-900 lg:inline"
            >
              Sign out
            </button>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 lg:hidden"
              aria-expanded={open}
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? (
                <span className="text-lg leading-none">×</span>
              ) : (
                <span className="flex flex-col gap-1">
                  <span className="block h-0.5 w-4 bg-slate-900" />
                  <span className="block h-0.5 w-4 bg-slate-900" />
                  <span className="block h-0.5 w-4 bg-slate-900" />
                </span>
              )}
            </button>
          </div>
        </div>
        <div className="mx-auto hidden max-w-6xl px-4 pb-3 lg:block">
          <NavLinks pathname={pathname} />
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden print:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/40"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 right-0 flex w-[min(100%,20rem)] flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <div>
                <p className="text-sm font-semibold">{userName}</p>
                <p className="text-[11px] text-slate-500">All rooms</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="text-sm underline">
                Close
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4">
              <NavLinks pathname={pathname} onNavigate={() => setOpen(false)} />
            </div>
            <div className="border-t border-slate-100 px-4 py-3">
              <button type="button" onClick={signOut} className="text-sm font-medium underline">
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}

      <nav
        className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur lg:hidden print:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <ul className="mx-auto grid max-w-lg grid-cols-5">
          {TABS.map((tab) => {
            const on = tabActive(pathname, tab.match);
            return (
              <li key={tab.href}>
                <Link
                  href={tab.href}
                  className={`flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium ${
                    on ? "text-moss" : "text-muted"
                  }`}
                >
                  <Icon name={tab.icon} />
                  {tab.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
