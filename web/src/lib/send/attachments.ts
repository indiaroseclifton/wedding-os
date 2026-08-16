export const ATTACHMENT_IDS = [
  "when_where",
  "call_sheet",
  "floor",
  "seating",
  "cues",
  "kitchen",
  "money",
  "clauses",
  "contacts",
  "floral",
] as const;

export type AttachmentId = (typeof ATTACHMENT_IDS)[number];

export const ATTACHMENTS: Record<AttachmentId, { label: string; line: string }> = {
  when_where: { label: "When & where", line: "Date, city, emergency contact" },
  call_sheet: { label: "Call sheet", line: "Their slice of the run of show" },
  floor: { label: "Room", line: "Tables and fixtures" },
  seating: { label: "Seating", line: "Who sits where" },
  cues: { label: "Cue book", line: "Must play, do not play, moments" },
  kitchen: { label: "Kitchen", line: "Headcount, meals, allergy cards, leftovers" },
  money: { label: "Money", line: "Their deposit, progress, final" },
  clauses: { label: "What we marked", line: "Hours, lead, flagged asks" },
  contacts: { label: "Contacts", line: "Couple and the other vendors they need" },
  floral: { label: "Stems", line: "Notes and what’s on the floor" },
};

export function isAttachmentId(value: string): value is AttachmentId {
  return (ATTACHMENT_IDS as readonly string[]).includes(value);
}

export function defaultAttachments(category: string): AttachmentId[] {
  const c = category.toLowerCase();
  const base: AttachmentId[] = ["when_where", "call_sheet", "money", "contacts"];
  if (/dj|band|music/.test(c)) return [...base, "cues"];
  if (/cater|food|bar/.test(c)) return [...base, "kitchen", "seating", "floor"];
  if (/venue/.test(c)) return [...base, "floor", "seating", "clauses"];
  if (/florist|floral|flower/.test(c)) return [...base, "floral", "floor"];
  if (/photo|video/.test(c)) return [...base, "clauses"];
  if (/cake/.test(c)) return [...base, "kitchen"];
  if (/rent/.test(c)) return [...base, "floor"];
  if (/transport|limo|bus/.test(c)) return [...base];
  if (/hair|makeup|beauty|hmu/.test(c)) return [...base];
  return [...base, "clauses"];
}

export function categoryKey(category: string) {
  const c = category.toLowerCase();
  if (/dj|band|music/.test(c)) return "dj";
  if (/cater|food|bar/.test(c)) return "catering";
  if (/venue/.test(c)) return "venue";
  if (/florist|floral|flower/.test(c)) return "florist";
  if (/photo/.test(c)) return "photo";
  if (/video/.test(c)) return "video";
  if (/cake/.test(c)) return "cake";
  if (/rent/.test(c)) return "rentals";
  if (/planner|coord/.test(c)) return "planner";
  return "other";
}
