import type {
  StudioKind,
  StudioMaterial,
  StudioProject,
  StudioStep,
} from "@/lib/studio-project";
import { catalogItem, STUDIO_CATALOG, type ObjectKind } from "./catalog";
export type SceneObject = {
  id: string;
  catalogId: string;
  name: string;
  kind: ObjectKind;
  color: string;
  x: number;
  z: number;
  y: number;
  rotation: number;
  width: number;
  depth: number;
  height: number;
  count: number;
  locked: boolean;
  imageUrl?: string;
  parentId?: string;
};
export type StudioReference = {
  id: string;
  url: string;
  title: string;
  imageUrl?: string;
  note: string;
  source: "upload" | "pinterest" | "link" | "canva";
};
export type StudioComment = {
  id: string;
  body: string;
  author: string;
  at: string;
  objectId?: string;
  resolved: boolean;
};
export type StudioBox = {
  id: string;
  name: string;
  destination: string;
  owner: string;
  transport: string;
  after: "keep" | "return" | "sell" | "donate";
  items: { materialId: string; qty: number; packed: number; placed: number }[];
};
export type StudioTrial = {
  id: string;
  date: string;
  photo: string;
  minutes: number;
  cost: number;
  notes: string;
};
export type StudioArtwork = {
  id: string;
  name: string;
  provider: string;
  designId?: string;
  editUrl: string;
  previewUrl: string;
  fileUrl: string;
  width: number;
  height: number;
  copies: number;
  approved: boolean;
  websiteUrl?: string;
};
export type StudioDesign = {
  version: 1;
  revision: number;
  room: {
    width: number;
    depth: number;
    height: number;
    photo: string;
    photoScale: number;
    photoX: number;
    photoY: number;
  };
  surface: {
    shape: "round" | "rectangle" | "none";
    width: number;
    depth: number;
    height: number;
    linen: string;
    runner: string;
    seats: number;
    linenDrop: number;
  };
  objects: SceneObject[];
  contingency: number;
  hoursPerHelper: number;
  helpers: string[];
  lighting: "daylight" | "evening";
  references: StudioReference[];
  artwork: StudioArtwork[];
  comments: StudioComment[];
  boxes: StudioBox[];
  trials: StudioTrial[];
  approval: { status: "draft" | "review" | "approved"; by: string; at: string };
};
export type DesignRevision = {
  id: string;
  name: string;
  at: string;
  design: StudioDesign;
};
export const uid = () => globalThis.crypto.randomUUID();
export const money = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(n);
export const KIND_LABELS: Record<StudioKind, string> = {
  floral: "Flowers",
  table: "Tables",
  print: "Paper & websites",
  cricut: "Signs & cutting",
  decor: "Decor",
  lighting: "Lighting",
  favors: "Favors",
};
export function newObject(
  id: string,
  patch: Partial<SceneObject> = {},
): SceneObject {
  const c = catalogItem(id) || STUDIO_CATALOG[0];
  return {
    id: uid(),
    catalogId: c.id,
    name: c.name,
    kind: c.kind,
    color: c.color,
    x: 0,
    z: 0,
    y: 0,
    rotation: 0,
    width: c.width,
    depth: c.depth,
    height: c.height,
    count: 1,
    locked: false,
    ...patch,
  };
}
export function defaultDesign(kind: StudioKind = "table"): StudioDesign {
  const d: StudioDesign = {
    version: 1,
    revision: 1,
    room: {
      width: 1000,
      depth: 800,
      height: 350,
      photo: "",
      photoScale: 100,
      photoX: 50,
      photoY: 50,
    },
    surface: {
      shape: ["decor", "lighting", "cricut"].includes(kind) ? "none" : "round",
      width: 152,
      depth: 152,
      height: 76,
      linen: "#f2ebdf",
      runner: kind === "table" ? "#a8b29a" : "",
      seats: kind === "table" ? 8 : 0,
      linenDrop: kind === "table" ? 35 : 0,
    },
    objects: [],
    contingency: 0.15,
    hoursPerHelper: 3,
    helpers: [],
    lighting: "daylight",
    references: [],
    artwork: [],
    comments: [],
    boxes: [],
    trials: [],
    approval: { status: "draft", by: "", at: "" },
  };
  if (kind === "floral" || kind === "table") {
    const v = newObject("compote");
    d.objects.push(
      v,
      newObject("garden-rose", { count: 5, y: 14, parentId: v.id }),
      newObject("hydrangea", { count: 3, y: 12, parentId: v.id }),
      newObject("eucalyptus", { count: 3, y: 12, parentId: v.id }),
    );
    if (kind === "table") {
      d.objects.push(
        newObject("taper", { x: -36, z: 8 }),
        newObject("taper", { x: 32, z: -12 }),
      );
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4,
          x = Math.sin(a) * 56,
          z = Math.cos(a) * 56;
        d.objects.push(
          newObject("dinner-plate", { x, z, rotation: (-a * 180) / Math.PI }),
          newObject("linen-napkin", {
            x,
            z,
            y: 2,
            rotation: (-a * 180) / Math.PI,
          }),
          newObject("goblet", {
            x: x * 0.8 + Math.cos(a) * 13,
            z: z * 0.8 - Math.sin(a) * 13,
          }),
          newObject("place-card", {
            x: x * 0.68,
            z: z * 0.68,
            y: 0.3,
            rotation: (-a * 180) / Math.PI,
          }),
        );
      }
      d.objects.push(newObject("table-number", { x: 8, z: 27 }));
    }
  } else if (kind === "decor")
    d.objects.push(
      newObject("arch"),
      newObject("drape", { x: -55, z: 5 }),
      newObject("drape", { x: 55, z: 5 }),
      newObject("plinth", { x: -155, z: 50 }),
    );
  else if (kind === "lighting")
    d.objects.push(
      newObject("hurricane", { x: -40 }),
      newObject("hurricane"),
      newObject("hurricane", { x: 40 }),
      newObject("uplight", { z: -60 }),
    );
  else
    d.objects.push(
      newObject(
        kind === "print"
          ? "menu"
          : kind === "cricut"
            ? "welcome-sign"
            : "favor-box",
      ),
    );
  return d;
}
export function designFor(p: StudioProject): StudioDesign {
  if (p.design) return p.design;
  const d = defaultDesign(p.kind);
  d.objects = [];
  for (const m of p.materials) {
    const c = STUDIO_CATALOG.find(
      (c) => c.name.toLowerCase() === m.label.toLowerCase(),
    );
    if (c)
      d.objects.push(
        newObject(c.id, {
          count: Math.max(1, Math.min(100, Math.round(m.qty / p.qty))),
        }),
      );
  }
  if (p.inspiration)
    d.references.push({
      id: uid(),
      url: p.inspiration,
      title: "Original reference",
      note: "",
      source: "link",
      imageUrl: /^(data:image|\/api\/uploads\/)/.test(p.inspiration)
        ? p.inspiration
        : undefined,
    });
  return d;
}
export function materialsForDesign(
  d: StudioDesign,
  qty: number,
  previous: StudioMaterial[] = [],
): StudioMaterial[] {
  const grouped = new Map<
    string,
    {
      label: string;
      perUnit: number;
      unit: string;
      cost: number;
      pack: number;
      extra: boolean;
    }
  >();
  for (const o of d.objects) {
    const c = catalogItem(o.catalogId);
    if (c) {
      const old = grouped.get(c.id);
      grouped.set(c.id, {
        label: c.name,
        perUnit: (old?.perUnit || 0) + o.count,
        unit: c.unit,
        cost: c.estimate,
        pack: c.pack,
        extra: ["flower", "foliage", "paper", "favor"].includes(c.kind),
      });
    }
  }
  if (d.surface.shape !== "none" && d.surface.linenDrop)
    grouped.set("table-linen", {
      label: "Table linen",
      perUnit: 1,
      unit: "pieces",
      cost: 18,
      pack: 1,
      extra: false,
    });
  if (d.surface.shape !== "none" && d.surface.runner)
    grouped.set("table-runner", {
      label: "Table runner",
      perUnit: 1,
      unit: "pieces",
      cost: 8,
      pack: 1,
      extra: false,
    });
  if (d.objects.some((o) => o.kind === "flower" || o.kind === "foliage"))
    grouped.set("floral-mechanics", {
      label: "Floral tape, liner and mechanics",
      perUnit: 1,
      unit: "kits",
      cost: 4,
      pack: 1,
      extra: false,
    });
  const rows: StudioMaterial[] = [...grouped].map(([catalogId, c]) => {
    const old = previous.find(
      (m) => m.catalogId === catalogId || (!m.catalogId && m.label === c.label),
    );
    return {
      ...old,
      id: old?.id || uid(),
      catalogId,
      label: c.label,
      perUnit: c.perUnit,
      qty: Math.ceil(c.perUnit * qty * (c.extra ? 1 + d.contingency : 1)),
      unit: c.unit,
      estEach: old?.estEach ?? c.cost,
      packSize: old?.packSize || c.pack,
      fate: old?.fate || "buy",
      bought: old?.bought || false,
      orderedQty: old?.orderedQty ?? (old?.bought ? old.qty : 0),
      receivedQty: old?.receivedQty || 0,
      ownedQty: old?.ownedQty || 0,
      retired: false,
    };
  });
  for (const old of previous)
    if (!rows.some((m) => m.id === old.id)) {
      if (!old.catalogId && !STUDIO_CATALOG.some((c) => c.name === old.label))
        rows.push({
          ...old,
          qty: old.retired
            ? 0
            : Math.ceil((old.perUnit ?? old.qty / qty) * qty),
          perUnit: old.perUnit ?? old.qty / qty,
          packSize: old.packSize || 1,
        });
      else if (old.bought || old.orderedQty || old.receivedQty || old.ownedQty)
        rows.push({ ...old, qty: 0, perUnit: 0, retired: true });
    }
  return rows;
}
export function createBuildSteps(
  kind: StudioKind,
  d: StudioDesign,
  qty: number,
): StudioStep[] {
  const minutes = d.objects.reduce(
    (n, o) => n + (catalogItem(o.catalogId)?.minutes || 1) * o.count,
    0,
  );
  const fresh = d.objects.some(
    (o) => catalogItem(o.catalogId)?.material === "fresh",
  );
  const rows: [string, number, number, string[]][] = [
    [
      "Confirm measurements, materials and venue requirements",
      -42,
      0.5,
      [
        "Measure the real surface and confirm the selected product dimensions.",
        "Check venue restrictions with the coordinator.",
      ],
    ],
    [
      "Make one trial and approve the design",
      -28,
      Math.max(0.5, minutes / 60),
      [
        "Make a complete trial with the selected supplies.",
        "Record a photograph, actual time and cost.",
      ],
    ],
    [
      "Order supplies and confirm delivery",
      fresh ? -14 : -21,
      0.5,
      [
        "Review pack sizes, owned stock and substitutions.",
        "Record confirmed orders and delivery dates.",
      ],
    ],
    [
      fresh ? "Receive and hydrate flowers" : "Receive and inspect supplies",
      fresh ? -3 : -10,
      Math.max(0.5, qty / 20),
      [
        "Count and inspect deliveries; record received quantities.",
        fresh
          ? "Follow grower conditioning instructions and allow opening time."
          : "Test the supplies before batching.",
      ],
    ],
    [
      kind === "print" || kind === "cricut"
        ? "Proof, print or cut and assemble"
        : "Make the remaining pieces",
      fresh ? -1 : -7,
      Math.max(0.5, (minutes * qty) / 60),
      [
        "Use the approved trial as your making guide.",
        "Work in repeatable batches and inspect each finished piece.",
      ],
    ],
    [
      "Pack by setup location",
      -1,
      Math.max(0.5, qty / 12),
      [
        "Allocate material quantities to named boxes.",
        "Check fragile items, tools, transport and return labels.",
      ],
    ],
    [
      "Place the design and check the finished setup",
      0,
      Math.max(0.5, qty / 15),
      [
        "Follow the approved visual guide and location notes.",
        "Record placed quantities and missing items.",
      ],
    ],
    [
      "Return rentals and sort reusable materials",
      1,
      0.5,
      [
        "Follow the after-use plan on each box.",
        "Confirm return deadlines with rental suppliers.",
      ],
    ],
  ];
  return rows.map(([what, dayOffset, hours, instructions], i) => ({
    id: uid(),
    what,
    dayOffset,
    when:
      dayOffset === 0
        ? "Wedding day"
        : `${Math.abs(dayOffset)} days ${dayOffset < 0 ? "before" : "after"}`,
    hours: Math.round(hours * 10) / 10,
    instructions,
    done: false,
    assignee: "",
    dependsOn: i ? [i - 1] : [],
    hoursMode:
      i === 4 ? "recipe" : [3, 5, 6].includes(i) ? "per-piece" : "fixed",
    perPieceHours:
      i === 3 ? 1 / 20 : i === 5 ? 1 / 12 : i === 6 ? 1 / 15 : undefined,
  }));
}
export function buildHoursForDesign(
  steps: StudioStep[],
  d: StudioDesign,
  qty: number,
) {
  const recipe =
    d.objects.reduce(
      (n, o) => n + (catalogItem(o.catalogId)?.minutes || 0) * o.count,
      0,
    ) / 60;
  return steps.map((s) =>
    s.done || !s.hoursMode || s.hoursMode === "fixed"
      ? s
      : {
          ...s,
          hours:
            Math.round(
              Math.max(
                0.5,
                (s.hoursMode === "recipe" ? recipe : s.perPieceHours || 0) *
                  qty,
              ) * 10,
            ) / 10,
        },
  );
}
export function dueDate(s: StudioStep, date?: string) {
  if (s.dueDate) return s.dueDate;
  if (!date || s.dayOffset === undefined) return "";
  const d = new Date(`${date}T12:00:00Z`);
  if (Number.isNaN(+d)) return "";
  d.setUTCDate(d.getUTCDate() + s.dayOffset);
  return d.toISOString().slice(0, 10);
}
export function designWarnings(d: StudioDesign, qty = 1) {
  const out: string[] = [],
    s = d.surface;
  if (s.shape !== "none") {
    if (
      s.seats * 55 >
      (s.shape === "round" ? Math.PI * s.width : 2 * (s.width + s.depth))
    )
      out.push(
        "Seat spacing is under 55 cm per person. Check the real venue layout.",
      );
    if (d.objects.some((o) => o.height + o.y > 35 && o.kind === "flower"))
      out.push("Check tall flowers in the guest-eye view for sightlines.");
    if (
      d.objects.some(
        (o) =>
          Math.abs(o.x) + o.width / 2 > s.width / 2 ||
          Math.abs(o.z) + o.depth / 2 > s.depth / 2,
      )
    )
      out.push("An object extends beyond the table boundary.");
  }
  if (d.objects.some((o) => o.kind === "candle"))
    out.push("Confirm the venue’s flame and candle-cover requirements.");
  if (d.objects.some((o) => o.kind === "arch"))
    out.push("Follow the stand manufacturer’s load and ballast instructions.");
  const spacing = Math.max(250, Math.max(s.width, s.depth) + 115),
    capacity =
      Math.floor(d.room.width / spacing) * Math.floor(d.room.depth / spacing);
  if (qty > capacity)
    out.push(
      `${qty} repeated layouts exceed the estimated room capacity of ${capacity}. Confirm venue spacing.`,
    );
  if (d.room.photo)
    out.push("Venue photo alignment is manual; verify measurements on site.");
  return out;
}
export function projectReadiness(p: StudioProject) {
  const d = p.design,
    active = p.materials.filter((m) => m.qty > 0);
  const checks = [
    !!d?.approval.at && d.approval.status === "approved",
    active.length > 0 &&
      active.every((m) => (m.receivedQty || 0) + (m.ownedQty || 0) >= m.qty),
    p.steps.length > 0 && p.steps.every((s) => s.done),
    active.length > 0 &&
      active.every(
        (m) =>
          (d?.boxes || []).reduce(
            (n, b) =>
              n +
              b.items
                .filter((i) => i.materialId === m.id)
                .reduce((v, i) => v + i.packed, 0),
            0,
          ) >= m.qty,
      ),
  ];
  return {
    checks,
    percent: checks.filter(Boolean).length * 25,
    labels: [
      "Design approved",
      "Supplies received",
      "Build tasks complete",
      "Boxes packed",
    ],
  };
}
export function supplyRows(projects: StudioProject[]) {
  const map = new Map<
    string,
    {
      id: string;
      label: string;
      unit: string;
      required: number;
      ordered: number;
      received: number;
      owned: number;
      pack: number;
      cost: number;
      links: { projectId: string; project: string; materialId: string }[];
    }
  >();
  for (const p of projects)
    for (const m of p.materials) {
      const id = `${m.catalogId || m.label}|${m.unit}|${m.sourceUrl || m.source || ""}|${m.packSize || 1}|${m.actualUnitCost ?? m.estEach}|${m.fate}`;
      const row = map.get(id) || {
        id,
        label: m.label,
        unit: m.unit,
        required: 0,
        ordered: 0,
        received: 0,
        owned: 0,
        pack: m.packSize || 1,
        cost: m.actualUnitCost ?? m.estEach,
        links: [],
      };
      row.required += m.qty;
      row.ordered += m.orderedQty ?? (m.bought ? m.qty : 0);
      row.received += m.receivedQty || 0;
      row.owned += m.ownedQty || 0;
      row.links.push({ projectId: p.id, project: p.title, materialId: m.id });
      map.set(id, row);
    }
  return [...map.values()]
    .map((r) => ({
      ...r,
      toOrder: Math.max(
        0,
        r.required - r.owned - Math.max(r.ordered, r.received),
      ),
      packs: Math.ceil(
        Math.max(0, r.required - r.owned - Math.max(r.ordered, r.received)) /
          r.pack,
      ),
      missing: Math.max(0, r.required - r.owned - r.received),
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}
export function csvDownload(name: string, rows: (string | number)[][]) {
  const text = rows
    .map((r) =>
      r
        .map(
          (v) =>
            `"${String(v)
              .replace(/^[=+@-]/, "'$&")
              .replaceAll('"', '""')}"`,
        )
        .join(","),
    )
    .join("\r\n");
  const u = URL.createObjectURL(
    new Blob(["\ufeff", text], { type: "text/csv;charset=utf-8" }),
  );
  const a = document.createElement("a");
  a.href = u;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(u), 1000);
}

/** Repeat grouped solid objects at measured spacing; flower groups retain individual stems. */
export function expandedObjects(d: StudioDesign): SceneObject[] {
  return d.objects.flatMap((o) => {
    if (o.count === 1 || o.kind === "flower" || o.kind === "foliage")
      return [o];
    const cols = Math.ceil(Math.sqrt(o.count)),
      rows = Math.ceil(o.count / cols);
    return Array.from({ length: o.count }, (_, i) => ({
      ...o,
      count: 1,
      x: o.x + ((i % cols) - (cols - 1) / 2) * o.width * 1.2,
      z: o.z + (Math.floor(i / cols) - (rows - 1) / 2) * o.depth * 1.2,
    }));
  });
}
