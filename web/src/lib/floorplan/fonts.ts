export const LABEL_FONTS = [
  { id: "playfair", name: "Playfair", family: '"Playfair Display", Georgia, serif' },
  { id: "lora", name: "Lora", family: "Lora, Georgia, serif" },
  { id: "serif", name: "Baskerville", family: '"Libre Baskerville", Georgia, serif' },
  { id: "display", name: "Fraunces", family: "Fraunces, Georgia, serif" },
  { id: "sans", name: "Figtree", family: "Figtree, sans-serif" },
  { id: "script", name: "Great Vibes", family: '"Great Vibes", cursive' },
  { id: "cormorant", name: "Cormorant", family: '"Cormorant Garamond", Georgia, serif' },
  { id: "cinzel", name: "Cinzel", family: "Cinzel, Georgia, serif" },
  { id: "parisienne", name: "Parisienne", family: "Parisienne, cursive" },
  { id: "montserrat", name: "Montserrat", family: "Montserrat, sans-serif" },
  { id: "josefin", name: "Josefin", family: '"Josefin Sans", sans-serif' },
  { id: "marcellus", name: "Marcellus", family: "Marcellus, Georgia, serif" },
] as const;

export type LabelFont = (typeof LABEL_FONTS)[number]["id"];

export type TextStyle = {
  font: LabelFont;
  fontSizeIn: number;
  color: string;
  bgColor: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strike: boolean;
};

export const DEFAULT_TEXT_STYLE: TextStyle = {
  font: "playfair",
  fontSizeIn: 14,
  color: "#272727",
  bgColor: "",
  bold: false,
  italic: false,
  underline: false,
  strike: false,
};

export function fontFamily(id: LabelFont | undefined): string {
  return LABEL_FONTS.find((f) => f.id === id)?.family ?? LABEL_FONTS[0].family;
}

export function fontName(id: LabelFont | undefined): string {
  return LABEL_FONTS.find((f) => f.id === id)?.name ?? LABEL_FONTS[0].name;
}

export function konvaFontStyle(bold?: boolean, italic?: boolean): string {
  if (bold && italic) return "italic bold";
  if (bold) return "bold";
  if (italic) return "italic";
  return "normal";
}

export function konvaDecoration(underline?: boolean, strike?: boolean): string {
  const parts: string[] = [];
  if (underline) parts.push("underline");
  if (strike) parts.push("line-through");
  return parts.join(" ");
}
