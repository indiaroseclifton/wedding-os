export function parsePlusOneNames(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.map((s) => String(s).trim()).filter(Boolean).slice(0, 8);
  }
  if (typeof raw === "string") {
    return raw
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 8);
  }
  return [];
}

export function withPlusOnes(plusOnes: number, names: string[]) {
  const plusOneNames = names.map((s) => s.trim()).filter(Boolean).slice(0, 8);
  return {
    plusOneNames,
    plusOnes: Math.max(0, Math.max(plusOnes, plusOneNames.length)),
  };
}

export function plusOneSeatLabels(g: { plusOnes?: number; plusOneNames?: string[] }) {
  const n = Math.max(g.plusOnes || 0, (g.plusOneNames || []).length);
  return Array.from({ length: n }, (_, i) => g.plusOneNames?.[i]?.trim() || `+${i + 1}`);
}

export function plusLine(g: { plusOnes?: number; plusOneNames?: string[] }) {
  const names = (g.plusOneNames || []).filter(Boolean);
  if (names.length) return names.join(", ");
  if (g.plusOnes) return `+${g.plusOnes}`;
  return "";
}

export function namedPlusOnes(
  allowed: string[],
  incoming: string[],
  policy?: string
) {
  if (policy === "none") return { plusOnes: 0, plusOneNames: [] as string[] };
  const extras = withPlusOnes(incoming.length, incoming);
  if (policy !== "named") return extras;
  const allow = new Set(allowed.map((n) => n.trim().toLowerCase()).filter(Boolean));
  const kept = extras.plusOneNames.filter((n) => allow.has(n.trim().toLowerCase()));
  return { plusOnes: kept.length, plusOneNames: kept };
}

export function guestLookupHay(g: { name: string; plusOneNames?: string[]; partyName?: string }) {
  return [g.name, g.partyName, ...(g.plusOneNames || [])].filter(Boolean).join(" ");
}
