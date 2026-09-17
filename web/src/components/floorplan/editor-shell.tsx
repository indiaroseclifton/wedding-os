"use client";

import Link from "next/link";
import { PRINT_CENTER } from "@/lib/print-center";

export function EditorShell() {
  return (
    <div className="flex h-full min-h-[36rem] flex-col bg-paper">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
        <p className="font-serif text-lg">Floor Planner</p>
        <Link
          href={`${PRINT_CENTER.href}?from=floorplan`}
          className="rounded-full bg-ink px-4 py-2 text-xs text-ivory"
        >
          Print
        </Link>
      </div>
      <div className="grid flex-1 gap-0 lg:grid-cols-[14rem_minmax(0,1fr)_14rem]">
        <aside className="hidden border-r border-line p-4 text-sm text-muted lg:block">Tables, stage, bar, dance floor.</aside>
        <div className="flex items-center justify-center bg-moss-soft text-sm text-muted">The room.</div>
        <aside className="hidden border-l border-line p-4 text-sm text-muted lg:block">Measure and name.</aside>
      </div>
    </div>
  );
}
