import { notFound } from "next/navigation";
import { findBoxByToken } from "@/lib/data/inventory-store";
import { getWorkspaceMeta } from "@/lib/data/store";
import { DEMO_WORKSPACE } from "@/lib/data/workspace";
import { BoxScan } from "@/components/studio/BoxScan";

export default async function BoxPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const found = await findBoxByToken(token);
  if (!found) notFound();
  const meta = await getWorkspaceMeta(found.workspaceId, DEMO_WORKSPACE.name);
  return (
    <BoxScan
      token={token}
      names={meta.coupleNames || meta.name}
      box={found.box}
    />
  );
}
