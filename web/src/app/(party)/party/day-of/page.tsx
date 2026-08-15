import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { ensureDemoWorkspace } from "@/lib/data/workspace";
import { getDayOf } from "@/lib/data/dayof-store";
import { DayOfPartyClient } from "./DayOfPartyClient";

export default async function PartyDayOfPage() {
  const session = await getSessionUser();
  if (!session) redirect("/login");
  const { workspace } = await ensureDemoWorkspace();
  const dayOf = await getDayOf(workspace.id);

  return (
    <div className="mx-auto max-w-lg space-y-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Day-of</h1>
        <Link href="/party" className="text-xs underline">
          Portal home
        </Link>
      </div>
      <DayOfPartyClient initial={dayOf} />
    </div>
  );
}
