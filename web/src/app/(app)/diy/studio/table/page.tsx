import { ensureDemoWorkspace } from "@/lib/data/workspace";
import { getStudio } from "@/lib/data/studio-store";
import { StudioHome } from "@/components/studio/StudioHome";
export default async function Page() {
  const { workspace, meta } = await ensureDemoWorkspace();
  const { projects } = await getStudio(workspace.id);
  return (
    <StudioHome
      projects={projects}
      weddingDate={meta.weddingDate || ""}
      kind="table"
    />
  );
}
