import { notFound } from "next/navigation";
import { ensureDemoWorkspace } from "@/lib/data/workspace";
import { getStudio } from "@/lib/data/studio-store";
import { ProjectDesk } from "@/components/studio/ProjectDesk";

export default async function StudioProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { workspace } = await ensureDemoWorkspace();
  const studio = await getStudio(workspace.id);
  const project = studio.projects.find((p) => p.id === id);
  if (!project) notFound();
  return <ProjectDesk initial={project} />;
}
