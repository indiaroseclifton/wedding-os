import { redirect } from "next/navigation";

export default function MoodboardPage() {
  redirect("/planning/vision?view=board");
}
