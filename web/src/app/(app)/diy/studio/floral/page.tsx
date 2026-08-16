import { Suspense } from "react";
import { FloralStudio } from "@/components/diy/FloralStudio";

export default function FloralStudioPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted">Opening the studio…</p>}>
      <FloralStudio />
    </Suspense>
  );
}
