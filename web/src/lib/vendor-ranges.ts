export const VENDOR_RANGES: Record<string, { low: string; high: string; line: string }> = {
  Venue: { low: "$4k", high: "$14k", line: "Site fee, Atlanta 2026. Food is extra." },
  Photographer: { low: "$2.8k", high: "$7k", line: "Full day, two people, no album required." },
  Videographer: { low: "$2.5k", high: "$8k", line: "Highlight + documentary. Drone extra." },
  Florist: { low: "$1.8k", high: "$8k", line: "Bouquet + ceremony + tables. DIY buckets are $90–180." },
  Catering: { low: "$75", high: "$180", line: "Per head, food + staff. Bar separate." },
  "DJ / Band": { low: "$1.5k", high: "$6k", line: "DJ vs live. Overtime is the trap." },
  Cake: { low: "$6", high: "$14", line: "Per slice. Small display + sheet in the back." },
  "Hair / Makeup": { low: "$250", high: "$450", line: "Per person, on site. Trial extra." },
  Planner: { low: "$1.8k", high: "$8k", line: "Month-of vs full. Day-of is the floor." },
  Officiant: { low: "$250", high: "$700", line: "Custom vows, travel, rehearsal." },
  Rentals: { low: "$18", high: "$40", line: "Per cloth / setting. Delivery is the real cost." },
  Stationery: { low: "$6", high: "$18", line: "Per suite. Postage not included." },
};

export function rangeFor(category: string) {
  return VENDOR_RANGES[category] || { low: "Ask", high: "Ask", line: "They often won't quote without a date and a headcount. Ask anyway." };
}
