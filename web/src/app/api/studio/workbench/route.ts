import { NextResponse } from "next/server";
import { z } from "zod";
import { requireCoupleApi } from "@/lib/auth/access";
import { ensureDemoWorkspace } from "@/lib/data/workspace";
import { getStudio, mutateStudio } from "@/lib/data/studio-store";
import {
  buildHoursForDesign,
  createBuildSteps,
  defaultDesign,
  materialsForDesign,
  uid,
  type StudioDesign,
} from "@/lib/studio/design";
import { kindSchema, sameOrigin, saveSchema } from "@/lib/studio/validation";
import type { StudioProject } from "@/lib/studio-project";
export async function GET() {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  const { workspace, meta } = await ensureDemoWorkspace();
  const { projects } = await getStudio(workspace.id);
  return NextResponse.json(
    {
      projects,
      weddingDate: meta.weddingDate || "",
      user: access.session.name,
      ai: !!process.env.OPENAI_API_KEY,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
export async function POST(request: Request) {
  const access = await requireCoupleApi();
  if (!access.ok) return access.response;
  if (!sameOrigin(request))
    return NextResponse.json(
      { error: "Request origin does not match" },
      { status: 403 },
    );
  if (Number(request.headers.get("content-length")) > 8000000)
    return NextResponse.json(
      { error: "Project is too large" },
      { status: 413 },
    );
  const { workspace } = await ensureDemoWorkspace();
  try {
    const body = await request.json();
    if (body.action === "create") {
      const kind = kindSchema.parse(body.kind),
        qty = z
          .number()
          .int()
          .min(1)
          .max(10000)
          .parse(body.qty ?? 1),
        design = defaultDesign(kind),
        at = new Date().toISOString();
      const titles = {
        floral: "Garden centerpiece",
        table: "Reception table",
        print: "Wedding paper suite",
        cricut: "Welcome sign",
        decor: "Ceremony backdrop",
        lighting: "Evening candlelight",
        favors: "Guest favors",
      };
      const project: StudioProject = {
        id: uid(),
        kind,
        title: String(body.title || titles[kind]).slice(0, 150),
        intent: "recreate",
        stage: "design",
        inspiration: "",
        note: "",
        qty,
        budget: 0,
        vendorEst: 0,
        owner: access.session.name,
        zone: "",
        afterFate: "unset",
        materials: materialsForDesign(design, qty),
        steps: createBuildSteps(kind, design, qty),
        design,
        version: 1,
        revisions: [],
        createdAt: at,
        updatedAt: at,
      };
      await mutateStudio(workspace.id, (rows) => rows.push(project));
      return NextResponse.json({ project }, { status: 201 });
    }
    if (body.action === "save") {
      const input = saveSchema.parse(body);
      const project = await mutateStudio(workspace.id, (rows) => {
        const index = rows.findIndex((p) => p.id === input.id);
        if (index < 0) throw new Error("NOT_FOUND");
        const old = rows[index];
        if ((old.version || 0) !== input.expectedVersion)
          throw new Error("CONFLICT");
        const design: StudioDesign = {
          ...input.design,
          revision: (old.design?.revision || 0) + 1,
        };
        const previous = input.materials.map((m) => ({
          ...m,
          perUnit: m.perUnit ?? m.qty / Math.max(1, old.qty),
        }));
        const materials = materialsForDesign(design, input.qty, previous),
          ids = new Set(materials.map((m) => m.id));
        if (ids.size !== materials.length)
          throw new Error("Duplicate material identifiers");
        if (
          design.boxes.some((b) =>
            b.items.some(
              (i) =>
                !ids.has(i.materialId) ||
                i.packed > i.qty ||
                i.placed > i.packed,
            ),
          )
        )
          throw new Error("Invalid box quantities or material reference");
        if (input.steps.some((s, i) => (s.dependsOn || []).some((n) => n >= i)))
          throw new Error("Tasks can only depend on an earlier task");
        if (
          input.steps.some(
            (s) =>
              s.done && (s.dependsOn || []).some((n) => !input.steps[n]?.done),
          )
        )
          throw new Error(
            "Complete task dependencies before marking a task done",
          );
        const objectIds = new Set(design.objects.map((o) => o.id));
        if (objectIds.size !== design.objects.length)
          throw new Error("Duplicate object identifiers");
        if (
          design.objects.some(
            (o) =>
              o.parentId &&
              !design.objects.some(
                (v) => v.id === o.parentId && v.kind === "vessel",
              ),
          )
        )
          throw new Error("A flower’s vessel is missing");
        const changed =
          old.qty !== input.qty ||
          JSON.stringify(old.design?.objects) !==
            JSON.stringify(design.objects) ||
          JSON.stringify(old.design?.surface) !==
            JSON.stringify(design.surface) ||
          JSON.stringify(old.design?.artwork) !==
            JSON.stringify(design.artwork);
        if (changed && old.design?.approval.status === "approved")
          design.approval = { status: "review", by: "", at: "" };
        if (design.approval.status === "approved")
          design.approval =
            old.design?.approval.status === "approved" && !changed
              ? old.design.approval
              : {
                  status: "approved",
                  by: access.session.name,
                  at: new Date().toISOString(),
                };
        design.comments = design.comments.map((c) => {
          const prior = old.design?.comments.find((x) => x.id === c.id);
          return {
            ...c,
            author: prior?.author || access.session.name,
            at: prior?.at || new Date().toISOString(),
          };
        });
        const revisions = [...(old.revisions || [])];
        if (input.checkpoint && old.design)
          revisions.unshift({
            id: uid(),
            name: input.checkpoint,
            at: new Date().toISOString(),
            design: old.design,
          });
        const next: StudioProject = {
          ...old,
          title: input.title,
          qty: input.qty,
          budget: input.budget,
          note: input.note,
          owner: input.owner,
          zone: input.zone,
          design,
          materials,
          steps: buildHoursForDesign(input.steps, design, input.qty),
          version: (old.version || 0) + 1,
          revisions: revisions.slice(0, 12),
          updatedAt: new Date().toISOString(),
        };
        rows[index] = next;
        return next;
      });
      return NextResponse.json({ project });
    }
    if (body.action === "duplicate") {
      const project = await mutateStudio(workspace.id, (rows) => {
        const old = rows.find((p) => p.id === body.id);
        if (!old) throw new Error("NOT_FOUND");
        const p = structuredClone(old);
        p.id = uid();
        p.title = `${old.title} — option B`;
        p.version = 1;
        p.shareToken = undefined;
        p.revisions = [];
        p.createdAt = p.updatedAt = new Date().toISOString();
        p.materials = p.materials
          .filter((m) => m.qty > 0)
          .map((m) => ({
            ...m,
            id: uid(),
            bought: false,
            orderedQty: 0,
            receivedQty: 0,
            ownedQty: 0,
          }));
        p.steps = p.steps.map((s) => ({ ...s, id: uid(), done: false }));
        if (p.design) {
          p.design.boxes = [];
          p.design.comments = [];
          p.design.approval = { status: "draft", by: "", at: "" };
        }
        rows.push(p);
        return p;
      });
      return NextResponse.json({ project });
    }
    if (body.action === "share" || body.action === "revoke") {
      const token = await mutateStudio(workspace.id, (rows) => {
        const p = rows.find((p) => p.id === body.id);
        if (!p) throw new Error("NOT_FOUND");
        p.shareToken =
          body.action === "revoke"
            ? undefined
            : uid().replaceAll("-", "") + uid().slice(0, 8);
        p.version = (p.version || 0) + 1;
        return p.shareToken;
      });
      return NextResponse.json({ url: token ? `/build/${token}` : null });
    }
    return NextResponse.json(
      { error: "Choose a supported action" },
      { status: 400 },
    );
  } catch (e) {
    const m = e instanceof Error ? e.message : "Could not save";
    return NextResponse.json(
      {
        error:
          m === "CONFLICT"
            ? "This project changed in another window. Reload the saved version before saving."
            : m === "NOT_FOUND"
              ? "Project not found"
              : e instanceof z.ZodError
                ? "Check project dates, dimensions and quantities."
                : m,
      },
      { status: m === "CONFLICT" ? 409 : m === "NOT_FOUND" ? 404 : 400 },
    );
  }
}
