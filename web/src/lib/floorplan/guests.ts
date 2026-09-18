import type { Guest, Plan, PlacedItem, Project, SeatAssignment } from "./types";

export function emptySeats(count: number): SeatAssignment[] {
  return Array.from({ length: Math.max(0, count) }, (_, i) => ({
    seat: i + 1,
    name: "",
    guestId: null,
  }));
}

export function syncSeats(item: PlacedItem): SeatAssignment[] {
  const n = Math.max(0, Math.floor(item.seatCount));
  const prev = item.seats ?? [];
  const next: SeatAssignment[] = [];
  for (let i = 0; i < n; i++) {
    const old = prev[i];
    next.push({
      seat: i + 1,
      name: old?.name ?? "",
      guestId: old?.guestId ?? null,
    });
  }
  return next;
}

export function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, " ").toLowerCase();
}

export function matchGuest(name: string, guests: Guest[]): Guest | null {
  const n = normalizeName(name);
  if (!n) return null;
  return guests.find((g) => normalizeName(g.name) === n) ?? null;
}

export function searchGuests(query: string, guests: Guest[]): Guest[] {
  const q = normalizeName(query);
  if (!q) return guests;
  return guests.filter((g) => {
    if (normalizeName(g.name).includes(q)) return true;
    if (g.party && normalizeName(g.party).includes(q)) return true;
    return false;
  });
}

export function assignedGuestIds(project: Project): Map<string, { plan: string; table: string; seat: number }> {
  const map = new Map<string, { plan: string; table: string; seat: number }>();
  const scan = (plan: Plan, label: string) => {
    for (const item of plan.items) {
      for (const s of item.seats ?? []) {
        if (s.guestId) map.set(s.guestId, { plan: label, table: item.label, seat: s.seat });
      }
    }
  };
  for (const plan of project.plans) scan(plan, plan.name);
  return map;
}

export function namedSeatCount(items: PlacedItem[]): number {
  return items.reduce((sum, i) => sum + (i.seats ?? []).filter((s) => s.name.trim() || s.guestId).length, 0);
}

export function sampleGuests(): Guest[] {
  const names = [
    ["Alex Rivera", "Rivera"],
    ["Jordan Hale", "Hale"],
    ["Sam Okonkwo", "Okonkwo"],
    ["Riley Chen", "Chen"],
    ["Casey Nguyen", "Nguyen"],
    ["Morgan Ellis", "Ellis"],
    ["Quinn Patel", "Patel"],
    ["Avery Brooks", "Brooks"],
    ["Jamie Park", "Park"],
    ["Taylor Singh", "Singh"],
    ["Reese Alvarez", "Alvarez"],
    ["Drew Kim", "Kim"],
    ["Cameron Walsh", "Walsh"],
    ["Harper Diaz", "Diaz"],
    ["Rowan Blake", "Blake"],
    ["Skyler Amin", "Amin"],
    ["Parker Jones", "Jones"],
    ["Eden Rossi", "Rossi"],
    ["Finley Cruz", "Cruz"],
    ["Sage Bennett", "Bennett"],
    ["Emerson Cole", "Cole"],
    ["Dakota Shaw", "Shaw"],
    ["Phoenix Ward", "Ward"],
    ["Marley Grant", "Grant"],
  ];
  return names.map(([name, party], i) => ({
    id: `guest-sample-${i + 1}`,
    name,
    party,
  }));
}

export function newGuest(name: string, party?: string): Guest {
  return {
    id: crypto.randomUUID(),
    name: name.trim(),
    party: party?.trim() || undefined,
  };
}
