import type { StudioDesign, DesignRevision } from "./studio/design";
export type StudioKind =
  "floral" | "table" | "print" | "cricut" | "decor" | "lighting" | "favors";
export type StudioIntent = "recreate" | "inspire" | "similar" | "style";
export type StudioStage =
  "spark" | "design" | "spec" | "source" | "build" | "pack" | "setup" | "after";
export type MaterialFate = "buy" | "rent" | "own" | "borrow";
export type AfterFate =
  "unset" | "keep" | "return" | "sell" | "donate" | "reuse";

export type StudioMaterial = {
  id: string;
  label: string;
  qty: number;
  unit: string;
  estEach: number;
  source?: string;
  fate: MaterialFate;
  bought: boolean;
  catalogId?: string;
  perUnit?: number;
  packSize?: number;
  orderedQty?: number;
  receivedQty?: number;
  ownedQty?: number;
  actualUnitCost?: number;
  sourceUrl?: string;
  orderBy?: string;
  retired?: boolean;
};

export type StudioStep = {
  id: string;
  when: string;
  what: string;
  hours: number;
  done: boolean;
  dayOffset?: number;
  dueDate?: string;
  assignee?: string;
  instructions?: string[];
  dependsOn?: number[];
  hoursMode?: "fixed" | "recipe" | "per-piece";
  perPieceHours?: number;
};

export type StudioProject = {
  id: string;
  title: string;
  kind: StudioKind;
  intent: StudioIntent;
  stage: StudioStage;
  inspiration: string;
  note: string;
  qty: number;
  budget: number;
  vendorEst: number;
  owner: string;
  zone: string;
  afterFate: AfterFate;
  materials: StudioMaterial[];
  steps: StudioStep[];
  createdAt: string;
  updatedAt: string;
  design?: StudioDesign;
  revisions?: DesignRevision[];
  version?: number;
  shareToken?: string;
};

export const STAGES: { id: StudioStage; label: string }[] = [
  { id: "spark", label: "Inspiration" },
  { id: "design", label: "Design" },
  { id: "spec", label: "Quantities" },
  { id: "source", label: "Source" },
  { id: "build", label: "Build" },
  { id: "pack", label: "Pack" },
  { id: "setup", label: "Set up" },
  { id: "after", label: "After" },
];

export const KINDS: {
  id: StudioKind;
  label: string;
  href: string;
  line: string;
}[] = [
  {
    id: "floral",
    label: "Flowers",
    href: "/diy/studio/floral",
    line: "Recipes, stems, timing",
  },
  {
    id: "table",
    label: "Tables",
    href: "/diy/studio/table",
    line: "What the table actually holds",
  },
  {
    id: "print",
    label: "Print",
    href: "/studio/cards",
    line: "Names on paper",
  },
  {
    id: "cricut",
    label: "Cricut",
    href: "/studio/signage",
    line: "Cut-ready files",
  },
  {
    id: "decor",
    label: "Décor",
    href: "/studio/decor",
    line: "Backdrops, arches, installs",
  },
  {
    id: "lighting",
    label: "Lighting",
    href: "/studio/decor",
    line: "Candles and mood",
  },
  { id: "favors", label: "Favors", href: "/studio/cards", line: "Batch gifts" },
];

export const INTENTS: { id: StudioIntent; label: string; line: string }[] = [
  {
    id: "recreate",
    label: "Recreate it",
    line: "Turn this into a buildable project",
  },
  {
    id: "inspire",
    label: "Use as inspiration",
    line: "Keep the feeling, invent the rest",
  },
  {
    id: "similar",
    label: "Find something similar",
    line: "Start from a Vowfolk template",
  },
  {
    id: "style",
    label: "Add to wedding style",
    line: "Pin it to vision, don’t spec it yet",
  },
];

type Template = {
  id: string;
  kind: StudioKind;
  title: string;
  line: string;
  vendorEstEach: number;
  zone: string;
  materials: Omit<StudioMaterial, "id" | "bought">[];
  steps: Omit<StudioStep, "id" | "done">[];
};

