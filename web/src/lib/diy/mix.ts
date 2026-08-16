export const DIY_PIECES = [
  { id: "bouquet", label: "Bouquets", category: "flowers", hours: 3, cooler: true, lastBuy: 2 },
  { id: "bout", label: "Bouts / corsages", category: "flowers", hours: 2, cooler: true, lastBuy: 2 },
  { id: "ceremony", label: "Ceremony / arch", category: "flowers", hours: 6, cooler: false, lastBuy: 3 },
  { id: "guest-tables", label: "Guest tables", category: "flowers", hours: 4, cooler: true, lastBuy: 2 },
  { id: "sweetheart", label: "Sweetheart / head", category: "flowers", hours: 2, cooler: true, lastBuy: 2 },
  { id: "linens", label: "Linens & runners", category: "tables", hours: 2, cooler: false, lastBuy: 7 },
  { id: "candles", label: "Candles", category: "tables", hours: 1, cooler: false, lastBuy: 7 },
  { id: "lighting", label: "Lighting", category: "lighting", hours: 3, cooler: false, lastBuy: 14 },
  { id: "cake", label: "Cake", category: "cake", hours: 5, cooler: true, lastBuy: 1 },
  { id: "backdrop", label: "Backdrop", category: "backdrop", hours: 4, cooler: false, lastBuy: 7 },
] as const;

export type PieceId = (typeof DIY_PIECES)[number]["id"];
export type PieceChoice = "undecided" | "hire" | "make" | "skip";

export type PieceState = {
  choice: PieceChoice;
  hours?: number;
};

export function laborWarning(pieces: Record<string, PieceState>) {
  let hours = 0;
  let cooler = false;
  const making: string[] = [];
  for (const def of DIY_PIECES) {
    const row = pieces[def.id];
    if (!row || row.choice !== "make") continue;
    hours += row.hours ?? def.hours;
    if (def.cooler) cooler = true;
    making.push(def.label);
  }
  return {
    hours,
    cooler,
    making,
    over: hours > 10,
    message:
      hours === 0
        ? ""
        : hours > 10
          ? `${hours} hours of make — two people can’t finish this Friday. Hire the arch or drop a piece.`
          : `${hours} hours of make${cooler ? " · needs a cooler" : ""}.`,
  };
}
