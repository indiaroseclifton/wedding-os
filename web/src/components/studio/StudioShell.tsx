"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Wordmark } from "@/components/brand/Wordmark";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { CommandPalette } from "@/components/search/CommandPalette";
import "./studio.css";
const links = [
  ["Your projects", "/studio"],
  ["Flowers", "/diy/studio/floral"],
  ["Tables", "/diy/studio/table"],
  ["Paper & websites", "/studio/cards"],
  ["Signs & cutting", "/studio/signage"],
  ["Decor & lighting", "/studio/decor"],
  ["Favors", "/studio/favors"],
  ["Supplies", "/studio/shop"],
  ["Build calendar", "/diy/calendar"],
  ["Boxes & setup", "/studio/packing"],
  ["Connections", "/studio/connections"],
];
export function StudioShell({
  children,
  names,
  weddingDate,
}: {
  children: React.ReactNode;
  names: string;
  weddingDate?: string;
}) {
  const path = usePathname(),
    [open, setOpen] = useState(false);
  return (
    <div className="studio-app">
      <ThemeProvider />
      <a href="#main" className="skip-link">
        Skip to Studio
      </a>
      <header className="studio-mast">
        <div className="studio-brand">
          <Wordmark href="/studio" />
          <span>STUDIO</span>
        </div>
        <p className="studio-wedding">
          {names}
          <span>{weddingDate}</span>
        </p>
        <div className="studio-actions">
          <CommandPalette tone="paper" iconOnly />
          <Link href="/dashboard" className="st-button st-planner-link">
            Wedding planner ↗
          </Link>
          <button
            className="st-button studio-menu"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-controls="studio-nav"
          >
            Menu
          </button>
        </div>
      </header>
      <div className="studio-frame">
        <aside
          id="studio-nav"
          className={`studio-sidebar ${open ? "is-open" : ""}`}
        >
          <p className="st-eyebrow">Your DIY wedding</p>
          <nav aria-label="Studio">
            {links.map(([name, href], i) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`${path === href || (href === "/studio" && path.startsWith("/studio/projects")) ? "is-current" : ""} ${i === 7 ? "st-nav-break" : ""}`}
                aria-current={path === href ? "page" : undefined}
              >
                {name}
                {path === href && <span>↗</span>}
              </Link>
            ))}
          </nav>
          <div className="studio-sidebar-foot">
            <p>
              Made by you.
              <br />
              Ready for the day.
            </p>
            <Link href="/settings">Wedding settings</Link>
            <Link href="/dashboard">Wedding planner ↗</Link>
          </div>
        </aside>
        <main id="main" className="studio-main" key={path}>
          {children}
        </main>
      </div>
    </div>
  );
}
