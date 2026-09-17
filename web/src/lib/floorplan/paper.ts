export type PaperId = "letter" | "legal" | "tabloid" | "a4" | "a3" | "a5" | "custom";
export type PageOrient = "landscape" | "portrait";

export interface PaperSize {
  id: PaperId;
  name: string;
  widthIn: number;
  heightIn: number;
}

export const PAPER_SIZES: PaperSize[] = [
  { id: "letter", name: "Letter", widthIn: 8.5, heightIn: 11 },
  { id: "legal", name: "Legal", widthIn: 8.5, heightIn: 14 },
  { id: "tabloid", name: "Tabloid", widthIn: 11, heightIn: 17 },
  { id: "a4", name: "A4", widthIn: 8.27, heightIn: 11.69 },
  { id: "a3", name: "A3", widthIn: 11.69, heightIn: 16.54 },
  { id: "a5", name: "A5", widthIn: 5.83, heightIn: 8.27 },
  { id: "custom", name: "Custom", widthIn: 8.5, heightIn: 11 },
];

export function resolvePaper(id: PaperId, customW = 8.5, customH = 11): PaperSize {
  if (id === "custom") {
    return { id: "custom", name: "Custom", widthIn: Math.max(2, customW || 8.5), heightIn: Math.max(2, customH || 11) };
  }
  return PAPER_SIZES.find((p) => p.id === id) ?? PAPER_SIZES[0];
}

export function pageInches(paper: PaperSize, orient: PageOrient): { w: number; h: number } {
  return orient === "landscape" ? { w: paper.heightIn, h: paper.widthIn } : { w: paper.widthIn, h: paper.heightIn };
}

export function jsPdfFormat(paper: PaperSize, orient: PageOrient): { orientation: PageOrient; format: [number, number] } {
  return { orientation: orient, format: [paper.widthIn, paper.heightIn] };
}
