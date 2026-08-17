import { RoomSubnav } from "@/components/layout/RoomSubnav";
import { VisionStudio } from "@/components/vision/VisionStudio";
import { ensureDemoWorkspace, getWorkspaceDecisions } from "@/lib/data/workspace";
import { EMPTY_VISION, normalizeVision } from "@/lib/vision";

export default async function VisionPage({
  searchParams,
}: {
  searchParams: Promise<{ walk?: string }>;
}) {
  const { walk } = await searchParams;
  const { workspace } = await ensureDemoWorkspace();
  const decisions = await getWorkspaceDecisions(workspace.id);
  const row = decisions.find((d) => d.type === "STYLE_VIBE");
  const initial = row ? normalizeVision(row.payload) : EMPTY_VISION;

  return (
    <div>
      <RoomSubnav room="planning" />
      <VisionStudio initial={initial} startWalk={walk === "1"} />
    </div>
  );
}
