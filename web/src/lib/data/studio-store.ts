import path from "path";
import { randomUUID } from "crypto";
import { dataDir, ensureDir, readText, writeText } from "./store-io";
import {
  scaleTemplate,
  type AfterFate,
  type StudioIntent,
  type StudioProject,
  type StudioStage,
} from "@/lib/studio-project";

const file = path.join(dataDir, "studio-projects.json");

export type StoredStudio = {
  workspaceId: string;
  projects: StudioProject[];
  updatedAt: string;
};

export async function readAllStudio(): Promise<Record<string, StoredStudio>> {
  await ensureDir();
  try {
    return JSON.parse(await readText(file));
  } catch {
    return {};
  }
}

async function writeAll(all: Record<string, StoredStudio>) {
  await writeText(file, JSON.stringify(all, null, 2));
}

export async function getStudio(workspaceId: string): Promise<StoredStudio> {
  const all = await readAllStudio();
  if (!all[workspaceId]) {
    all[workspaceId] = { workspaceId, projects: [], updatedAt: new Date().toISOString() };
  }
  return all[workspaceId];
}

async function save(workspaceId: string, projects: StudioProject[]) {
  const all = await readAllStudio();
  all[workspaceId] = { workspaceId, projects, updatedAt: new Date().toISOString() };
  await writeAll(all);
  return all[workspaceId];
}

export async function createFromTemplate(
  workspaceId: string,
  input: { templateId: string; qty: number; title?: string; inspiration?: string; intent?: StudioIntent; budget?: number }
) {
  const now = new Date().toISOString();
  const draft = scaleTemplate(input.templateId, input.qty, input.title, input.inspiration, input.intent);
  const project: StudioProject = {
    ...draft,
    id: randomUUID(),
    budget: input.budget || 0,
    materials: draft.materials.map((m) => ({ ...m, id: randomUUID() })),
    steps: draft.steps.map((s) => ({ ...s, id: randomUUID() })),
    createdAt: now,
    updatedAt: now,
  };
  const current = await getStudio(workspaceId);
  return save(workspaceId, [...current.projects, project]);
}

export async function patchProject(workspaceId: string, id: string, patch: Partial<StudioProject>) {
  const current = await getStudio(workspaceId);
  const projects = current.projects.map((p) => (p.id === id ? { ...p, ...patch, id: p.id, updatedAt: new Date().toISOString() } : p));
  return save(workspaceId, projects);
}

export async function toggleMaterial(workspaceId: string, id: string, materialId: string) {
  const current = await getStudio(workspaceId);
  const projects = current.projects.map((p) =>
    p.id !== id
      ? p
      : {
          ...p,
          materials: p.materials.map((m) => (m.id === materialId ? { ...m, bought: !m.bought } : m)),
          updatedAt: new Date().toISOString(),
        }
  );
  return save(workspaceId, projects);
}

export async function toggleStep(workspaceId: string, id: string, stepId: string) {
  const current = await getStudio(workspaceId);
  const projects = current.projects.map((p) =>
    p.id !== id
      ? p
      : {
          ...p,
          steps: p.steps.map((s) => (s.id === stepId ? { ...s, done: !s.done } : s)),
          updatedAt: new Date().toISOString(),
        }
  );
  return save(workspaceId, projects);
}

export async function setStage(workspaceId: string, id: string, stage: StudioStage) {
  return patchProject(workspaceId, id, { stage });
}

export async function setAfter(workspaceId: string, id: string, afterFate: AfterFate) {
  return patchProject(workspaceId, id, { afterFate, stage: "after" });
}

export async function deleteProject(workspaceId: string, id: string) {
  const current = await getStudio(workspaceId);
  return save(workspaceId, current.projects.filter((p) => p.id !== id));
}

export async function upsertKindProject(
  workspaceId: string,
  input: {
    kind: StudioProject["kind"];
    title: string;
    qty: number;
    materials: { label: string; qty: number; unit?: string; estEach: number }[];
    vendorEst?: number;
    note?: string;
    inspiration?: string;
    budget?: number;
    owner?: string;
    steps?: { when: string; what: string; hours: number }[];
  }
) {
  const current = await getStudio(workspaceId);
  const existing = current.projects.find((p) => p.kind === input.kind && p.title === input.title);
  const incoming = input.materials.map((m) => ({
    id: randomUUID(),
    label: m.label,
    qty: m.qty,
    unit: m.unit || "stems",
    estEach: m.estEach,
    fate: "buy" as const,
    bought: false,
    source: "Studio",
  }));
  const incomingSteps = (input.steps || []).map((step) => ({
    ...step,
    id: randomUUID(),
    done: false,
  }));
  if (existing) {
    const kept = existing.materials.map((old) => {
      const hit = incoming.find((m) => m.label === old.label);
      return hit ? { ...old, qty: hit.qty, estEach: hit.estEach } : old;
    });
    const added = incoming.filter((m) => !existing.materials.some((o) => o.label === m.label));
    const steps = incomingSteps.map((step) => {
      const previous = existing.steps.find((old) => old.what === step.what);
      return previous ? { ...step, id: previous.id, done: previous.done } : step;
    });
    return patchProject(workspaceId, existing.id, {
      qty: input.qty,
      vendorEst: input.vendorEst ?? existing.vendorEst,
      note: input.note ?? existing.note,
      inspiration: input.inspiration ?? existing.inspiration,
      budget: input.budget ?? existing.budget,
      owner: input.owner ?? existing.owner,
      materials: [...kept, ...added],
      steps: incomingSteps.length ? steps : existing.steps,
    });
  }
  const now = new Date().toISOString();
  const project: StudioProject = {
    id: randomUUID(),
    title: input.title,
    kind: input.kind,
    intent: "recreate",
    stage: "spec",
    inspiration: input.inspiration || "",
    note: input.note || "",
    qty: input.qty,
    budget: input.budget || 0,
    vendorEst: input.vendorEst || 0,
    owner: input.owner || "",
    zone: input.kind === "floral" ? "Tables" : "",
    afterFate: "unset",
    materials: incoming,
    steps: incomingSteps,
    createdAt: now,
    updatedAt: now,
  };
  return save(workspaceId, [...current.projects, project]);
}

export async function mutateStudio<T>(workspaceId:string,change:(projects:StudioProject[])=>T|Promise<T>){const {mutateRecord}=await import("@/lib/studio/persistence");return mutateRecord<StoredStudio,T>("studio-projects.json",async all=>{const row=all[workspaceId]||{workspaceId,projects:[],updatedAt:new Date().toISOString()};const result=await change(row.projects);row.updatedAt=new Date().toISOString();all[workspaceId]=row;return result;});}
