"use client";

import dynamic from "next/dynamic";
import { HowToButton } from "@/components/v2/HowToPop";
import "../../floor-planner.css";

const EditorShell = dynamic(
  () => import("@/components/floorplan/editor-shell").then((m) => m.EditorShell),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[36rem] items-center justify-center rounded-[1.4rem] border border-line bg-surface text-sm text-muted">
        Opening Floor Planner…
      </div>
    ),
  },
);

export default function FloorPlannerPage() {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted">Studio</p>
          <h1 className="font-serif text-3xl tracking-tight">Floor Planner</h1>
        </div>
        <HowToButton id="floor-print" />
      </div>
      <div className="h-[calc(100dvh-9rem)] min-h-[36rem] overflow-hidden rounded-[1.4rem] border border-line bg-surface">
        <EditorShell />
      </div>
    </div>
  );
}
