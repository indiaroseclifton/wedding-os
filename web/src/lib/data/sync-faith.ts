import { packsForFaith } from "@/lib/preferences";
import { applyPack, PACKS } from "./traditions-store";
import { ensureFaithItems } from "./checklist-store";

function phaseFromTiming(timing?: string) {
  const s = (timing || "").toLowerCase();
  if (s.includes("6") || s.includes("planning") || s.includes("pre") || s.includes("venue")) return "6-8";
  if (s.includes("2") || s.includes("ceremony")) return "2-3";
  if (s.includes("1 month")) return "1";
  if (s.includes("reception") || s.includes("day") || s.includes("after")) return "week";
  return "4-5";
}

export async function syncFaithToPlanning(
  workspaceId: string,
  faith?: string,
  extraPacks?: string[]
) {
  const ids = packsForFaith(faith, extraPacks);
  for (const id of ids) {
    await applyPack(workspaceId, id);
  }
  const incoming = PACKS.filter((p) => ids.includes(p.id)).flatMap((p) =>
    p.items.map((item) => ({
      title: item.title,
      phase: phaseFromTiming(item.timing),
      packId: p.id,
    }))
  );
  if (incoming.length) await ensureFaithItems(workspaceId, incoming);
  return ids;
}
