import type { HowGuide } from "@/lib/how-to";

export const FLOOR_HOW: HowGuide = {
  id: "floor-print",
  title: "Use Floor Planner",
  href: "/floorplan",
  steps: [
    "Open Floor Planner.",
    "Set the room. Add tables, stage, bar, dance floor.",
    "Names and who sits where stay on Seating.",
    "When the room is right, press Print. That opens Print Center.",
  ],
  actions: [
    { label: "Open Floor Planner", href: "/floorplan" },
    { label: "Open Seating", href: "/seating" },
  ],
};

export const PRINT_HOW: HowGuide = {
  id: "print-center",
  title: "Use Print Center",
  href: "/studio/print-center",
  steps: [
    "Open Print Center, or press Print inside Floor Planner.",
    "Pick the job: floor sheets, cards, or signs.",
    "Send it to the printer. The drawing stays in Floor Planner.",
  ],
  actions: [
    { label: "Open Print Center", href: "/studio/print-center" },
    { label: "Open Floor Planner", href: "/floorplan" },
  ],
};
