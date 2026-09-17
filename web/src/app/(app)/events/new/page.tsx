import { redirect } from "next/navigation";

export default function NewEventPage() {
  redirect("/intake?new=1");
}
