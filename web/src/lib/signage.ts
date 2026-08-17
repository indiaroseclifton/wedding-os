export type SignKind =
  | "welcome"
  | "table"
  | "bar"
  | "direction"
  | "reserved"
  | "unplugged"
  | "cards"
  | "guestbook"
  | "memory"
  | "place"
  | "menu"
  | "program"
  | "favor"
  | "thanks"
  | "bag"
  | "napkin"
  | "topper"
  | "flute"
  | "chair"
  | "banner";

export type SignGroup = "signs" | "paper" | "table" | "favors";
export type SignPalette = "sage" | "blush" | "charcoal" | "cream";

export type SignSpec = {
  id: SignKind;
  group: SignGroup;
  label: string;
  line: string;
  widthIn: number;
  heightIn: number;
  heading: string;
  sub: string;
  extra: string;
  headingSize: number;
  bodySize: number;
  vine: boolean;
  copiesHint: string;
};

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
  copies: number;
  updatedAt: string;
};

export const GROUPS: { id: SignGroup; label: string; line: string }[] = [
  { id: "signs", label: "Signs", line: "The ones people walk up to" },
  { id: "paper", label: "Paper", line: "Menus, programs, the stack on the table" },
  { id: "table", label: "Table", line: "What sits on plates, glasses, chairs" },
  { id: "favors", label: "Favors", line: "Tags, bags, the thank-you they take home" },
];

export const SIGN_KINDS: SignSpec[] = [
  { id: "welcome", group: "signs", label: "Welcome", line: "Arch or foam at the door", widthIn: 11.5, heightIn: 16.5, heading: "Welcome", sub: "to our wedding", extra: "", headingSize: 42, bodySize: 18, vine: true, copiesHint: "1" },
  { id: "table", group: "signs", label: "Table number", line: "5×7 card or acrylic", widthIn: 5, heightIn: 7, heading: "Table", sub: "", extra: "", headingSize: 72, bodySize: 16, vine: false, copiesHint: "1 per table" },
  { id: "bar", group: "signs", label: "Bar menu", line: "Drinks on the bar", widthIn: 8, heightIn: 10, heading: "Bar", sub: "Please drink & be married", extra: "Champagne\nHouse red & white\nSignature spritz\nSoda & water", headingSize: 40, bodySize: 16, vine: true, copiesHint: "1–2" },
  { id: "direction", group: "signs", label: "Directional", line: "Ceremony this way", widthIn: 8, heightIn: 10, heading: "This way", sub: "to the ceremony", extra: "", headingSize: 36, bodySize: 18, vine: false, copiesHint: "2–4" },
  { id: "reserved", group: "signs", label: "Reserved", line: "Front row, family", widthIn: 7, heightIn: 5, heading: "Reserved", sub: "for family", extra: "", headingSize: 32, bodySize: 16, vine: false, copiesHint: "2–6" },
  { id: "unplugged", group: "signs", label: "Unplugged", line: "Phones down for the vows", widthIn: 8, heightIn: 10, heading: "Unplugged", sub: "Be here with us", extra: "", headingSize: 36, bodySize: 16, vine: true, copiesHint: "1" },
  { id: "cards", group: "signs", label: "Cards & gifts", line: "The table by the door", widthIn: 8, heightIn: 10, heading: "Cards & gifts", sub: "Your presence is enough", extra: "", headingSize: 30, bodySize: 16, vine: true, copiesHint: "1" },
  { id: "guestbook", group: "signs", label: "Guestbook", line: "Leave a note", widthIn: 7, heightIn: 5, heading: "Guestbook", sub: "Leave us a note", extra: "", headingSize: 28, bodySize: 16, vine: true, copiesHint: "1" },
  { id: "memory", group: "signs", label: "In loving memory", line: "A quiet table", widthIn: 8, heightIn: 10, heading: "In loving memory", sub: "With us in spirit", extra: "", headingSize: 26, bodySize: 16, vine: true, copiesHint: "1" },
  { id: "place", group: "paper", label: "Place card", line: "Name + table, 3.5×2", widthIn: 3.5, heightIn: 2, heading: "", sub: "", extra: "", headingSize: 18, bodySize: 11, vine: false, copiesHint: "1 per seat" },
  { id: "menu", group: "paper", label: "Menu", line: "Courses on the plate", widthIn: 4.25, heightIn: 9.5, heading: "Menu", sub: "", extra: "First\nGarden greens\n\nSecond\nRoast chicken\n\nThird\nOlive oil cake", headingSize: 28, bodySize: 13, vine: true, copiesHint: "1 per seat" },
  { id: "program", group: "paper", label: "Program", line: "Order of the hour", widthIn: 5, heightIn: 7, heading: "The day", sub: "", extra: "Welcome\nVows\nRings\nKiss\nRecessional", headingSize: 28, bodySize: 13, vine: true, copiesHint: "1 per guest" },
  { id: "favor", group: "favors", label: "Favor tag", line: "Hang tag with a hole", widthIn: 2, heightIn: 3.5, heading: "Thank you", sub: "for being here", extra: "", headingSize: 14, bodySize: 10, vine: false, copiesHint: "1 per favor" },
  { id: "thanks", group: "favors", label: "Thank-you tag", line: "On the box you mail later", widthIn: 2, heightIn: 3.5, heading: "Thank you", sub: "with love", extra: "", headingSize: 14, bodySize: 10, vine: false, copiesHint: "1 per card" },
  { id: "bag", group: "favors", label: "Welcome bag", line: "Hotel room drop", widthIn: 3, heightIn: 4, heading: "Welcome", sub: "we are glad you are here", extra: "", headingSize: 18, bodySize: 11, vine: true, copiesHint: "1 per room" },
  { id: "napkin", group: "table", label: "Napkin monogram", line: "Initials, iron-on or vinyl", widthIn: 3, heightIn: 3, heading: "", sub: "", extra: "", headingSize: 36, bodySize: 10, vine: false, copiesHint: "1 per napkin" },
  { id: "topper", group: "table", label: "Cake topper", line: "Names on a stick", widthIn: 6, heightIn: 4, heading: "", sub: "&", extra: "", headingSize: 28, bodySize: 22, vine: false, copiesHint: "1" },
  { id: "flute", group: "table", label: "Flute decal", line: "Vertical on the glass", widthIn: 1.25, heightIn: 4, heading: "", sub: "", extra: "", headingSize: 14, bodySize: 10, vine: false, copiesHint: "2" },
  { id: "chair", group: "table", label: "Chair back", line: "Mr / Mrs or your names", widthIn: 10, heightIn: 4, heading: "Mr", sub: "Mrs", extra: "", headingSize: 36, bodySize: 16, vine: false, copiesHint: "2" },
  { id: "banner", group: "table", label: "Banner flag", line: "One word per flag", widthIn: 5, heightIn: 7, heading: "Just", sub: "married", extra: "", headingSize: 32, bodySize: 20, vine: false, copiesHint: "as many words" },
];

