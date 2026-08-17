import Link from "next/link";
import { RoomSubnav } from "@/components/layout/RoomSubnav";
import { ensureDemoWorkspace, getWorkspaceGuests } from "@/lib/data/workspace";
import { listVendors } from "@/lib/data/vendors-store";
import { getThanks } from "@/lib/data/thanks-store";
import { AFTER_BEATS, afterPhase } from "@/lib/after-arc";

export default async function AfterPage() {
  const { workspace, meta } = await ensureDemoWorkspace();
  const [guests, vendors, thanks] = await Promise.all([
    getWorkspaceGuests(workspace.id),
    listVendors(workspace.id),
    getThanks(workspace.id),
  ]);
  const { daysAgo, current } = afterPhase(meta.weddingDate);
  const cardsOpen = (thanks.items || []).filter((i) => i.status !== "SENT").length;
  const unmarked = vendors.filter((v) => !v.gutMark).length;
  const noShow = guests.filter((g) => g.rsvp === "YES" && g.showed === false).length;

  return (
    <div className="space-y-8">
      <RoomSubnav room="planning" />
      <div>
        <p className="kicker kicker-moss">After</p>
        <h1 className="headline mt-2">The three months</h1>
        <p className="deck mt-2 max-w-xl">
          {daysAgo == null
            ? "Set the date and this clock starts when the day ends."
            : daysAgo < 0
              ? `${-daysAgo} days until the day. This room waits.`
              : `${daysAgo} days since. Industry practice: thank-yous within 90.`}
        </p>
      </div>

      {current && daysAgo != null && daysAgo >= 0 ? (
        <article className="panel p-6">
          <p className="kicker">{current.when}</p>
          <h2 className="mt-2 font-serif text-3xl">{current.title}</h2>
          <p className="mt-2 text-sm text-muted">{current.detail}</p>
          <Link href={current.href} className="btn btn-primary mt-4 inline-flex min-h-11">
            Open
          </Link>
        </article>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-3">
        <Link href="/thanks" className="panel p-4">
          <p className="kicker">Cards</p>
          <p className="mt-1 font-serif text-3xl">{cardsOpen}</p>
          <p className="mt-1 text-xs text-muted">still to write</p>
        </Link>
        <Link href="/thanks#team" className="panel p-4">
          <p className="kicker">Team unmarked</p>
          <p className="mt-1 font-serif text-3xl">{unmarked}</p>
          <p className="mt-1 text-xs text-muted">Yes / Maybe / No</p>
        </Link>
        <Link href="/guests/chase" className="panel p-4">
          <p className="kicker">No-shows</p>
          <p className="mt-1 font-serif text-3xl">{noShow}</p>
          <p className="mt-1 text-xs text-muted">said yes, didn’t come</p>
        </Link>
      </div>

      <ol className="space-y-3">
        {AFTER_BEATS.map((b) => (
          <li key={b.id} className="rounded-[1.3rem] border border-line bg-surface px-5 py-4">
            <p className="text-xs text-muted">{b.when}</p>
            <p className="mt-1 font-serif text-2xl">{b.title}</p>
            <p className="mt-1 text-sm text-muted">{b.detail}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
