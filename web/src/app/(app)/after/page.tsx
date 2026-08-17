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
  const live = desk.daysAgo != null && desk.daysAgo >= 0;

  const clock =
    desk.daysAgo == null
      ? "Set the date"
      : waiting
        ? `${-desk.daysAgo}`
        : `${desk.daysAgo}`;
  const clockLabel =
    desk.daysAgo == null
      ? "and this clock starts when the day ends."
      : waiting
        ? "days until the day. This room waits."
        : late
          ? "days ago. The three months are up."
          : "of 90";

  return (
    <div className="space-y-10">
      <RoomSubnav room="planning" />

      <header className="max-w-2xl">
        <p className="kicker kicker-moss">After</p>
        <h1 className="mt-3 font-serif text-[clamp(2.6rem,8vw,4.4rem)] leading-none tracking-tight text-balance">
          <span className="tabular-nums">{clock}</span>
          <span className="mt-2 block text-xl font-normal text-ink-soft sm:text-2xl">{clockLabel}</span>
        </h1>
        <p className="deck mt-4 max-w-xl text-pretty">{desk.pace}</p>
      </header>

      {live && (
        <div>
          <div className="h-1 overflow-hidden rounded-full bg-line">
            <div
              className={`h-full ${late ? "bg-clay" : "bg-moss"}`}
              style={{ width: `${desk.pct}%` }}
            />
          </div>
          <p className="mt-2 text-xs tabular-nums text-muted">
            {desk.sent.length} sent · {desk.open.length} left
            {desk.daysLeft != null && desk.daysLeft > 0 ? ` · ${desk.daysLeft} days on the clock` : ""}
          </p>
        </div>
      )}

      <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_17rem]">
        <section className="min-w-0">
          {desk.current && live ? (
            <p className="mb-4 text-sm text-ink-soft text-pretty">
              <span className="kicker kicker-moss mr-2">{desk.current.when}</span>
              {desk.current.title}. {desk.current.detail}
            </p>
          ) : null}
          <AfterDesk
            names={desk.names}
            nextWrite={desk.nextWrite}
            seedable={desk.seedable.length}
            missing={desk.missing.length}
          />
        </section>

        <aside className="space-y-6 lg:sticky lg:top-20">
          <div className="grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-line bg-line">
            <Link href="/thanks" className="bg-surface px-3 py-4 text-center">
              <p className="font-serif text-2xl tabular-nums">{desk.open.length}</p>
              <p className="mt-1 text-[11px] uppercase tracking-wide text-muted">to write</p>
            </Link>
            <Link href="/thanks#team" className="bg-surface px-3 py-4 text-center">
              <p className="font-serif text-2xl tabular-nums">{desk.unmarked.length}</p>
              <p className="mt-1 text-[11px] uppercase tracking-wide text-muted">unmarked</p>
            </Link>
            <Link href="/guests/chase" className="bg-surface px-3 py-4 text-center">
              <p className="font-serif text-2xl tabular-nums">{desk.noShow.length}</p>
              <p className="mt-1 text-[11px] uppercase tracking-wide text-muted">no-show</p>
            </Link>
          </div>

          <ol className="space-y-1">
            {desk.beats.map((b) => (
              <li key={b.id}>
                <Link
                  href={b.href}
                  className={`block rounded-2xl px-4 py-3 transition-colors duration-150 ${
                    b.state === "now"
                      ? "bg-moss-soft"
                      : b.state === "done"
                        ? "opacity-50"
                        : "hover:bg-surface"
                  }`}
                >
                  <p className="text-[11px] uppercase tracking-wide text-muted">
                    {b.when}
                    {b.state === "now" ? " · now" : b.state === "done" ? " · done" : ""}
                  </p>
                  <p className="mt-0.5 font-serif text-xl leading-tight text-balance">{b.title}</p>
                </Link>
              </li>
            ))}
          </ol>

          <Link href="/thanks" className="text-xs text-moss underline">
            Full thank-you list
          </Link>
        </aside>
      </div>
    </div>
  );
}