export const PALETTES: Record<SignPalette, { ink: string; accent: string; ground: string; label: string }> = {
  sage: { ink: "#3d4a38", accent: "#7d8b74", ground: "#faf7f2", label: "Sage" },
  blush: { ink: "#6a4540", accent: "#c7a6a6", ground: "#fff8f6", label: "Blush" },
  charcoal: { ink: "#272727", accent: "#5c5c5c", ground: "#fffbf6", label: "Charcoal" },
  cream: { ink: "#272727", accent: "#dccfc3", ground: "#faf7f2", label: "Cream" },
};

export function specOf(kind: SignKind) {
  return SIGN_KINDS.find((k) => k.id === kind) || SIGN_KINDS[0];
}

function initials(names: string) {
  return names
    .split(/\s*(?:&|and)\s*/i)
    .map((p) => (p.trim()[0] || "").toUpperCase())
    .filter(Boolean)
    .join("&");
}

export function defaultSign(
  kind: SignKind,
  names = "Olivia & Mateo",
  date = "May 24, 2026"
): Omit<SignDesign, "id" | "token" | "updatedAt"> {
  const spec = specOf(kind);
  return {
    kind,
    heading: spec.heading,
    sub: spec.sub,
    names,
    date,
    tableNo: "12",
    extra: spec.extra,
    palette: "sage",
    vine: spec.vine,
    headingSize: spec.headingSize,
    bodySize: spec.bodySize,
    widthIn: spec.widthIn,
    heightIn: spec.heightIn,
    copies: 1,
  };
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
    <g id="cut-flourish" fill="none" stroke="${color}" stroke-width="${Math.max(1.1, w * 0.008)}" stroke-linecap="round">
      <path d="M${x1} ${h * 0.22} C ${x1 - 18} ${h * 0.36}, ${x1 + 16} ${h * 0.48}, ${x1} ${h * 0.62}" />
      <path d="M${x1} ${h * 0.34} C ${x1 + 22} ${h * 0.3}, ${x1 + 18} ${h * 0.42}, ${x1 + 4} ${h * 0.46}" />
      <path d="M${x2} ${h * 0.22} C ${x2 + 18} ${h * 0.36}, ${x2 - 16} ${h * 0.48}, ${x2} ${h * 0.62}" />
      <path d="M${x2} ${h * 0.34} C ${x2 - 22} ${h * 0.3}, ${x2 - 18} ${h * 0.42}, ${x2 - 4} ${h * 0.46}" />
    </g>`;
}

function hole(cx: number, y: number, r: number, color: string) {
  return `<circle id="cut-hole" cx="${cx}" cy="${y}" r="${r}" fill="none" stroke="${color}" stroke-width="1.2"/>`;
}

export function buildSignSvg(sign: SignDesign): string {
  const dpi = 72;
  const w = sign.widthIn * dpi;
  const h = sign.heightIn * dpi;
  const pal = PALETTES[sign.palette];
  const lines = sign.extra.split("\n").map((l) => l.trim());
  const cx = w / 2;
  const serif = "Georgia, 'Times New Roman', serif";
  const vine = sign.vine ? vinePaths(w, h, pal.accent) : "";
  const k = sign.kind;
  const mono = initials(sign.names);
  let body = "";
  let extraCut = "";

  if (k === "welcome" || k === "unplugged" || k === "cards" || k === "guestbook" || k === "memory" || k === "reserved") {
    const namesBlock =
      k === "welcome"
        ? `<text x="${cx}" y="${h * 0.62}" text-anchor="middle" font-family="${serif}" font-size="${sign.bodySize + 2}" fill="${pal.ink}">${esc(sign.names)}</text>
      <text x="${cx}" y="${h * 0.62 + sign.bodySize * 1.4}" text-anchor="middle" font-family="${serif}" font-size="${sign.bodySize}" fill="${pal.accent}">${esc(sign.date)}</text>`
        : "";
    body = `
      <text x="${cx}" y="${h * 0.4}" text-anchor="middle" font-family="${serif}" font-size="${sign.headingSize}" fill="${pal.ink}">${esc(sign.heading)}</text>
      <text x="${cx}" y="${h * 0.4 + sign.headingSize * 0.75}" text-anchor="middle" font-family="${serif}" font-style="italic" font-size="${sign.bodySize + 2}" fill="${pal.accent}">${esc(sign.sub)}</text>
      ${namesBlock}`;
  } else if (k === "table") {
    body = `
      <text x="${cx}" y="${h * 0.28}" text-anchor="middle" font-family="${serif}" font-size="${sign.bodySize + 2}" fill="${pal.accent}">${esc(sign.heading || "Table")}</text>
      <text x="${cx}" y="${h * 0.62}" text-anchor="middle" font-family="${serif}" font-size="${sign.headingSize}" fill="${pal.ink}">${esc(sign.tableNo)}</text>`;
  } else if (k === "bar" || k === "menu" || k === "program") {
    const start = h * 0.38;
    const items = lines
      .map(
        (line, i) =>
          `<text x="${cx}" y="${start + i * (sign.bodySize + (line ? 8 : 6))}" text-anchor="middle" font-family="${serif}" font-size="${sign.bodySize}" fill="${pal.ink}">${esc(line)}</text>`
      )
      .join("");
    body = `
      <text x="${cx}" y="${h * 0.18}" text-anchor="middle" font-family="${serif}" font-size="${sign.headingSize}" fill="${pal.ink}">${esc(sign.heading)}</text>
      <text x="${cx}" y="${h * 0.18 + sign.headingSize * 0.7}" text-anchor="middle" font-family="${serif}" font-style="italic" font-size="${sign.bodySize}" fill="${pal.accent}">${esc(sign.sub || sign.date)}</text>
      ${items}`;
  } else if (k === "direction") {
    body = `
      <text x="${cx}" y="${h * 0.42}" text-anchor="middle" font-family="${serif}" font-size="${sign.headingSize}" fill="${pal.ink}">${esc(sign.heading)}</text>
      <text x="${cx}" y="${h * 0.42 + sign.headingSize * 0.75}" text-anchor="middle" font-family="${serif}" font-style="italic" font-size="${sign.bodySize + 2}" fill="${pal.accent}">${esc(sign.sub)}</text>
      <path d="M${cx - 28} ${h * 0.68} L${cx + 18} ${h * 0.68} M${cx + 6} ${h * 0.68 - 12} L${cx + 28} ${h * 0.68} L${cx + 6} ${h * 0.68 + 12}" fill="none" stroke="${pal.ink}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`;
  } else if (k === "place") {
    body = `
      <text x="${cx}" y="${h * 0.48}" text-anchor="middle" font-family="${serif}" font-size="${sign.headingSize}" fill="${pal.ink}">${esc(sign.heading || sign.names.split("&")[0]?.trim() || "Guest")}</text>
      <text x="${cx}" y="${h * 0.78}" text-anchor="middle" font-family="${serif}" font-size="${sign.bodySize}" fill="${pal.accent}">Table ${esc(sign.tableNo)}</text>`;
  } else if (k === "favor" || k === "thanks" || k === "bag") {
    extraCut = hole(cx, 14, 5, pal.accent);
    body = `
      <text x="${cx}" y="${h * 0.48}" text-anchor="middle" font-family="${serif}" font-size="${sign.headingSize}" fill="${pal.ink}">${esc(sign.heading)}</text>
      <text x="${cx}" y="${h * 0.48 + 18}" text-anchor="middle" font-family="${serif}" font-style="italic" font-size="${sign.bodySize}" fill="${pal.accent}">${esc(sign.sub)}</text>
      <text x="${cx}" y="${h * 0.82}" text-anchor="middle" font-family="${serif}" font-size="${sign.bodySize}" fill="${pal.ink}">${esc(sign.names)}</text>`;
  } else if (k === "napkin") {
    body = `<text x="${cx}" y="${h * 0.62}" text-anchor="middle" font-family="${serif}" font-size="${sign.headingSize}" fill="${pal.ink}">${esc(sign.heading || mono)}</text>`;
  } else if (k === "topper") {
    const parts = sign.names.split(/\s*(?:&|and)\s*/i);
    body = `
      <text x="${cx}" y="${h * 0.38}" text-anchor="middle" font-family="${serif}" font-size="${sign.headingSize}" fill="${pal.ink}">${esc(parts[0] || sign.heading)}</text>
      <text x="${cx}" y="${h * 0.58}" text-anchor="middle" font-family="${serif}" font-style="italic" font-size="${sign.bodySize}" fill="${pal.accent}">${esc(sign.sub || "&")}</text>
      <text x="${cx}" y="${h * 0.82}" text-anchor="middle" font-family="${serif}" font-size="${sign.headingSize}" fill="${pal.ink}">${esc(parts[1] || "")}</text>`;
  } else if (k === "flute") {
    body = `
      <text x="${cx}" y="${h * 0.35}" text-anchor="middle" font-family="${serif}" font-size="${sign.headingSize}" fill="${pal.ink}">${esc(sign.heading || mono)}</text>
      <text x="${cx}" y="${h * 0.72}" text-anchor="middle" font-family="${serif}" font-size="${sign.bodySize}" fill="${pal.accent}">${esc(sign.date)}</text>`;
  } else if (k === "chair") {
    body = `
      <text x="${w * 0.28}" y="${h * 0.62}" text-anchor="middle" font-family="${serif}" font-size="${sign.headingSize}" fill="${pal.ink}">${esc(sign.heading || "Mr")}</text>
      <text x="${w * 0.72}" y="${h * 0.62}" text-anchor="middle" font-family="${serif}" font-size="${sign.headingSize}" fill="${pal.ink}">${esc(sign.sub || "Mrs")}</text>`;
  } else if (k === "banner") {
    extraCut = `<polygon points="${cx},8 ${w - 8},${h - 8} 8,${h - 8}" fill="none" stroke="${pal.accent}" stroke-width="1"/>`;
    body = `
      <text x="${cx}" y="${h * 0.42}" text-anchor="middle" font-family="${serif}" font-size="${sign.headingSize}" fill="${pal.ink}">${esc(sign.heading)}</text>
      <text x="${cx}" y="${h * 0.62}" text-anchor="middle" font-family="${serif}" font-style="italic" font-size="${sign.bodySize}" fill="${pal.accent}">${esc(sign.sub)}</text>`;
  }

  const rx = k === "welcome" ? w * 0.28 : k === "favor" || k === "thanks" || k === "bag" ? 10 : 8;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${sign.widthIn}in" height="${sign.heightIn}in" viewBox="0 0 ${w} ${h}">
  <title>${esc(fileName(sign))}</title>
  <rect id="guide-board" x="1" y="1" width="${w - 2}" height="${h - 2}" rx="${rx}" fill="${pal.ground}" stroke="${pal.accent}" stroke-width="1"/>
  ${extraCut}
  <g id="cut-text">${body}</g>
  ${vine}
