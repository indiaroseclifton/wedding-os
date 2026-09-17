import { FloorBoard } from "@/components/v2/FloorBoard";
import { HowToButton } from "@/components/v2/HowToPop";
import { PRINT_CENTER } from "@/lib/print-center";

export default function PrintCenterPage() {
  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted">Studio · {PRINT_CENTER.name}</p>
        <HowToButton id="print-center" />
      </div>
      <p className="rounded-2xl border border-line bg-surface/60 px-5 py-3 text-sm text-muted">
        This is the floorplan maker. The file you send replaces the first-cut board below.
      </p>
      <FloorBoard />
    </div>
  );
}
