export type SignKind = "welcome" | "table" | "bar" | "direction" | "reserved";
export type SignPalette = "sage" | "blush" | "charcoal" | "cream";

export type SignDesign = {
  id: string;
  token: string;
  kind: SignKind;
  heading: string;
  sub: string;
  names: string;
  date: string;
  tableNo: string;
  extra: string;
  palette: SignPalette;
  vine: boolean;
  headingSize: number;
  bodySize: number;
  widthIn: number;
  heightIn: number;
  updatedAt: string;
};

export const SIGN_KINDS: { id: SignKind; label: string; line: string; widthIn: number; heightIn: number }[] = [
  { id: "welcome", label: "Welcome", line: "Arch or foam board at the door", widthIn: 11.5, heightIn: 16.5 },
  { id: "table", label: "Table number", line: "5×7 cards or acrylic", widthIn: 5, heightIn: 7 },
  { id: "bar", label: "Bar menu", line: "Drinks on the bar", widthIn: 8, heightIn: 10 },
  { id: "direction", label: "Directional", line: "Ceremony this way", widthIn: 8, heightIn: 10 },
  { id: "reserved", label: "Reserved", line: "Front row, family", widthIn: 7, heightIn: 5 },
];

export const PALETTES: Record<SignPalette, { ink: string; accent: string; ground: string; label: string }> = {
  sage: { ink: "#3d4a38", accent: "#7d8b74", ground: "#faf7f2", label: "Sage" },
  blush: { ink: "#6a4540", accent: "#c7a6a6", ground: "#fff8f6", label: "Blush" },
  charcoal: { ink: "#272727", accent: "#5c5c5c", ground: "#fffbf6", label: "Charcoal" },
  cream: { ink: "#272727", accent: "#dccfc3", ground: "#faf7f2", label: "Cream" },
};

export function defaultSign(kind: SignKind, names = "Olivia & Mateo", date = "May 24, 2026"): Omit<SignDesign, "id" | "token" | "updatedAt"> {
  const spec = SIGN_KINDS.find((k) => k.id === kind)!;
  const base = {
    kind,
    names,
    date,
    tableNo: "12",
    extra: "",
    palette: "sage" as SignPalette,
    vine: true,
    headingSize: kind === "table" ? 72 : 42,
    bodySize: 18,
    widthIn: spec.widthIn,
    heightIn: spec.heightIn,
  };
  if (kind === "welcome") {
    return { ...base, heading: "Welcome", sub: "to our wedding", extra: "" };
  }
  if (kind === "table") {
    return { ...base, heading: "Table", sub: "", extra: "" };
  }
  if (kind === "bar") {
    return {
      ...base,
      heading: "Bar",
      sub: "Please drink & be married",
      extra: "Champagne\nHouse red & white\nSignature spritz\nSoda & water",
    };
  }
  if (kind === "direction") {
    return { ...base, heading: "This way", sub: "to the ceremony", extra: "" };
  }
  return { ...base, heading: "Reserved", sub: "for family", extra: "" };
}

