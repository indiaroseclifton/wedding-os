import Link from "next/link";
import { RoomSubnav } from "@/components/layout/RoomSubnav";
import { ensureDemoWorkspace, getWorkspaceGuests } from "@/lib/data/workspace";
import { hasMailingAddress, isPendingRsvp } from "@/lib/data/guest-mail";
import { ChaseList } from "./ChaseList";

export default async function ChasePage() {
  const { workspace, meta } = await ensureDemoWorkspace();
  const guests = await getWorkspaceGuests(workspace.id);
  const waiting = guests.filter((g) => isPendingRsvp(g.rsvp) || g.rsvp === "MAYBE");
  const incomplete = guests.filter(
    (g) => g.rsvp === "YES" && (!hasMailingAddress(g) || !g.meal)
  );
  const silent = guests.filter((g) => g.rsvp === "YES" && !g.rsvpAt);
  const noPlus = guests.filter((g) => g.plusPolicy === "none");
  const after = meta.weddingDate ? new Date(`${meta.weddingDate}T00:00:00`) < new Date() : false;

  return (
    <div className="space-y-6">
      <RoomSubnav room="guests" />
      <div>
        <p className="kicker kicker-moss">The chase</p>
        <h1 className="headline mt-2">Who actually answered</h1>
        <p className="deck mt-2 max-w-xl">
          Waiting, incomplete yes, and — after the day — who showed up. A click is not a seat.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <p className="panel p-4">
          <span className="kicker">Waiting</span>
          <span className="mt-1 block font-serif text-3xl">{waiting.length}</span>
        </p>
        <p className="panel p-4">
          <span className="kicker">Yes, incomplete</span>
          <span className="mt-1 block font-serif text-3xl">{incomplete.length}</span>
        </p>
        <p className="panel p-4">
          <span className="kicker">No plus-one</span>
          <span className="mt-1 block font-serif text-3xl">{noPlus.length}</span>
        </p>
      </div>
      <ChaseList
        after={after}
        guests={guests.map((g) => ({
          id: g.id,
          name: g.name,
          rsvp: g.rsvp,
          email: g.email,
          meal: g.meal,
          plusPolicy: g.plusPolicy,
          showed: g.showed,
          missingAddress: !hasMailingAddress(g),
          silentYes: g.rsvp === "YES" && !g.rsvpAt,
        }))}
      />
      <p className="text-sm text-muted">
        {silent.length} yes without a timestamp — treat them as a maybe until they reply again.{" "}
        <Link href="/guests" className="underline">
          Full list
        </Link>
      </p>
    </div>
  );
}
