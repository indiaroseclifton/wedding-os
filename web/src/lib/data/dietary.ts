import type { StoredGuest } from "./store";
import type { EventRsvp } from "./event-rsvp-store";

export function dietarySections(guests: StoredGuest[]) {
  const attending = guests.filter((g) => g.rsvp !== "NO");
  return rollup(attending);
}

export function eventDietarySections(
  guests: StoredGuest[],
  rsvps: EventRsvp[],
  eventId: string
) {
  const yesIds = new Set(
    rsvps.filter((r) => r.eventId === eventId && r.status === "YES").map((r) => r.guestId)
  );
  const attending = guests.filter((g) => yesIds.has(g.id));
  const meals = new Map<string, number>();
  for (const r of rsvps.filter((x) => x.eventId === eventId && x.status === "YES")) {
    if (r.meal?.trim()) meals.set(r.meal.trim(), (meals.get(r.meal.trim()) || 0) + 1);
  }
  const base = rollup(attending);
  return {
    ...base,
    meal_counts:
      Array.from(meals.entries())
        .map(([label, count]) => `${count}× ${label}`)
        .join("\n") || base.meal_counts,
  };
}

function rollup(attending: StoredGuest[]) {
  const headcount = attending.reduce((s, g) => s + 1 + (g.plusOnes || 0), 0);
  const withDiet = attending.filter((g) => g.dietary?.trim());
  const counts = new Map<string, number>();
  for (const g of withDiet) {
    const key = g.dietary!.trim().toLowerCase();
    counts.set(key, (counts.get(key) || 0) + 1 + (g.plusOnes || 0));
  }
  const meals = new Map<string, number>();
  for (const g of attending) {
    if (!g.meal?.trim()) continue;
    const key = g.meal.trim();
    meals.set(key, (meals.get(key) || 0) + 1);
  }
  return {
    headcount: String(headcount),
    dietary_summary:
      Array.from(counts.entries())
        .map(([label, count]) => `${count}× ${label}`)
        .join("\n") || "No dietary notes recorded",
    dietary_detail:
      withDiet
        .map((g) => `${g.name}: ${g.dietary}${g.tableLabel ? ` (${g.tableLabel})` : ""}`)
        .join("\n") || "—",
    meal_counts:
      Array.from(meals.entries())
        .map(([label, count]) => `${count}× ${label}`)
        .join("\n") || "No meal choices yet",
  };
}
