import type { StoredGuest } from "./store";

export function dietarySections(guests: StoredGuest[]) {
  const attending = guests.filter((g) => g.rsvp !== "NO");
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
