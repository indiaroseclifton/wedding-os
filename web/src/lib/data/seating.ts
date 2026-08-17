export type SeatGuest = {
  id: string;
  name: string;
  tableLabel?: string | null;
  seatIndex?: number | null;
  dietary?: string | null;
  meal?: string | null;
  rsvp: string;
  side?: string | null;
  partyName?: string | null;
  plusOnes?: number;
  plusOneNames?: string[];
};

export type SeatConstraintKind = "never" | "must" | "lock";

export type SeatConstraint = {
  id: string;
  kind: SeatConstraintKind;
  a: string;
  b?: string;
  tableName?: string;
  note?: string;
};

export type SeatFreeze = {
  id: string;
  label: string;
  at: string;
  assignments: { guestId: string; name: string; table: string | null; seatIndex: number | null }[];
};

export function seatWeight(g: SeatGuest) {
  return 1 + Math.max(0, g.plusOnes || 0);
}

export function householdKey(g: SeatGuest) {
  if (g.partyName?.trim()) return g.partyName.trim();
  return g.name.trim() || g.id;
}

export function inSeatingPool(g: SeatGuest, mode: "holding" | "plates") {
  if (g.rsvp === "NO") return false;
  if (mode === "plates") return g.rsvp === "YES";
  return true;
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

export function guestName(guests: SeatGuest[], id: string) {
  return guests.find((g) => g.id === id)?.name || "Someone";
}

export function constraintViolations(guests: SeatGuest[], constraints: SeatConstraint[]) {
  const byId = new Map(guests.map((g) => [g.id, g]));
  const out: { id: string; message: string }[] = [];
  for (const c of constraints) {
    const ga = byId.get(c.a);
    const gb = c.b ? byId.get(c.b) : undefined;
    if (c.kind === "never" && ga && gb && ga.tableLabel && ga.tableLabel === gb.tableLabel) {
      out.push({ id: c.id, message: `${ga.name} and ${gb.name} are both at ${ga.tableLabel}` });
    }
    if (c.kind === "must" && ga && gb) {
      if (!ga.tableLabel || !gb.tableLabel) {
        out.push({ id: c.id, message: `${ga.name} and ${gb.name} should sit together` });
      } else if (ga.tableLabel !== gb.tableLabel) {
        out.push({ id: c.id, message: `${ga.name} is at ${ga.tableLabel}, ${gb.name} at ${gb.tableLabel}` });
      }
    }
    if (c.kind === "lock" && ga && c.tableName && ga.tableLabel !== c.tableName) {
      out.push({ id: c.id, message: `${ga.name} is locked to ${c.tableName}` });
    }
  }
  return out;
}

function mergeMustGroups(groups: SeatGuest[][], constraints: SeatConstraint[]) {
  const must = constraints.filter((c) => c.kind === "must" && c.b);
  let changed = true;
  while (changed) {
    changed = false;
    for (const c of must) {
      const ia = groups.findIndex((g) => g.some((m) => m.id === c.a));
      const ib = groups.findIndex((g) => g.some((m) => m.id === c.b));
      if (ia < 0 || ib < 0 || ia === ib) continue;
      groups[ia] = [...groups[ia], ...groups[ib]];
      groups.splice(ib, 1);
      changed = true;
      break;
    }
  }
  return groups;
}

export function autoSeat<T extends SeatGuest>(
  tables: { name: string; capacity: number }[],
  guests: T[],
  constraints: SeatConstraint[] = []
): { id: string; table: string; seatIndex: number }[] {
  const remaining = new Map(tables.map((t) => [t.name, t.capacity - tableFill(t.name, guests)]));
  const seated = new Map<string, string>();
  for (const g of guests) {
    if (g.tableLabel) seated.set(g.id, g.tableLabel);
  }
  const plan: { id: string; table: string; seatIndex: number }[] = [];
  const nextSeat = new Map<string, number>();
  for (const t of tables) {
    const used = guests
      .filter((g) => g.tableLabel === t.name && g.seatIndex != null)
      .reduce((m, g) => Math.max(m, (g.seatIndex || 0) + seatWeight(g)), 0);
    nextSeat.set(t.name, used);
  }

  function place(member: SeatGuest, table: string) {
    const idx = nextSeat.get(table) || 0;
    plan.push({ id: member.id, table, seatIndex: idx });
    nextSeat.set(table, idx + seatWeight(member));
    seated.set(member.id, table);
    remaining.set(table, (remaining.get(table) || 0) - seatWeight(member));
  }

  for (const c of constraints.filter((x) => x.kind === "lock" && x.tableName)) {
    const g = guests.find((row) => row.id === c.a);
    if (!g || g.tableLabel || g.rsvp === "NO") continue;
    if ((remaining.get(c.tableName!) || 0) >= seatWeight(g)) place(g, c.tableName!);
  }

  const open = guests.filter((g) => !seated.has(g.id) && !g.tableLabel && g.rsvp !== "NO");
  let groups = groupHouseholds(open).map((h) => h.members);
  groups = mergeMustGroups(groups, constraints);
  groups.sort((a, b) => {
    const wa = a.reduce((s, m) => s + seatWeight(m), 0);
    const wb = b.reduce((s, m) => s + seatWeight(m), 0);
    return wb - wa;
  });

  const neverPairs = constraints.filter((c) => c.kind === "never" && c.b);

  function blocked(table: string, members: SeatGuest[]) {
    const ids = new Set(members.map((m) => m.id));
    for (const c of neverPairs) {
      const other = ids.has(c.a) ? c.b : ids.has(c.b!) ? c.a : null;
      if (!other) continue;
      if (seated.get(other) === table) return true;
    }
    return false;
  }

  function sideScore(table: string, members: SeatGuest[]) {
    const sides = members.map((m) => (m.side || "").toLowerCase()).filter(Boolean);
    if (!sides.length) return 0;
    const at = guests.filter((g) => (seated.get(g.id) || g.tableLabel) === table);
    const same = at.filter((g) => g.side && sides.includes(g.side.toLowerCase())).length;
    return same;
  }

  for (const members of groups) {
    const weight = members.reduce((s, m) => s + seatWeight(m), 0);
    const options = [...remaining.entries()]
      .filter(([name, left]) => left >= weight && !blocked(name, members))
      .sort((a, b) => sideScore(b[0], members) - sideScore(a[0], members) || a[1] - b[1]);
    const target = options[0]?.[0];
    if (!target) continue;
    for (const m of members) place(m, target);
  }

  return plan;
}

export function freezeDiff(
  guests: SeatGuest[],
  freeze: SeatFreeze | null
): { moved: number; newly: number; unseated: number; lines: string[] } {
  if (!freeze) {
    const seated = guests.filter((g) => g.tableLabel);
    return { moved: 0, newly: seated.length, unseated: guests.filter((g) => !g.tableLabel && g.rsvp !== "NO").length, lines: [] };
  }
  const prev = new Map(freeze.assignments.map((a) => [a.guestId, a]));
  let moved = 0;
  let newly = 0;
  let unseated = 0;
  const lines: string[] = [];
  for (const g of guests) {
    if (g.rsvp === "NO") continue;
    const was = prev.get(g.id);
    const now = g.tableLabel || null;
    if (!was) {
      if (now) {
        newly += 1;
        lines.push(`${g.name} → ${now}`);
      }
      continue;
    }
    if (was.table && !now) {
      unseated += 1;
      lines.push(`${g.name} left ${was.table}`);
    } else if (was.table !== now) {
      moved += 1;
      lines.push(`${g.name}: ${was.table || "open"} → ${now || "open"}`);
    }
  }
  return { moved, newly, unseated, lines: lines.slice(0, 8) };
}
