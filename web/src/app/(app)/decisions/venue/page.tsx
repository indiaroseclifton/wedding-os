import { redirect } from "next/navigation";

export default function VenueDecisionPage() {
  redirect("/planning/vision?view=brief");
}
