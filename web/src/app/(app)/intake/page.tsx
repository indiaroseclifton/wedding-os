import { Suspense } from "react";
import { IntakeWalk } from "@/components/v2/IntakeWalk";

export default function IntakePage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted">Opening the walk…</p>}>
      <IntakeWalk />
    </Suspense>
  );
}
