import { getDayOf, saveDayOf, copyMainToRain } from "@/lib/data/dayof-store";
import { getMusic, saveMusic } from "@/lib/data/music-store";
import { setPathChoice } from "@/lib/data/path-store";
import { randomUUID } from "crypto";

/** A decided catalog item writes into the rooms it should change. */
export async function applyDecisionEffects(
  workspaceId: string,
  catalogId: string | undefined,
  answer: string
) {
  if (!catalogId || !answer.trim()) return { wrote: [] as string[] };
  const wrote: string[] = [];
  const a = answer.toLowerCase();

  if (catalogId === "first-look") {
    const day = await getDayOf(workspaceId);
    const has = (day.schedule || []).some((s) => /first look/i.test(s.title));
    if (/yes|private|before/.test(a) && !has) {
      await saveDayOf(workspaceId, {
        schedule: [
          ...(day.schedule || []),
          {
            id: randomUUID(),
            time: "14:30",
            endTime: "15:30",
            title: "First look",
            location: "Garden",
            lead: "Photo",
            audiences: ["couple", "vendor"],
            notes: answer,
          },
        ],
      });
      wrote.push("run of show");
    }
  }

  if (catalogId === "rain-plan") {
    if (/tent|indoor|porch|held/.test(a)) {
      const day = await getDayOf(workspaceId);
      if (!(day.rainSchedule || []).length) {
        await copyMainToRain(workspaceId);
        wrote.push("rain plan");
      }
    }
  }

  if (catalogId === "hard-stop") {
    const music = await getMusic(workspaceId);
    const note = `Hard stop: ${answer}`;
    if (!(music.notes || "").includes("Hard stop")) {
      await saveMusic(workspaceId, { notes: [music.notes, note].filter(Boolean).join("\n") });
      wrote.push("DJ notes");
    }
  }

  if (catalogId === "kids") {
    // seating kids table is a fixture they can add; we just record the path
    wrote.push("kids");
  }

  if (catalogId === "flowers" || /flower/.test(catalogId)) {
    if (/diy|make|grocery|wholesale/.test(a)) {
      await setPathChoice(workspaceId, "flowers", "diy");
      wrote.push("DIY path");
    } else if (/hire|florist/.test(a)) {
      await setPathChoice(workspaceId, "flowers", "hire");
      wrote.push("hire florist");
    }
  }

  return { wrote };
}
