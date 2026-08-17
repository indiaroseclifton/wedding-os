import Link from "next/link";
import { RoomSubnav } from "@/components/layout/RoomSubnav";
import { AfterDesk } from "@/components/after/AfterDesk";
import { ensureDemoWorkspace, getWorkspaceGuests } from "@/lib/data/workspace";
import { listVendors } from "@/lib/data/vendors-store";
import { getThanks } from "@/lib/data/thanks-store";
import { buildAfterDesk } from "@/lib/after-desk";

export default async function AfterPage() {
  const { workspace, meta } = await ensureDemoWorkspace();
  const [guests, vendors, thanks] = await Promise.all([
    getWorkspaceGuests(workspace.id),
    listVendors(workspace.id),
    getThanks(workspace.id),
  ]);
  const desk = buildAfterDesk({
    weddingDate: meta.weddingDate,
    guests,
    vendors,
    items: thanks.items || [],
    names: meta.coupleNames || meta.name,
  });
  const waiting = desk.daysAgo != null && desk.daysAgo < 0;
  const late = desk.daysLeft != null && desk.daysLeft <= 0 && desk.open.length > 0;

  return (
    <div className="space-y-8">
      <RoomSubnav room="planning" />

      <div>
        <p className="kicker kicker-moss">After</p>
        <h1 className="headline mt-2">The three months</h1>
        <p className="deck mt-2 max-w-xl">
          {desk.daysAgo == null
            ? "Set the date and this clock starts when the day ends."
            : waiting
              ? `${-desk.daysAgo} days until the day. This room waits — then it walks week 2, week 8, day 90.`
              : late
                ? `Day ${desk.daysAgo}. The three months are up. ${desk.pace}`
                : `Day ${desk.daysAgo} of 90. ${desk.pace}`}
        </p>
      </div>

      {desk.daysAgo != null && desk.daysAgo >= 0 && (
        <div>
          <div className="h-1.5 overflow-hidden rounded-full bg-line">
            <div
              className={`h-full ${late ? "bg-clay" : "bg-moss"}`}
              style={{ width: `${desk.pct}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-muted">
            {desk.sent.length} sent · {desk.open.length} left
            {desk.daysLeft != null && desk.daysLeft > 0 ? ` · ${desk.daysLeft} days on the clock` : ""}
          </p>
        </div>
      )}

      {desk.current && desk.daysAgo != null && desk.daysAgo >= 0 ? (
        <article className="panel p-6">
          <p className="kicker">{desk.current.when}</p>
          <h2 className="mt-2 font-serif text-3xl">{desk.current.title}</h2>
          <p className="mt-2 text-sm text-muted">{desk.current.detail}</p>
        </article>
      ) : null}

      <section className="space-y-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="kicker kicker-moss">Tonight’s stack</p>
            <h2 className="mt-1 font-serif text-3xl">Write the next card</h2>
          </div>
          <Link href="/thanks" className="text-xs underline">
            Full list
          </Link>
        </div>
        <AfterDesk
          names={desk.names}
          nextWrite={desk.nextWrite}
          seedable={desk.seedable.length}
          missing={desk.missing.length}
        />
      </section>

      <div className="grid gap-3 sm:grid-cols-3">
        <Link href="/thanks" className="panel p-4">
          <p className="kicker">Cards</p>
          <p className="mt-1 font-serif text-3xl">{desk.open.length}</p>
          <p className="mt-1 text-xs text-muted">still to write</p>
        </Link>
        <Link href="/thanks#team" className="panel p-4">
          <p className="kicker">Team unmarked</p>
          <p className="mt-1 font-serif text-3xl">{desk.unmarked.length}</p>
          <p className="mt-1 text-xs text-muted">Yes / Maybe / No</p>
        </Link>
        <Link href="/guests/chase" className="panel p-4">
          <p className="kicker">No-shows</p>
          <p className="mt-1 font-serif text-3xl">{desk.noShow.length}</p>
          <p className="mt-1 text-xs text-muted">said yes, didn’t come</p>
        </Link>
      </div>

      <ol className="space-y-3">
        {desk.beats.map((b) => (
          <li key={b.id}>
            <Link
              href={b.href}
              className={`block rounded-[1.3rem] border px-5 py-4 ${
                b.state === "now"
                  ? "border-moss/40 bg-moss-soft"
                  : b.state === "done"
                    ? "border-line bg-surface/60 opacity-70"
                    : "border-line bg-surface"
              }`}
            >
              <p className="text-xs text-muted">
                {b.when}
                {b.state === "now" ? " · now" : b.state === "done" ? " · done" : ""}
              </p>
              <p className="mt-1 font-serif text-2xl">{b.title}</p>
              <p className="mt-1 text-sm text-muted">{b.detail}</p>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
