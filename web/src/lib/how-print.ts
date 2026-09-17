import type { HowGuide } from "@/lib/how-to";

export const PRINT_HOW: HowGuide = {
  id: "print-center",
  title: "Use Print Center",
  href: "/studio/print-center",
  steps: [
    "Open Studio → Print Center. That is the floorplan maker.",
    "Add tables, stage, bar, dance floor. Drag them into the room.",
    "Names and who sits where stay on Seating. This page is the picture and the print sheets.",
    "Print sheets when the room is right. The module file you send will replace this first-cut board.",
  ],
  actions: [
    { label: "Open Print Center", href: "/studio/print-center" },
    { label: "Open Seating", href: "/seating" },
  ],
};
