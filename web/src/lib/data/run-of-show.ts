export const AUDIENCES = ["couple", "party", "vendor", "guests"] as const;
export type Audience = (typeof AUDIENCES)[number];

export type SlotComment = {
  id: string;
  author: string;
  body: string;
  createdAt: string;
};

export type RunSlot = {
  id: string;
  time: string;
  endTime?: string;
  title: string;
  guestTitle?: string;
  location?: string;
  lead?: string;
  assignee?: string;
  notes?: string;
  owner?: string;
  audiences?: Audience[];
  diySlug?: string;
  plan?: "main" | "rain";
  comments?: SlotComment[];
  confirmedBy?: string[];
};

const OWNER_MAP: Record<string, Audience[]> = {
  all: [...AUDIENCES],
  couple: ["couple"],
  party: ["party"],
  vendor: ["vendor"],
  guests: ["guests"],
  catering: ["vendor"],
};

export function audiencesOf(slot: Pick<RunSlot, "audiences" | "owner">): Audience[] {
  if (slot.audiences && slot.audiences.length) return slot.audiences;
  const key = (slot.owner || "all").toLowerCase();
  return OWNER_MAP[key] || [...AUDIENCES];
}

export function slotVisible(slot: RunSlot, view: Audience | "all") {
  if (view === "all") return true;
  return audiencesOf(slot).includes(view);
}

export function slotTitle(slot: RunSlot, view: Audience | "all") {
  if (view === "guests" && slot.guestTitle?.trim()) return slot.guestTitle.trim();
  return slot.title;
}

export function formatRange(time: string, endTime?: string) {
  if (!endTime || endTime === time) return time;
  return `${time}–${endTime}`;
}

export function audienceLabel(a: Audience) {
  return a === "guests" ? "Guests" : a[0].toUpperCase() + a.slice(1);
}

export function sortSlots<T extends { time: string }>(slots: T[]) {
  return [...slots].sort((a, b) => a.time.localeCompare(b.time));
}
