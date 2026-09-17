import { RoomSubnav } from "@/components/layout/RoomSubnav";
import { BudgetTool } from "@/components/v2/BudgetTool";

export default function BudgetPage() {
  return (
    <div className="space-y-6">
      <RoomSubnav room="planning" />
      <BudgetTool />
    </div>
  );
}