export const TEMPLATES: Template[] = [
  {
    id: "garden-centerpiece",
    kind: "floral",
    title: "Garden centerpiece",
    line: "Low, mixed, hydrangea + garden rose + trailing green",
    vendorEstEach: 85,
    zone: "Tables",
    materials: [
      {
        label: "Garden roses",
        qty: 4,
        unit: "stems",
        estEach: 3.2,
        source: "Wholesale",
        fate: "buy",
      },
      {
        label: "White hydrangea",
        qty: 2,
        unit: "stems",
        estEach: 4.5,
        source: "Trader Joe’s / Costco",
        fate: "buy",
      },
      {
        label: "Spray roses",
        qty: 4,
        unit: "stems",
        estEach: 1.8,
        source: "Wholesale",
        fate: "buy",
      },
      {
        label: "Lisianthus",
        qty: 3,
        unit: "stems",
        estEach: 2.4,
        source: "Wholesale",
        fate: "buy",
      },
      {
        label: "Eucalyptus",
        qty: 2,
        unit: "stems",
        estEach: 1.2,
        source: "Grocery",
        fate: "buy",
      },
      {
        label: "Italian ruscus",
        qty: 2,
        unit: "stems",
        estEach: 1.4,
        source: "Wholesale",
        fate: "buy",
      },
      {
        label: "Compote or bowl",
        qty: 1,
        unit: "vessels",
        estEach: 8,
        source: "Already / thrift",
        fate: "own",
      },
      {
        label: "Floral foam or chicken wire",
        qty: 1,
        unit: "blocks",
        estEach: 2,
        source: "Craft store",
        fate: "buy",
      },
    ],
    steps: [
      { when: "Wed", what: "Pick up vessels. Check water-tight.", hours: 1 },
      {
        when: "Thu",
        what: "Flowers arrive. Condition. Strip foliage. Hydrate overnight.",
        hours: 2,
      },
      { when: "Fri", what: "Build greens and structure.", hours: 2 },
      { when: "Sat AM", what: "Add blooms. Mist. Load upright.", hours: 3 },
      { when: "Sat PM", what: "Place on tables. Final styling.", hours: 1 },
    ],
  },
  {
    id: "welcome-sign",
    kind: "cricut",
    title: "Acrylic welcome sign",
    line: "Vinyl on acrylic, easel at the door",
    vendorEstEach: 180,
    zone: "Ceremony",
    materials: [
      {
        label: "Acrylic sheet 18×24",
        qty: 1,
        unit: "sheets",
        estEach: 28,
        source: "Hardware",
        fate: "buy",
      },
      {
        label: "Permanent vinyl",
        qty: 1,
        unit: "sheets",
        estEach: 8,
        source: "Cricut",
        fate: "buy",
      },
      {
        label: "Transfer tape",
        qty: 1,
        unit: "rolls",
        estEach: 7,
        source: "Cricut",
        fate: "buy",
      },
      {
        label: "Easel",
        qty: 1,
        unit: "easels",
        estEach: 18,
        source: "Borrow",
        fate: "borrow",
      },
    ],
    steps: [
      { when: "2 wks", what: "Lock wording. Cut a test on scrap.", hours: 1 },
      { when: "1 wk", what: "Cut vinyl. Weed in one sitting.", hours: 1.5 },
      { when: "Fri", what: "Transfer onto acrylic.", hours: 0.75 },
      { when: "Sat", what: "Easel at the door.", hours: 0.25 },
    ],
  },
  {
    id: "reception-table",
    kind: "table",
    title: "Reception tablescape",
    line: "Linen, runner, place setting, candles, one centerpiece",
    vendorEstEach: 95,
    zone: "Tables",
    materials: [
      {
        label: "Tablecloth",
        qty: 1,
        unit: "linens",
        estEach: 22,
        source: "Rent",
        fate: "rent",
      },
      {
        label: "Runner",
        qty: 1,
        unit: "runners",
        estEach: 8,
        source: "Buy",
        fate: "buy",
      },
      {
        label: "Napkin",
        qty: 8,
        unit: "napkins",
        estEach: 1.2,
        source: "Rent",
        fate: "rent",
      },
      {
        label: "Taper candle",
        qty: 3,
        unit: "candles",
        estEach: 1.5,
        source: "Buy",
        fate: "buy",
      },
      {
        label: "Votive",
        qty: 4,
        unit: "candles",
        estEach: 0.8,
        source: "Buy",
        fate: "buy",
      },
      {
        label: "Place card",
        qty: 8,
        unit: "cards",
        estEach: 0.2,
        source: "Print",
        fate: "buy",
      },
    ],
    steps: [
      {
        when: "2 wks",
        what: "Confirm linen rental counts against seating.",
        hours: 0.5,
      },
      { when: "Fri", what: "Iron runners. Sort candles by table.", hours: 1.5 },
      { when: "Sat", what: "Dress tables. Place cards last.", hours: 2 },
    ],
  },
  {
    id: "aisle-candles",
    kind: "lighting",
    title: "Aisle candles",
    line: "Tapers in hurricanes, venue-safe",
    vendorEstEach: 12,
    zone: "Ceremony",
    materials: [
      {
        label: "Hurricane or lantern",
        qty: 1,
        unit: "holders",
        estEach: 6,
        source: "Own / thrift",
        fate: "own",
      },
      {
        label: "Taper or LED taper",
        qty: 1,
        unit: "candles",
        estEach: 1.4,
        source: "Buy",
        fate: "buy",
      },
    ],
    steps: [
      { when: "1 wk", what: "Ask venue about open flame.", hours: 0.25 },
      { when: "Fri", what: "Charge LEDs or unwrap tapers.", hours: 0.5 },
      {
        when: "Sat",
        what: "Place along aisle. Light 20 min before.",
        hours: 0.75,
      },
    ],
  },
  {
    id: "favor-tag",
    kind: "favors",
    title: "Favor tags",
    line: "One tag per guest, from the Cards merge",
    vendorEstEach: 3.5,
    zone: "Favors",
    materials: [
      {
        label: "Cardstock tag",
        qty: 1,
        unit: "tags",
        estEach: 0.15,
        source: "Print / Cricut",
        fate: "buy",
      },
      {
        label: "Twine",
        qty: 1,
        unit: "ft",
        estEach: 0.04,
        source: "Craft",
        fate: "buy",
      },
    ],
    steps: [
      {
        when: "2 wks",
        what: "Lock the guest list. Export Cards CSV.",
        hours: 0.5,
      },
      { when: "1 wk", what: "Print or cut. Punch holes.", hours: 2 },
      { when: "Fri", what: "Tie onto favors with two people.", hours: 2 },
    ],
  },
  {
    id: "sweetheart-drape",
    kind: "decor",
    title: "Sweetheart backdrop",
    line: "Pipe, drape, 2× fullness",
    vendorEstEach: 650,
    zone: "Reception",
    materials: [
      {
        label: "Chiffon or voile (yards)",
        qty: 16,
        unit: "yd",
        estEach: 6,
        source: "Fabric store",
        fate: "buy",
      },
      {
        label: "Backdrop stand",
        qty: 1,
        unit: "stands",
        estEach: 45,
        source: "Rent / borrow",
        fate: "rent",
      },
      {
        label: "Sandbags / weights",
        qty: 2,
        unit: "weights",
        estEach: 12,
        source: "Hardware",
        fate: "own",
      },
      {
        label: "Clamps + zip ties",
        qty: 1,
        unit: "kits",
        estEach: 8,
        source: "Hardware",
        fate: "buy",
      },
    ],
    steps: [
      {
        when: "2 wks",
        what: "Confirm venue hanging rules. Measure width and height.",
        hours: 0.5,
      },
      {
        when: "1 wk",
        what: "Steam fabric. It takes longer than you think.",
        hours: 2,
      },
      { when: "Sat AM", what: "Frame, weight legs, hang, style.", hours: 3 },
    ],
  },
];

