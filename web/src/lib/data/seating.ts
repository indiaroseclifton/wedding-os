export type SeatGuest = {
  id: string;
  name: string;
  tableLabel?: string | null;
  seatIndex?: number | null;
  dietary?: string | null;
  rsvp: string;
  side?: string | null;
  partyName?: string | null;
  plusOnes?: number;
  plusOneNames?: string[];
};

export function seatWeight(g: SeatGuest) {
  return 1 + Math.max(0, g.plusOnes || 0);
}

export function householdKey(g: SeatGuest) {
  if (g.partyName?.trim()) return g.partyName.trim();
  const last = g.name.trim().split(/\s+/).slice(-1)[0] || g.name;
  return last;
}

export function groupHouseholds(guests: SeatGuest[]) {
  const map = new Map<string, SeatGuest[]>();
  for (const g of guests) {
    const key = householdKey(g);
    const list = map.get(key) || [];
    list.push(g);
    map.set(key, list);
  }
  return [...map.entries()]
    .map(([key, members]) => ({
      key,
      members,
      weight: members.reduce((s, m) => s + seatWeight(m), 0),
    }))
    .sort((a, b) => b.weight - a.weight || a.key.localeCompare(b.key));
}

export function tableFill(tableName: string, guests: SeatGuest[]) {
  return guests
    .filter((g) => g.tableLabel === tableName)
    .reduce((s, g) => s + seatWeight(g), 0);
}

export function autoSeat<T extends SeatGuest>(
  tables: { name: string; capacity: number }[],
  guests: T[]
): { id: string; table: string }[] {
  const remaining = new Map(tables.map((t) => [t.name, t.capacity - tableFill(t.name, guests)]));
  const plan: { id: string; table: string }[] = [];
  const open = guests.filter((g) => !g.tableLabel && g.rsvp !== "NO");
  for (const house of groupHouseholds(open)) {
    let target: string | undefined;
    for (const [name, left] of remaining) {
      if (left >= house.weight) {
        target = name;
        break;
      }
    }
    if (!target) continue;
    remaining.set(target, (remaining.get(target) || 0) - house.weight);
    for (const m of house.members) plan.push({ id: m.id, table: target });
  }
  return plan;
}
