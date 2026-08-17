import { Suspense } from "react";
import { FloralStudio } from "@/components/diy/FloralStudio";
import { RoomSubnav } from "@/components/layout/RoomSubnav";

export default function FloralStudioPage() {
  return (
    <div>
      <RoomSubnav room="studio" />
      <Suspense fallback={<p className="text-sm text-muted">Opening the studio…</p>}>
        <FloralStudio />
      </Suspense>
    </div>
  );
}