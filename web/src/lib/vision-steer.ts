import { getAttire, saveAttire } from "@/lib/data/attire-store";
import { getSite, saveSite } from "@/lib/data/site-store";
import { updateWorkspaceMeta } from "@/lib/data/workspace";
import { siteTemplateFor, visionCover, type VisionPayload } from "@/lib/vision";

export async function applyVisionSteering(
  workspaceId: string,
  vision: VisionPayload,
  decided: boolean
) {
  const cover = visionCover(vision);
  if (cover) {
    await updateWorkspaceMeta(workspaceId, { coverUrl: cover });
  }

  if (!decided) return;

  const attire = await getAttire(workspaceId);
  if (!attire.paletteNotes?.trim() && vision.palette?.hex.length) {
    await saveAttire(workspaceId, { paletteNotes: vision.palette.hex.join(" · ") });
  }

  const site = await getSite(workspaceId);
  const patch: {
    template?: "letter" | "garden" | "midnight";
    dressCode?: string;
  } = {
    template: siteTemplateFor(vision.story),
  };
  if (vision.formal) patch.dressCode = vision.formal;
  else if (site.dressCode) patch.dressCode = site.dressCode;
  await saveSite(workspaceId, patch);
}