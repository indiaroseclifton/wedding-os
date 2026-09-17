import { redirect } from "next/navigation";
import { PRINT_CENTER } from "@/lib/print-center";

export default function FloorPlanPage() {
  redirect(PRINT_CENTER.href);
}
