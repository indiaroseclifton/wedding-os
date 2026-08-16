export const TIMELINE_OFFSETS = [
  { id: "m12", label: "12 months out", months: -12 },
  { id: "m9", label: "9 months out", months: -9 },
  { id: "m6", label: "6 months out", months: -6 },
  { id: "m4", label: "4 months out", months: -4 },
  { id: "m2", label: "2 months out", months: -2 },
  { id: "m1", label: "1 month out", months: -1 },
  { id: "w2", label: "2 weeks out", days: -14 },
  { id: "w1", label: "Week of", days: -7 },
  { id: "day", label: "Wedding day", days: 0 },
  { id: "after", label: "2 weeks after", days: 14 },
] as const;

export function shiftDate(weddingDate: string, months = 0, days = 0) {
  const d = new Date(`${weddingDate}T12:00:00`);
  if (Number.isNaN(d.getTime())) return weddingDate;
  d.setMonth(d.getMonth() + months);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function applyOffsetId(weddingDate: string, offsetId: string) {
  const off = TIMELINE_OFFSETS.find((o) => o.id === offsetId);
  if (!off) return weddingDate;
  return shiftDate(weddingDate, "months" in off ? off.months : 0, "days" in off ? off.days : 0);
}

export function parseIsoDate(when: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(when)) {
    const d = new Date(`${when}T12:00:00`);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const d = new Date(when);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function relativeToWedding(when: string, weddingDate?: string) {
  const date = parseIsoDate(when);
  if (!date) return when;
  const pretty = date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  if (!weddingDate) return pretty;
  const w = parseIsoDate(weddingDate);
  if (!w) return pretty;
  const diff = Math.round((w.getTime() - date.getTime()) / 86400000);
  if (diff === 0) return `${pretty} · the day`;
  if (diff > 0 && diff < 11) return `${pretty} · ${diff} day${diff === 1 ? "" : "s"} out`;
  if (diff >= 11 && diff < 45) return `${pretty} · ${Math.round(diff / 7)} weeks out`;
  if (diff >= 45) return `${pretty} · ${Math.round(diff / 30)} months out`;
  if (diff > -14) return `${pretty} · ${Math.abs(diff)} days after`;
  return `${pretty} · after`;
}

export const SEED_MILESTONES = [
  { title: "Lock the date and budget", offset: "m12", category: "Planning" },
  { title: "Book venue", offset: "m12", category: "Venue" },
  { title: "Book photographer", offset: "m9", category: "Vendors" },
  { title: "Book florist or start DIY flowers", offset: "m9", category: "Flowers" },
  { title: "Send save-the-dates", offset: "m9", category: "Guests" },
  { title: "Send invitations", offset: "m4", category: "Guests" },
  { title: "Draft seating", offset: "m2", category: "Guests" },
  { title: "Final guest count to vendors", offset: "m1", category: "Vendors" },
  { title: "Confirm every vendor", offset: "w1", category: "The day" },
  { title: "Wedding day", offset: "day", category: "The day" },
  { title: "Thank-you notes", offset: "after", category: "After" },
];
