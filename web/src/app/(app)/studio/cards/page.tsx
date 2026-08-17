import { ensureDemoWorkspace, getWorkspaceGuests } from "@/lib/data/workspace";
import { CardsDesk } from "@/components/studio/CardsDesk";

export default async function CardsPage() {
  const { workspace, meta } = await ensureDemoWorkspace();
  const guests = await getWorkspaceGuests(workspace.id);
  return (
    <CardsDesk
      guests={guests}
      names={meta.coupleNames || meta.name}
    />
  );
}
