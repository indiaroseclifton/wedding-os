import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";

export default async function HomePage() {
  const session = await getSessionUser();
  if (session) redirect("/dashboard");
  redirect("/login");
}
