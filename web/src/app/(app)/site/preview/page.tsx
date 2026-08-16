import { redirect } from "next/navigation";
import { ensureDemoWorkspace } from "@/lib/data/workspace";
import { getSite } from "@/lib/data/site-store";

export default async function SitePreviewRedirect() {
  const { workspace } = await ensureDemoWorkspace();
  const site = await getSite(workspace.id);
  if (!site.siteToken) redirect("/site");
  redirect(`/w/${site.siteToken}`);
}