function esc(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function vinePaths(w: number, h: number, color: string) {
  const x1 = w * 0.12;
  const x2 = w * 0.88;
  return `
    <g id="cut-flourish" fill="none" stroke="${color}" stroke-width="${Math.max(1.2, w * 0.006)}" stroke-linecap="round">
      <path d="M${x1} ${h * 0.22} C ${x1 - 18} ${h * 0.36}, ${x1 + 16} ${h * 0.48}, ${x1} ${h * 0.62}" />
      <path d="M${x1} ${h * 0.34} C ${x1 + 22} ${h * 0.3}, ${x1 + 18} ${h * 0.42}, ${x1 + 4} ${h * 0.46}" />
      <path d="M${x2} ${h * 0.22} C ${x2 + 18} ${h * 0.36}, ${x2 - 16} ${h * 0.48}, ${x2} ${h * 0.62}" />
      <path d="M${x2} ${h * 0.34} C ${x2 - 22} ${h * 0.3}, ${x2 - 18} ${h * 0.42}, ${x2 - 4} ${h * 0.46}" />
    </g>`;
}

export function buildSignSvg(sign: SignDesign): string {
  const dpi = 72;
  const w = sign.widthIn * dpi;
  const h = sign.heightIn * dpi;
  const pal = PALETTES[sign.palette];
  const lines = sign.extra.split("\n").map((l) => l.trim()).filter(Boolean);
  const cx = w / 2;
  const serif = "Georgia, 'Times New Roman', serif";
  const vine = sign.vine ? vinePaths(w, h, pal.accent) : "";

  let body = "";
  if (sign.kind === "welcome") {
    body = `
      <text x="${cx}" y="${h * 0.36}" text-anchor="middle" font-family="${serif}" font-size="${sign.headingSize}" fill="${pal.ink}">${esc(sign.heading)}</text>
      <text x="${cx}" y="${h * 0.36 + sign.headingSize * 0.7}" text-anchor="middle" font-family="${serif}" font-style="italic" font-size="${sign.bodySize + 6}" fill="${pal.accent}">${esc(sign.sub)}</text>
      <text x="${cx}" y="${h * 0.58}" text-anchor="middle" font-family="${serif}" font-size="${sign.bodySize + 4}" fill="${pal.ink}">${esc(sign.names)}</text>
      <text x="${cx}" y="${h * 0.58 + sign.bodySize * 1.5}" text-anchor="middle" font-family="${serif}" font-size="${sign.bodySize}" fill="${pal.accent}">${esc(sign.date)}</text>`;
  } else if (sign.kind === "table") {
    body = `
      <text x="${cx}" y="${h * 0.28}" text-anchor="middle" font-family="${serif}" font-size="${sign.bodySize + 4}" fill="${pal.accent}">${esc(sign.heading || "Table")}</text>
      <text x="${cx}" y="${h * 0.62}" text-anchor="middle" font-family="${serif}" font-size="${sign.headingSize}" fill="${pal.ink}">${esc(sign.tableNo)}</text>`;
  } else if (sign.kind === "bar") {
    const start = h * 0.42;
    const items = lines
      .map((line, i) => `<text x="${cx}" y="${start + i * (sign.bodySize + 10)}" text-anchor="middle" font-family="${serif}" font-size="${sign.bodySize}" fill="${pal.ink}">${esc(line)}</text>`)
      .join("");
    body = `
      <text x="${cx}" y="${h * 0.22}" text-anchor="middle" font-family="${serif}" font-size="${sign.headingSize}" fill="${pal.ink}">${esc(sign.heading)}</text>
      <text x="${cx}" y="${h * 0.22 + sign.headingSize * 0.65}" text-anchor="middle" font-family="${serif}" font-style="italic" font-size="${sign.bodySize}" fill="${pal.accent}">${esc(sign.sub)}</text>
      ${items}`;
  } else if (sign.kind === "direction") {
    body = `
      <text x="${cx}" y="${h * 0.42}" text-anchor="middle" font-family="${serif}" font-size="${sign.headingSize}" fill="${pal.ink}">${esc(sign.heading)}</text>
      <text x="${cx}" y="${h * 0.42 + sign.headingSize * 0.75}" text-anchor="middle" font-family="${serif}" font-style="italic" font-size="${sign.bodySize + 4}" fill="${pal.accent}">${esc(sign.sub)}</text>
      <path d="M${cx - 28} ${h * 0.68} L${cx + 18} ${h * 0.68} M${cx + 6} ${h * 0.68 - 12} L${cx + 28} ${h * 0.68} L${cx + 6} ${h * 0.68 + 12}" fill="none" stroke="${pal.ink}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`;
  } else {
    body = `
      <text x="${cx}" y="${h * 0.48}" text-anchor="middle" font-family="${serif}" font-size="${sign.headingSize}" fill="${pal.ink}">${esc(sign.heading)}</text>
      <text x="${cx}" y="${h * 0.48 + sign.headingSize * 0.7}" text-anchor="middle" font-family="${serif}" font-style="italic" font-size="${sign.bodySize + 2}" fill="${pal.accent}">${esc(sign.sub)}</text>`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${sign.widthIn}in" height="${sign.heightIn}in" viewBox="0 0 ${w} ${h}">
  <title>${esc(fileName(sign))}</title>
  <rect id="guide-board" x="1" y="1" width="${w - 2}" height="${h - 2}" rx="${sign.kind === "welcome" ? w * 0.28 : 8}" fill="${pal.ground}" stroke="${pal.accent}" stroke-width="1"/>
  <g id="cut-text">${body}</g>
  ${vine}
</svg>`;
}

export function fileName(sign: SignDesign) {
  const kind = SIGN_KINDS.find((k) => k.id === sign.kind)?.label || sign.kind;
  return `Vowfolk-${kind.replace(/\s+/g, "-")}.svg`;
}

export function cricutPrep(sign: SignDesign) {
  const tall = sign.heightIn > 11.5;
  return {
    file: "SVG",
    cut: `${sign.widthIn}" × ${sign.heightIn}"`,
    mat: tall ? '12" × 24"' : '12" × 12"',
    machine: tall ? "Explore or Maker (not Joy)" : "Explore, Maker, or Joy Xtra",
    material: sign.kind === "table" ? "Cardstock, 80–110 lb" : "Permanent vinyl + transfer tape",
    pressure: "Default",
    blade: "Fine-point",
    layers: sign.vine ? "Text + flourish (2 colors if you want)" : "Text (1 color)",
    steps: [
      "Download the SVG from this page.",
      "Open Design Space → Upload → Upload Image → browse to the SVG.",
      "Attach or weld the words so they cut as one piece.",
      "Hide the guide-board layer if you only want the vinyl, not the outline.",
      "Make It. Choose the mat size above. Weed, transfer, press onto the board.",
    ],
  };
}

export function materialsFor(sign: SignDesign) {
  if (sign.kind === "welcome") {
    return [
      { item: "Acrylic or foam board", qty: `1 · ${sign.widthIn}×${sign.heightIn}"` },
      { item: "Permanent vinyl", qty: "1 sheet" },
      { item: "Transfer tape", qty: "1 roll" },
      { item: "Easel", qty: "1" },
    ];
  }
  if (sign.kind === "table") {
    return [
      { item: "Cardstock or acrylic", qty: "1 per table" },
      { item: "Vinyl or Print Then Cut", qty: "1 sheet / 8 cards" },
    ];
  }
  return [
    { item: "Board or cardstock", qty: "1" },
    { item: "Permanent vinyl", qty: "1 sheet" },
    { item: "Transfer tape", qty: "1 short strip" },
  ];
}
