import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { ensureDemoWorkspace } from "@/lib/data/workspace";
import { getAttire } from "@/lib/data/attire-store";
import { PartyMyAttire } from "../PartyMyAttire";

export default async function PartyAttirePage() {
  const session = await getSessionUser();
  if (!session) redirect("/login");
  const { workspace } = await ensureDemoWorkspace();
  const attire = await getAttire(workspace.id);
  const mine = attire.members.find((m) => m.name.toLowerCase() === session.name.toLowerCase());
  const others = attire.members.filter((m) => m.id !== mine?.id);

  return (
    <div className="mx-auto max-w-lg space-y-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl">Attire</h1>
        <Link href="/party" className="text-xs underline">
          Portal home
        </Link>
      </div>
      <PartyMyAttire mine={mine} others={others} palette={attire.paletteNotes} />
    </div>
  );
}
