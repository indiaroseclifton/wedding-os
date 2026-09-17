import { CATALOG, hasSeats, isNumberedTable, isRowKind } from "./catalog";
import type { Plan, PlacedItem } from "./types";

export function setupList(items: PlacedItem[]): { label: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const item of items) {
    if (item.kind === "label") continue;
    const found = CATALOG.find((c) => c.kind === item.kind && c.name === item.label) ?? CATALOG.find((c) => c.kind === item.kind);
    const label = found?.name ?? item.label ?? item.kind;
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

export function seatingSummary(plan: Plan): { tables: number; rows: number; seats: number; named: number } {
  const tables = plan.items.filter((i) => i.number != null && isNumberedTable(i.kind)).length;
  const rows = plan.items.filter((i) => isRowKind(i.kind)).length;
  const seats = plan.items.reduce((n, i) => n + (hasSeats(i.kind) ? i.seatCount : 0), 0);
  const named = plan.items.reduce(
    (n, i) => n + (i.seats?.filter((s) => s.name.trim() || s.guestId).length ?? 0),
    0,
  );
  return { tables, rows, seats, named };
}