export const CONTINGENCY = 1.15;

export function templateOf(id: string) {
  return TEMPLATES.find((t) => t.id === id) || TEMPLATES[0];
}

export function scaleTemplate(
  id: string,
  qty: number,
  title?: string,
  inspiration?: string,
  intent: StudioIntent = "recreate",
): Omit<StudioProject, "id" | "createdAt" | "updatedAt"> {
  const t = templateOf(id);
  const n = Math.max(1, qty);
  return {
    title: title?.trim() || t.title,
    kind: t.kind,
    intent,
    stage: "spec",
    inspiration: inspiration?.trim() || "",
    note: t.line,
    qty: n,
    budget: 0,
    vendorEst: Math.round(t.vendorEstEach * n),
    owner: "",
    zone: t.zone,
    afterFate: "unset",
    materials: t.materials.map((m) => ({
      ...m,
      id: `${m.label}-${Math.random().toString(36).slice(2, 7)}`,
      qty: Math.ceil(m.qty * n * (m.fate === "buy" ? CONTINGENCY : 1)),
      bought: false,
    })),
    steps: t.steps.map((s) => ({
      ...s,
      id: `${s.when}-${Math.random().toString(36).slice(2, 7)}`,
      done: false,
    })),
  };
}

export function projectCost(p: StudioProject) {
  return p.materials.reduce((s, m) => s + m.estEach * m.qty, 0);
}

export function projectProgress(p: StudioProject) {
  const shop = p.materials.length;
  const bought = p.materials.filter((m) => m.bought).length;
  const steps = p.steps.length;
  const done = p.steps.filter((s) => s.done).length;
  if (!shop && !steps) return 0;
  return Math.round(
    ((shop ? bought / shop : 0) * 0.5 + (steps ? done / steps : 0) * 0.5) * 100,
  );
}

export function hoursLeft(p: StudioProject) {
  return p.steps.filter((s) => !s.done).reduce((s, x) => s + x.hours, 0);
}

export function nextStep(p: StudioProject) {
  return p.steps.find((s) => !s.done);
}

export function consolidateShop(projects: StudioProject[]) {
  const map = new Map<
    string,
    {
      label: string;
      qty: number;
      unit: string;
      est: number;
      sources: Set<string>;
      bought: number;
      need: number;
    }
  >();
  for (const p of projects) {
    for (const m of p.materials) {
      const key = `${m.label.toLowerCase()}|${m.unit}`;
      const row = map.get(key) || {
        label: m.label,
        qty: 0,
        unit: m.unit,
        est: 0,
        sources: new Set<string>(),
        bought: 0,
        need: 0,
      };
      row.qty += m.qty;
      row.est += m.estEach * m.qty;
      if (m.source) row.sources.add(m.source);
      row.need += 1;
      if (m.bought) row.bought += 1;
      map.set(key, row);
    }
  }
  return [...map.values()].sort((a, b) => a.label.localeCompare(b.label));
}
