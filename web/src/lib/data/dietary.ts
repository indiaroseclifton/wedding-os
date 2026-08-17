import type { StoredGuest } from "./store";
import type { EventRsvp } from "./event-rsvp-store";
import { holdingHeads, plateHeads } from "./guest-mail";

export type KitchenMode = "plates" | "holding";

export const ALLERGY_TAGS = [
  { id: "nut", label: "Nut", re: /nut|peanut|tree nut/i },
  { id: "shell", label: "Shellfish", re: /shellfish|shrimp/i },
  { id: "gf", label: "Gluten", re: /gluten|\bgf\b|celiac/i },
  { id: "dairy", label: "Dairy", re: /dairy|lactose/i },
  { id: "veg", label: "Vegetarian", re: /veg(?!an)|vegetarian/i },
  { id: "vegan", label: "Vegan", re: /vegan/i },
  { id: "kid", label: "Kids meal", re: /kid|child/i },
];

export function kitchenGuests(guests: StoredGuest[], mode: KitchenMode = "plates") {
  return guests.filter((g) => (mode === "plates" ? g.rsvp === "YES" : g.rsvp !== "NO"));
}

export function kitchenWeight(g: StoredGuest, mode: KitchenMode = "plates") {
  return mode === "plates" ? plateHeads(g) : holdingHeads(g);
}

export function kitchenRollup(guests: StoredGuest[], mode: KitchenMode = "plates") {
  const pool = kitchenGuests(guests, mode);
  const heads = pool.reduce((s, g) => s + kitchenWeight(g, mode), 0);
  const plates = guests.reduce((s, g) => s + plateHeads(g), 0);
  const holding = guests.reduce((s, g) => s + holdingHeads(g), 0);
  const meals = new Map<string, number>();
  for (const g of pool) {
    const meal = g.meal?.trim() || "Unspecified";
    meals.set(meal, (meals.get(meal) || 0) + kitchenWeight(g, mode));
  }
  const withDiet = pool.filter((g) => g.dietary?.trim());
  const notes = new Map<string, number>();
  for (const g of withDiet) {
    const key = g.dietary!.trim().toLowerCase();
    notes.set(key, (notes.get(key) || 0) + kitchenWeight(g, mode));
  }
  const silent = pool.filter((g) => !g.dietary?.trim()).length;
  const cards = pool.filter((g) =>
    ALLERGY_TAGS.filter((t) => ["nut", "shell", "gf", "dairy"].includes(t.id)).some(
      (a) => a.re.test(g.dietary || "") || a.re.test(g.meal || "")
    )
  );
  const tags = ALLERGY_TAGS.map((t) => ({
    ...t,
    count: pool.filter((g) => t.re.test(g.dietary || "") || t.re.test(g.meal || "")).length,
  })).filter((t) => t.count > 0);
  const leftovers = new Map<string, number>();
  for (const g of withDiet) {
    const raw = g.dietary!.trim();
    if (ALLERGY_TAGS.some((t) => t.re.test(raw))) continue;
    leftovers.set(raw.toLowerCase(), (leftovers.get(raw.toLowerCase()) || 0) + kitchenWeight(g, mode));
  }
  return { pool, heads, plates, holding, meals, notes, silent, cards, tags, leftovers, withDiet };
}

export function dietarySections(guests: StoredGuest[]) {
  const k = kitchenRollup(guests, "plates");
  return {
    headcount: String(k.heads),
    holding: String(k.holding),
    dietary_summary:
      [
        k.holding !== k.heads ? `Plates ${k.heads} · holding ${k.holding}` : `${k.heads} plates`,
        ...Array.from(k.notes.entries()).map(([label, count]) => `${count}× ${label}`),
      ].join("\n") || "No dietary notes recorded",
    dietary_detail:
      k.withDiet
        .map((g) => `${g.name}: ${g.dietary}${g.tableLabel ? ` (${g.tableLabel})` : ""}`)
        .join("\n") || "—",
    meal_counts:
      Array.from(k.meals.entries())
        .map(([label, count]) => `${count}× ${label}`)
        .join("\n") || "No meal choices yet",
  };
}

export function eventDietarySections(
  guests: StoredGuest[],
  rsvps: EventRsvp[],
  eventId: string
) {
  const yes = rsvps.filter((r) => r.eventId === eventId && r.status === "YES");
  const yesIds = new Set(yes.map((r) => r.guestId));
  const attending = guests.filter((g) => yesIds.has(g.id));
  const meals = new Map<string, number>();
  for (const r of yes) {
    const label = r.meal?.trim() || "Unspecified";
    meals.set(label, (meals.get(label) || 0) + 1);
  }
  const withDiet = attending.filter((g) => g.dietary?.trim());
  return {
    headcount: String(attending.length),
    holding: String(attending.length),
    dietary_summary:
      withDiet.map((g) => `${g.name}: ${g.dietary}`).join("\n") || "No dietary notes recorded",
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
