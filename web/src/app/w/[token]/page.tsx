import Link from "next/link";
import { notFound } from "next/navigation";
import { getSiteByToken } from "@/lib/data/site-store";
import { getWorkspaceMeta } from "@/lib/data/store";
import { getTravel } from "@/lib/data/travel-store";
import { getRegistry } from "@/lib/data/registry-store";
import { getDayOf } from "@/lib/data/dayof-store";
import { listEvents } from "@/lib/data/events-store";
import { slotTitle, slotVisible } from "@/lib/data/run-of-show";
import { formatRange } from "@/lib/data/run-of-show";
import { GuestHero } from "@/components/site/GuestHero";
import { DEMO_WORKSPACE } from "@/lib/data/workspace";

function prettyDate(iso?: string) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default async function WeddingSitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const site = await getSiteByToken(token);
  if (!site || !site.published) notFound();
  const meta = await getWorkspaceMeta(site.workspaceId, DEMO_WORKSPACE.name);
  const travel = site.showTravel ? await getTravel(site.workspaceId) : null;
  const registry = site.showRegistry ? await getRegistry(site.workspaceId) : null;
  const dayOf = await getDayOf(site.workspaceId);
  const extraEvents = (await listEvents(site.workspaceId)).filter(
    (e) => e.type !== "Wedding day" && (e.date || e.location)
  );
  const guestSlots = (dayOf.schedule || []).filter((s) => slotVisible(s, "guests"));
  const names = meta.coupleNames || meta.name;
  const date = prettyDate(meta.weddingDate);

  return (
    <div className="min-h-screen bg-paper text-ink">
      <GuestHero names={names} date={date} location={meta.location} />
      <main className="mx-auto max-w-xl px-5 py-10 sm:py-12">

        {site.headline && (
          <p className="mt-8 text-center text-base text-ink-soft">{site.headline}</p>
        )}
        {site.story && (
          <p className="mt-6 whitespace-pre-wrap text-sm leading-6 text-ink-soft">{site.story}</p>
        )}

        {site.rsvpOpen && (
          <div className="mt-10 text-center">
            <Link
              href={`/w/${token}/rsvp`}
              className="inline-block rounded-full bg-moss px-7 py-2.5 text-sm font-medium text-moss-fg"
            >
              RSVP
            </Link>
            {site.rsvpNote && (
              <p className="mt-3 text-xs text-muted">{site.rsvpNote}</p>
            )}
          </div>
        )}

        {site.scheduleNote && (
          <section className="mt-12">
            <h2 className="text-xs font-medium uppercase tracking-wide text-muted">Day of</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-ink-soft">
              {site.scheduleNote}
            </p>
            {guestSlots.length > 0 && (
              <ol className="mt-4 space-y-2">
                {guestSlots.map((s) => (
                  <li key={s.id} className="flex gap-3 text-sm">
                    <span className="w-20 font-medium tabular-nums">{formatRange(s.time, s.endTime)}</span>
                    <span>
                      {slotTitle(s, "guests")}
                      {s.location ? <span className="text-muted"> · {s.location}</span> : null}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </section>
        )}
        {!site.scheduleNote && guestSlots.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xs font-medium uppercase tracking-wide text-muted">Day of</h2>
            <ol className="mt-4 space-y-2">
              {guestSlots.map((s) => (
                <li key={s.id} className="flex gap-3 text-sm">
                  <span className="w-14 font-medium tabular-nums">{s.time}</span>
                  <span>{s.title}</span>
                </li>
              ))}
            </ol>
          </section>
        )}

        {extraEvents.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xs font-medium uppercase tracking-wide text-muted">
              Also this weekend
            </h2>
            <ul className="mt-3 space-y-2">
              {extraEvents.map((ev) => (
                <li key={ev.id} className="rounded-xl border border-line bg-surface px-4 py-3 text-sm">
                  <p className="font-medium">{ev.name}</p>
                  <p className="text-xs text-muted">
                    {[ev.date, ev.location].filter(Boolean).join(" · ")}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {site.dressCode && (
          <section className="mt-8">
            <h2 className="text-xs font-medium uppercase tracking-wide text-muted">
              What to wear
            </h2>
            <p className="mt-2 whitespace-pre-wrap text-sm text-ink-soft">{site.dressCode}</p>
          </section>
        )}

        {travel && (travel.hotels.length > 0 || travel.airport || travel.shuttle) && (
          <section className="mt-8">
            <h2 className="text-xs font-medium uppercase tracking-wide text-muted">Travel</h2>
            {travel.airport && <p className="mt-2 text-sm">{travel.airport}</p>}
            {travel.shuttle && <p className="mt-1 text-sm">{travel.shuttle}</p>}
            {travel.parking && <p className="mt-1 text-sm">{travel.parking}</p>}
            <ul className="mt-3 space-y-2">
              {travel.hotels.map((h) => (
                <li key={h.name} className="rounded-xl border border-line bg-surface px-4 py-3 text-sm">
                  <p className="font-medium">{h.name}</p>
                  {h.address && <p className="text-ink-soft">{h.address}</p>}
                  <p className="text-xs text-muted">
                    {[h.rate, h.blockCode ? `code ${h.blockCode}` : "", h.cutoff ? `by ${h.cutoff}` : ""]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  {h.bookingUrl && (
                    <a href={h.bookingUrl} className="text-xs underline" target="_blank" rel="noreferrer">
                      Book
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        {registry && registry.links.length > 0 && (
          <section className="mt-8">
            <h2 className="text-xs font-medium uppercase tracking-wide text-muted">Registry</h2>
            <ul className="mt-3 space-y-1 text-sm">
              {registry.links.map((l) => (
                <li key={l.url}>
                  <a href={l.url} className="underline" target="_blank" rel="noreferrer">
                    {l.store}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        {site.extra && (
          <p className="mt-8 whitespace-pre-wrap text-sm text-ink-soft">{site.extra}</p>
        )}
      </main>
    </div>
  );
}
