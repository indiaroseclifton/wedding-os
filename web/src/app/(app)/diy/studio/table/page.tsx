import { TableStudio } from "@/components/diy/TableStudio";
import { RoomSubnav } from "@/components/layout/RoomSubnav";

export default function TableStudioPage() {
  return (
    <div>
      <RoomSubnav room="studio" />
      <TableStudio />
    </div>
  );
}