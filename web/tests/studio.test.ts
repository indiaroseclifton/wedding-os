import test from "node:test";
import assert from "node:assert/strict";
import {
  defaultDesign,
  materialsForDesign,
  createBuildSteps,
  buildHoursForDesign,
  supplyRows,
  projectReadiness,
  newObject,
  expandedObjects,
  dueDate,
} from "../src/lib/studio/design";
import {
  dateValue,
  designSchema,
  saveSchema,
} from "../src/lib/studio/validation";
import { calendarText } from "../src/lib/studio/calendar";
import { publicHandoff } from "../src/lib/studio/handoff";
import type { StudioProject } from "../src/lib/studio-project";
function project(qty = 12): StudioProject {
  const design = defaultDesign("floral");
  return {
    id: "p1",
    title: "Garden flowers",
    kind: "floral",
    intent: "recreate",
    stage: "design",
    inspiration: "",
    note: "private note",
    qty,
    budget: 800,
    vendorEst: 0,
    owner: "Alex",
    zone: "Reception",
    afterFate: "unset",
    materials: materialsForDesign(design, qty),
    steps: createBuildSteps("floral", design, qty),
    design,
    version: 1,
    revisions: [],
    createdAt: "2026-08-01T12:00:00Z",
    updatedAt: "2026-08-01T12:00:00Z",
  };
}
test("12 to 15 arrangements scales requirements and variable hours without losing purchases", () => {
  const p = project(),
    rose = p.materials.find((m) => m.catalogId === "garden-rose")!;
  rose.orderedQty = 80;
  rose.receivedQty = 75;
  rose.actualUnitCost = 2.9;
  p.materials.push({
    id: "ribbon",
    label: "Custom ribbon",
    qty: 24,
    perUnit: 2,
    estEach: 1,
    unit: "m",
    fate: "buy",
    bought: false,
  });
  const next = materialsForDesign(p.design!, 15, p.materials),
    r = next.find((m) => m.id === rose.id)!;
  assert.equal(r.qty, 87);
  assert.equal(r.orderedQty, 80);
  assert.equal(r.receivedQty, 75);
  assert.equal(r.actualUnitCost, 2.9);
  assert.equal(next.find((m) => m.id === "ribbon")!.qty, 30);
  const steps = buildHoursForDesign(p.steps, p.design!, 15);
  assert.equal(steps[0].hours, p.steps[0].hours);
  assert.ok(steps[4].hours > p.steps[4].hours);
});
test("removed ingredients retain purchasing history but require zero new stock", () => {
  const p = project(),
    rose = p.materials.find((m) => m.catalogId === "garden-rose")!;
  rose.orderedQty = 80;
  p.design!.objects = p.design!.objects.filter(
    (o) => o.catalogId !== "garden-rose",
  );
  const rows = materialsForDesign(p.design!, p.qty, p.materials),
    retired = rows.find((m) => m.id === rose.id)!;
  assert.equal(retired.qty, 0);
  assert.equal(retired.orderedQty, 80);
  assert.equal(retired.retired, true);
});
test("consolidated packs count received as part of orders and round after consolidation", () => {
  const a = project(1),
    b = project(1);
  for (const p of [a, b])
    p.materials = [
      {
        id: p.id + "m",
        label: "Rose",
        catalogId: "garden-rose",
        qty: 11,
        estEach: 2,
        unit: "stems",
        fate: "buy",
        bought: false,
        packSize: 10,
        orderedQty: 5,
        receivedQty: 3,
        ownedQty: 1,
      },
    ];
  const [r] = supplyRows([a, b]);
  assert.equal(r.required, 22);
  assert.equal(r.toOrder, 10);
  assert.equal(r.packs, 1);
  assert.equal(r.missing, 14);
});
test("packing readiness requires every active material fully packed", () => {
  const p = project(1);
  p.design!.approval = { status: "approved", by: "Alex", at: "2026-08-01" };
  p.steps.forEach((s) => (s.done = true));
  p.materials.forEach((m) => (m.receivedQty = m.qty));
  p.design!.boxes = [
    {
      id: "box",
      name: "Table box",
      destination: "Reception",
      owner: "Alex",
      transport: "Level",
      after: "return",
      items: p.materials.map((m) => ({
        materialId: m.id,
        qty: m.qty,
        packed: m.qty,
        placed: 0,
      })),
    },
  ];
  assert.equal(projectReadiness(p).percent, 100);
  p.design!.boxes[0].items[0].packed--;
  assert.equal(projectReadiness(p).percent, 75);
});
test("calendar uses true relative dates, exact overrides and rejects impossible dates", () => {
  const p = project();
  assert.equal(dueDate(p.steps[0], "2026-10-17"), "2026-09-05");
  p.steps[0].dueDate = "2026-08-30";
  assert.equal(dueDate(p.steps[0], "2026-10-17"), "2026-08-30");
  assert.equal(dateValue.safeParse("2026-02-30").success, false);
  const ics = calendarText([p], "2026-10-17");
  assert.match(ics, /DTSTART;VALUE=DATE:20260830/);
  assert.match(ics, /DTSTART;VALUE=DATE:20261018/);
  assert.doesNotMatch(calendarText([p], ""), /DTSTART;VALUE=DATE:202610/);
});
test("dimensions, URLs and total counts are validated before saving", () => {
  const p = project(),
    body = { ...p, expectedVersion: 1 };
  assert.equal(saveSchema.safeParse(body).success, true);
  assert.equal(saveSchema.safeParse({ ...body, qty: 0 }).success, false);
  const d = structuredClone(p.design!);
  d.objects[0].imageUrl = "javascript:alert(1)";
  assert.equal(designSchema.safeParse(d).success, false);
  d.objects[0].imageUrl = "";
  d.objects[0].width = Infinity;
  assert.equal(designSchema.safeParse(d).success, false);
});
test("public helper guides omit private planning and provider information", () => {
  const p = project();
  p.shareToken = "secret";
  p.materials[0].sourceUrl = "https://private-supplier.test";
  p.design!.comments = [
    {
      id: "c",
      body: "private discussion",
      author: "Alex",
      at: "2026-08-01",
      resolved: false,
    },
  ];
  p.design!.artwork = [
    {
      id: "a",
      name: "Menu",
      provider: "Canva",
      editUrl: "https://canva.com/private-editor",
      previewUrl: "",
      fileUrl: "",
      copies: 12,
      width: 10,
      height: 15,
      approved: false,
    },
  ];
  const result = JSON.stringify(publicHandoff(p, "2026-10-17"));
  for (const privateText of [
    "private note",
    "private discussion",
    "private-supplier",
    "private-editor",
    "shareToken",
    "budget",
    "estEach",
  ])
    assert.ok(!result.includes(privateText));
  assert.match(result, /Reception/);
  assert.match(result, /Garden flowers/);
});
test("solid object group quantities are represented by separate measured positions", () => {
  const d = defaultDesign("lighting");
  d.objects = [newObject("hurricane", { count: 9 })];
  const expanded = expandedObjects(d);
  assert.equal(expanded.length, 9);
  assert.equal(new Set(expanded.map((o) => `${o.x}:${o.z}`)).size, 9);
  assert.equal(expanded.filter((o) => o.x === 0 && o.z === 0).length, 1);
});
