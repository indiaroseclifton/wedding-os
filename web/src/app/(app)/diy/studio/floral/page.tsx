import { Suspense } from "react";
import { FlowerDesk } from "@/components/diy/FlowerDesk";
import { FloralStudio } from "@/components/diy/FloralStudio";
import { RoomSubnav } from "@/components/layout/RoomSubnav";

export default async function FloralStudioPage({
  searchParams,
}: {
  searchParams: Promise<{ canvas?: string }>;
}) {
  const q = await searchParams;
  return (
    <div>
      <RoomSubnav room="studio" />
      <Suspense fallback={<p className="text-sm text-muted">Opening the studio…</p>}>
        {q.canvas === "1" ? <FloralStudio /> : <FlowerDesk />}
      </Suspense>
    </div>
  );
}
