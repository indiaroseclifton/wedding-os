import Link from "next/link";
import { RoomSubnav } from "@/components/layout/RoomSubnav";
import { AfterDesk } from "@/components/after/AfterDesk";
import { AfterGiftRules } from "@/components/v2/AfterGiftRules";
import { ensureDemoWorkspace, getWorkspaceGuests } from "@/lib/data/workspace";
import { listVendors } from "@/lib/data/vendors-store";
import { getThanks } from "@/lib/data/thanks-store";
import { getLegal } from "@/lib/data/legal-store";
import { getInventory } from "@/lib/data/inventory-store";
import { buildAfterDesk } from "@/lib/after-desk";

export default async function AfterPage() {
  const { workspace, meta } = await ensureDemoWorkspace();
  const [guests, vendors, thanks, legal, inventory] = await Promise.all([
    getWorkspaceGuests(workspace.id),
    listVendors(workspace.id),
    getThanks(workspace.id),
    getLegal(workspace.id),
    getInventory(workspace.id),
  ]);
  const desk = buildAfterDesk({
    weddingDate: meta.weddingDate,
    guests,
    vendors,
    items: thanks.items || [],
    names: meta.coupleNames || meta.name,
    namePath: legal.namePath,
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
      <RoomSubnav room="after" />

      <header className="max-w-2xl">
        <p className="kicker kicker-moss">After</p>
        <h1 className="mt-3 font-serif text-[clamp(2.6rem,8vw,4.4rem)] leading-none tracking-tight text-balance">
          <span className="tabular-nums">{clock}</span>
          <span className="mt-2 block text-xl font-normal text-ink-soft sm:text-2xl">{clockLabel}</span>
        </h1>
        <p className="deck mt-4 max-w-xl text-pretty">{desk.pace}</p>
      </header>

      <AfterGiftRules />

      {waiting ? (
        <section className="rounded-[1.6rem] border border-line bg-surface p-6 sm:p-8">
          <p className="kicker kicker-moss">Preview only</p>
          <h2 className="mt-3 max-w-2xl font-serif text-3xl sm:text-4xl">This room opens after the wedding.</h2>
          <p className="mt-3 max-w-2xl text-sm text-ink-soft">
            Nothing here counts as overdue yet. When the day is done, Vowfolk will activate returns, thank-yous, rental handbacks and reviews using the records you already have.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              ["Returns", "Rentals, borrowed pieces and Studio boxes."],
              ["Thank-yous", "Guests, gifts and missing addresses."],
              ["Reviews", "Your vendor team and private notes."],
            ].map(([title, detail]) => (
              <div key={title} className="rounded-2xl bg-paper p-5">
                <p className="font-serif text-2xl">{title}</p>
                <p className="mt-2 text-sm text-muted">{detail}</p>
              </div>
            ))}
          </div>
          <Link href="/dashboard" className="mt-6 inline-flex min-h-11 items-center rounded-full bg-ink px-5 text-sm text-ivory">Back to the control room</Link>
        </section>
      ) : null}

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

      {live ? <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_17rem]">
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

          <Link href="/studio/inventory" className="block text-xs text-moss underline">
            {inventory.boxes.length
              ? `${inventory.boxes.length} boxes · keep, sell, donate`
              : "What we made — pack the boxes"}
          </Link>
        </aside>
      </div> : null}

      {live ? (
        <div className="grid gap-4 border-t border-line pt-8 md:grid-cols-2">
          <section id="returns" className="rounded-2xl border border-line bg-surface p-5">
            <p className="kicker">Returns</p>
            <h2 className="mt-2 font-serif text-3xl">Boxes, rentals and borrowed things</h2>
            <p className="mt-2 text-sm text-muted">Use the Studio inventory as the handback list—keep, return, sell or donate.</p>
            <Link href="/studio/inventory" className="mt-4 inline-block text-sm font-medium underline underline-offset-4">Open inventory</Link>
          </section>
          <section id="reviews" className="rounded-2xl border border-line bg-surface p-5">
            <p className="kicker">Reviews</p>
            <h2 className="mt-2 font-serif text-3xl">Close the loop with your team</h2>
            <p className="mt-2 text-sm text-muted">Review vendor records after final payments and private notes are complete.</p>
            <Link href="/vendors" className="mt-4 inline-block text-sm font-medium underline underline-offset-4">Open vendor team</Link>
          </section>
        </div>
      ) : null}
    </div>
  );
}
