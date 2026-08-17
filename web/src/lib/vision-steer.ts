import { getAttire, saveAttire } from "@/lib/data/attire-store";
import { upsertMoodPins } from "@/lib/data/moodboard-store";
import { getSite, saveSite } from "@/lib/data/site-store";
import { siteTemplateFor, type VisionPayload } from "@/lib/vision";

export async function applyVisionSteering(
  workspaceId: string,
  vision: VisionPayload,
  decided: boolean
) {
  await upsertMoodPins(workspaceId, [
    ...vision.feel.map((p) => ({
      title: p.why || p.tag,
      url: p.url,
      notes: p.why,
      tag: tagFor(p.tag),
    })),
    ...vision.reject.map((p) => ({
      title: "No",
      url: p.url,
      notes: "Hard no",
      tag: "No",
    })),
  ]);

  if (!decided) return;

  const attire = await getAttire(workspaceId);
  if (!attire.paletteNotes?.trim() && vision.palette?.hex.length) {
    await saveAttire(workspaceId, { paletteNotes: vision.palette.hex.join(" · ") });
  }

  const site = await getSite(workspaceId);
  const patch: { template?: "letter" | "garden" | "midnight"; dressCode?: string } = {};
  if (!site.template || site.template === "letter") patch.template = siteTemplateFor(vision.story);
  if (!site.dressCode && vision.formal) patch.dressCode = vision.formal;
  if (Object.keys(patch).length) await saveSite(workspaceId, patch);
}

function tagFor(tag: string) {
  if (tag === "flower") return "Florals";
  if (tag === "table" || tag === "light") return "Tables";
  if (tag === "dress") return "Dress";
  if (tag === "place") return "Venue";
  if (tag === "paper") return "Paper";
  return "Other";
}
