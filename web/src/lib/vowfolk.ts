export const APP_NAME = "Vowfolk";
export const APP_TAGLINE = "Plan it. Make it. Celebrate it.";
export const APP_LINE = "The wedding platform for couples who want to make the day their own.";

export const FLOWER_SOURCES = [
  { id: "wholesale", label: "Wholesale florist", hint: "Best price if you can meet a minimum." },
  { id: "moxie", label: "Flower Moxie", hint: "Recipes and bunches shipped." },
  { id: "tj", label: "Trader Joe's", hint: "Tuesday/Thursday restock. Go early." },
  { id: "costco", label: "Costco", hint: "Hydrangea and rose boxes." },
  { id: "market", label: "Local flower market", hint: "If your city has one, go the day before." },
] as const;

export const CONTINGENCY = 0.15;

export function scaleCount(perPiece: number, pieces: number, extra = CONTINGENCY) {
  return Math.ceil(perPiece * pieces * (1 + extra));
}

export function scaleMoney(perPiece: number, pieces: number, extra = CONTINGENCY) {
  return Math.round(perPiece * pieces * (1 + extra));
}
