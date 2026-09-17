import type { HowGuide } from "@/lib/how-to";

export const INTAKE_HOW: HowGuide = {
  id: "intake",
  title: "Start the desk together",
  href: "/intake",
  steps: [
    "Sit down together with twenty quiet minutes. Phones down except this page.",
    "Open Intake. Answer what you know. Skip what you do not. Blank is allowed.",
    "Say the names you actually use. Set a date only if it is real. A city is enough for place.",
    "Tap what is already true — date, place, a messy list, food, photos — so the desk does not make you pretend to start over.",
    "Pick the shape of the day. That hides work you will not do.",
    "If you have a public Pinterest board, paste it. Secret boards will not show.",
    "Write the one thing that is loud. Then open the desk. Home, Vision, and Checklist will already have a place to stand.",
  ],
  actions: [
    { label: "Open Intake", href: "/intake" },
    { label: "Open Home", href: "/dashboard" },
    { label: "Open Vision", href: "/planning/vision" },
  ],
};
