import { redirect } from "next/navigation";
import { FLOOR_PLANNER } from "@/lib/print-center";

export default function FloorPlanRedirect() {
  redirect(FLOOR_PLANNER.href);
}