</svg>`;
}

export function fileName(sign: SignDesign) {
  return `Vowfolk-${specOf(sign.kind).label.replace(/\s+/g, "-")}.svg`;
}

export function cricutPrep(sign: SignDesign) {
  const spec = specOf(sign.kind);
  const tall = sign.heightIn > 11.5;
  const paper = spec.group === "paper" || spec.group === "favors";
  const iron = sign.kind === "napkin" || sign.kind === "chair";
  return {
    file: "SVG",
    cut: `${sign.widthIn}" × ${sign.heightIn}"`,
    mat: tall ? '12" × 24"' : '12" × 12"',
    machine: tall
      ? "Explore or Maker (not Joy)"
      : sign.widthIn <= 4.5
        ? "Joy, Joy Xtra, Explore, or Maker"
        : "Explore, Maker, or Joy Xtra",
    material: iron
      ? "Iron-on (Everyday) + EasyPress"
      : paper
        ? "Cardstock, 65–110 lb · or Print Then Cut"
        : "Permanent vinyl + transfer tape",
    pressure: "Default",
    blade: "Fine-point",
    layers:
      sign.vine
        ? "Text + flourish"
        : sign.kind === "favor" || sign.kind === "thanks" || sign.kind === "bag"
          ? "Tag + hole"
          : "Text",
    copiesHint: spec.copiesHint,
    steps: [
      "Download the SVG.",
      "Design Space → Upload → Upload Image → this file.",
      "Weld or attach the words so they cut as one piece.",
      "Hide the guide-board layer if you only want the letters.",
      iron
        ? "Mirror on. Make It. Weed. Press."
        : paper
          ? "Make It. Cardstock on a LightGrip mat, or Print Then Cut."
          : "Make It. Weed, transfer, press onto the board.",
    ],
  };
}

export function materialsFor(sign: SignDesign) {
  const spec = specOf(sign.kind);
  const n = sign.copies > 1 ? `${sign.copies} ` : "";
  if (sign.kind === "welcome") {
    return [
      { item: "Acrylic or foam board", qty: `1 · ${sign.widthIn}×${sign.heightIn}"` },
      { item: "Permanent vinyl", qty: "1 sheet" },
      { item: "Transfer tape", qty: "1 roll" },
      { item: "Easel", qty: "1" },
    ];
  }
  if (sign.kind === "napkin" || sign.kind === "chair") {
    return [
      { item: "Iron-on vinyl", qty: `${n}sheet(s)` },
      { item: "Teflon sheet / EasyPress", qty: "1" },
    ];
  }
  if (sign.kind === "topper") {
    return [
      { item: "Heavy cardstock or thin wood", qty: "1" },
      { item: "Food-safe stick", qty: "1–2" },
    ];
  }
  if (sign.kind === "flute") {
    return [
      { item: "Permanent vinyl (clear glasses)", qty: "scrap" },
      { item: "Transfer tape", qty: "scrap" },
    ];
  }
  if (spec.group === "favors" || sign.kind === "place") {
    return [
      { item: "Cardstock", qty: `${n}tags / cards` },
      { item: "Twine or ribbon", qty: sign.kind === "place" ? "—" : "1 spool" },
    ];
  }
  return [
    { item: spec.group === "paper" ? "Cardstock" : "Board or cardstock", qty: `${n}piece(s)` },
    { item: "Vinyl or Print Then Cut", qty: "as needed" },
  ];
}
