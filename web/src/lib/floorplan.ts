export type TablePosition = {
  tableId: string;
  x: number;
  y: number;
};

export type FloorKind =
  | "TABLE"
  | "DANCE_FLOOR"
  | "BUFFET"
  | "BAR"
  | "CAKE"
  | "DJ"
  | "KIDS"
  | "PHOTO"
  | "ESCORT";

export type FloorObject = {
  id: string;
  kind: FloorKind;
  label: string;
  x: number;
  y: number;
  w?: number;
  h?: number;
  tableId?: string;
};

export function newFixture(kind: Exclude<FloorKind, "TABLE">): FloorObject {
  const labels: Record<Exclude<FloorKind, "TABLE">, string> = {
    DANCE_FLOOR: "Dance floor",
    BUFFET: "Buffet",
    BAR: "Bar",
    CAKE: "Cake",
    DJ: "DJ",
    KIDS: "Kids",
    PHOTO: "Photo",
    ESCORT: "Escort cards",
  };
  const size: Partial<Record<FloorKind, { w: number; h: number }>> = {
    DANCE_FLOOR: { w: 22, h: 16 },
    BUFFET: { w: 18, h: 8 },
    BAR: { w: 10, h: 8 },
    CAKE: { w: 8, h: 8 },
    DJ: { w: 10, h: 8 },
    KIDS: { w: 12, h: 12 },
    PHOTO: { w: 8, h: 8 },
    ESCORT: { w: 10, h: 6 },
  };
  return {
    id: crypto.randomUUID(),
    kind,
    label: labels[kind],
    x: 50,
    y: 18,
    ...size[kind],
  };
}
