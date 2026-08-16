export const TABLE_SHAPES = [
  { id: "round", name: "Round 60\"" },
  { id: "farm", name: "Farm table" },
] as const;

export const TABLE_KITS = [
  { id: "linen", name: "Linen + taper", runner: true, candles: 4, buds: 3, bowl: false, plates: true },
  { id: "garden", name: "Garden low bowl", runner: false, candles: 3, buds: 0, bowl: true, plates: true },
  { id: "bare", name: "Wood + olive", runner: false, candles: 2, buds: 5, bowl: false, plates: true },
] as const;

export type TableLook = {
  shape: "round" | "farm";
  seats: number;
  tables: number;
  runner: boolean;
  candles: number;
  buds: number;
  bowl: boolean;
  plates: boolean;
};

export function tableShop(look: TableLook) {
  const per = [
    look.plates ? { label: "Place settings", qty: look.seats, estEach: 2.5 } : null,
    look.runner ? { label: "Runner or linen", qty: 1, estEach: 18 } : null,
    look.candles ? { label: "Tapers / votives", qty: look.candles, estEach: 1.2 } : null,
    look.buds ? { label: "Bud vases + stems", qty: look.buds, estEach: 6 } : null,
    look.bowl ? { label: "Low bowl centerpiece", qty: 1, estEach: 28 } : null,
  ].filter(Boolean) as { label: string; qty: number; estEach: number }[];
  const one = per.reduce((s, r) => s + r.qty * r.estEach, 0);
  return { per, one, all: one * Math.max(1, look.tables) };
}
