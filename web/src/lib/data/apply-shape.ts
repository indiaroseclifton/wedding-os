import { randomUUID } from "crypto";
import { getWorkspaceMeta, saveWorkspaceMeta } from "./store";
import { getChecklist, saveChecklist, STARTER, type ChecklistItem } from "./checklist-store";
import { getDayOf, saveDayOf } from "./dayof-store";
import { getSite, saveSite } from "./site-store";
import { getBudget, saveBudget } from "./budget-store";
import { SHAPE_STARTERS } from "@/lib/shape-checklists";
import { SHAPE_SCHEDULES } from "@/lib/shape-schedule";
import {
  envelopesForShape,
  shapeOf,
  enterOf,
  siteModeFor,
  type WeddingShape,
  type EnterHow,
} from "@/lib/shape";
import { DEMO_WORKSPACE } from "./workspace";

export async function applyShape(
  workspaceId: string,
  input: {
    shape: WeddingShape;
    enterHow?: EnterHow;
    gatheringDate?: string;
    resetDefaults?: boolean;
  }
) {
  const shape = shapeOf(input.shape);
  const enterHow = enterOf(input.enterHow);
  await saveWorkspaceMeta(workspaceId, {
    shape,
    enterHow,
    gatheringDate: input.gatheringDate || undefined,
    siteMode: siteModeFor(shape),
  });

  if (!input.resetDefaults) {
    return getWorkspaceMeta(workspaceId, DEMO_WORKSPACE.name);
  }

  const starter =
    shape === "weekend"
      ? STARTER.map((s) => ({ phase: s.phase, title: s.title }))
      : SHAPE_STARTERS[shape];
  const current = await getChecklist(workspaceId);
  const done = current.items.filter((i) => i.done);
  const doneTitles = new Set(done.map((i) => i.title));
  const faith = current.items.filter((i) => i.source === "faith" && !doneTitles.has(i.title));
  const nextItems: ChecklistItem[] = [
    ...done,
    ...faith,
    ...starter
      .filter((s) => !doneTitles.has(s.title))
      .map((s) => ({
        id: randomUUID(),
        phase: s.phase,
        title: s.title,
        done: false,
        source: "starter" as const,
      })),
  ];
  await saveChecklist(workspaceId, { items: nextItems });

  const tmpl = shape === "weekend" ? null : SHAPE_SCHEDULES[shape];
  if (tmpl) {
    const day = await getDayOf(workspaceId);
    await saveDayOf(workspaceId, {
      schedule: tmpl.map((s) => ({ ...s, id: randomUUID() })),
      checkIns:
        shape === "us"
          ? [{ id: randomUUID(), name: "Photographer", role: "Vendor", status: "NOT_STARTED" as const }]
          : day.checkIns,
    });
  }

  const site = await getSite(workspaceId);
  if (siteModeFor(shape) === "announce") {
    await saveSite(workspaceId, {
      rsvpOpen: false,
      showTravel: false,
      headline: site.headline || "We got married",
    });
  } else if (!site.headline) {
    await saveSite(workspaceId, { rsvpOpen: true, showTravel: true });
  }

  const weights = envelopesForShape(shape);
  if (weights) {
    const budget = await getBudget(workspaceId);
    const cap = budget.overallLimit || budget.lines.reduce((s, l) => s + (l.planned || 0), 0);
    if (cap > 0) {
      const byCat = new Map(budget.lines.map((l) => [l.category, l]));
      const lines = weights.map((w) => {
        const have = byCat.get(w.id);
        return {
          id: have?.id || randomUUID(),
          category: w.id,
          label: have?.label || w.id,
          planned: Math.round((cap * w.pct) / 100),
          actual: have?.actual || 0,
          path: have?.path || "undecided",
        };
      });
      await saveBudget(workspaceId, { lines });
    }
  }

  return getWorkspaceMeta(workspaceId, DEMO_WORKSPACE.name);
}
