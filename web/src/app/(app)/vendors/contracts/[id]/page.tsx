import { notFound } from "next/navigation";
import { RoomSubnav } from "@/components/layout/RoomSubnav";
import { ensureDemoWorkspace } from "@/lib/data/workspace";
import { getVendor } from "@/lib/data/vendors-store";
import { ClauseStudio } from "@/components/vendors/ClauseStudio";

export default async function ClauseStudioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await ensureDemoWorkspace();
  const vendor = await getVendor(id);
  if (!vendor) notFound();
  return (
    <div className="space-y-6">
      <RoomSubnav room="planning" />
      <ClauseStudio
        vendorId={vendor.id}
        name={vendor.name}
        email={vendor.email}
        contractUrl={vendor.contractUrl}
        initial={vendor.contractReview}
      />
    </div>
  );
}
