import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { getSiteByToken, rsvpIsOpen } from "@/lib/data/site-store";
import { getWorkspaceMeta } from "@/lib/data/store";
import { getTravel } from "@/lib/data/travel-store";
import { getRegistry } from "@/lib/data/registry-store";
import { getDayOf } from "@/lib/data/dayof-store";
import { listEvents } from "@/lib/data/events-store";
import { slotTitle, slotVisible } from "@/lib/data/run-of-show";
import { formatRange } from "@/lib/data/run-of-show";
import { GuestHero } from "@/components/site/GuestHero";
import { SiteGate } from "@/components/site/SiteGate";
import { Icon } from "@/components/icons";
import { getSessionUser } from "@/lib/auth/session";
import { DEMO_WORKSPACE, getWorkspaceDecisions, getWorkspaceGuests } from "@/lib/data/workspace";
import { siteModeFor } from "@/lib/shape";
import { normalizeVision, siteTemplateFor, visionAccent, visionHero } from "@/lib/vision";

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
  if (!site) notFound();
  if (!site.published) {
    const session = await getSessionUser();
    if (!session) notFound();
  }
  if (site.gate) {
    const jar = await cookies();
    if (jar.get(`wos_gate_${token}`)?.value !== "ok") {
      return <SiteGate token={token} />;
    }
  }
  const meta = await getWorkspaceMeta(site.workspaceId, DEMO_WORKSPACE.name);
  const decisions = await getWorkspaceDecisions(site.workspaceId);
  const vision = normalizeVision(decisions.find((d) => d.type === "STYLE_VIBE")?.payload);
  const look = site.template !== "letter" ? site.template : siteTemplateFor(vision.story);
  const cover = visionHero(vision);
  const accent = visionAccent(vision);
  const dress = site.dressCode || vision.formal || meta.formality;
  const travel = site.showTravel ? await getTravel(site.workspaceId) : null;
  const registry = site.showRegistry ? await getRegistry(site.workspaceId) : null;
  const dayOf = await getDayOf(site.workspaceId);
  const extraEvents = (await listEvents(site.workspaceId)).filter(
    (e) => e.type !== "Wedding day" && (e.date || e.location)
  );
  const guests = await getWorkspaceGuests(site.workspaceId);
  const seated = guests.some((g) => Boolean(g.tableLabel));
  const guestSlots = (dayOf.schedule || []).filter((s) => slotVisible(s, "guests"));
  const names = meta.coupleNames || meta.name;
  const date = prettyDate(meta.weddingDate);
  const open = rsvpIsOpen(site);
  const announce = meta.siteMode === "announce" || siteModeFor(meta.shape) === "announce";
  const gallery = site.gallery || [];
  const night = look === "midnight";
  const garden = look === "garden";

  return (
    <div
      className={`min-h-screen ${night ? "bg-[#141311] text-[#f3efe6]" : "bg-paper text-ink"}`}
      data-theme={meta.theme || "linen"}
      style={accent ? { ["--color-moss" as string]: accent, ["--color-moss-fg" as string]: "#f6f1e8" } : undefined}
    >
      <GuestHero
        names={names}
        date={date}
        location={meta.location}
        coverUrl={cover || undefined}
        mode={announce ? "announce" : "invite"}
        night={night}
        vibe={vision.vibe}
        formal={vision.formal}
        palette={vision.palette?.hex}
      >
        <div className="flex flex-col items-center gap-3">
          {open && !announce && (
            <Link
              href={`/w/${token}/rsvp`}
              className="inline-flex min-h-11 items-center rounded-full bg-moss px-7 text-sm font-medium text-moss-fg"
            >
              RSVP
            </Link>
          )}
          {!open && !announce && (
            <p className="text-sm text-muted">
              RSVP is closed{site.rsvpClose ? ` (was ${site.rsvpClose})` : ""}.
            </p>
          )}
          {site.rsvpNote && open && !announce ? (
            <p className="text-xs text-muted">{site.rsvpNote}</p>
          ) : null}
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
            {seated ? (
              <Link href={`/w/${token}/table`} className="min-h-11 inline-flex items-center text-moss underline">
                Find your table
              </Link>
            ) : null}
            {date ? (
              <a href={`/c/${token}`} className="min-h-11 inline-flex items-center text-moss underline">
                Add to calendar
              </a>
            ) : null}
          </div>
        </div>
      </GuestHero>
      <main className={`mx-auto max-w-xl px-5 py-10 sm:py-12 ${garden ? "max-w-2xl" : ""}`}>

        {site.headline && (
          <p className="mt-8 text-center text-base text-ink-soft">{site.headline}</p>
        )}
        {site.story && (
          <p className="mt-6 whitespace-pre-wrap text-sm leading-6 text-ink-soft">{site.story}</p>
        )}

        {gallery.length > 0 && (
          <div className={`mt-10 grid gap-2 ${gallery.length > 1 ? "grid-cols-2" : ""}`}>
            {gallery.map((src) => (
              <img key={src} src={src} alt="" className="aspect-[4/5] w-full rounded-2xl object-cover" />
            ))}
          </div>
        )}

        {announce && !site.headline?.trim() && (
          <p className="mt-10 text-center font-serif text-3xl leading-snug">We got married.</p>
        )}

        {site.scheduleNote && (
          <section className="mt-12">
            <h2 className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted">
              <Icon name="sun" className="h-3.5 w-3.5" /> Day of
            </h2>
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
            <h2 className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted">
              <Icon name="sun" className="h-3.5 w-3.5" /> Day of
            </h2>
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
            <h2 className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted">
              <Icon name="calendar" className="h-3.5 w-3.5" /> Also this weekend
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

        {dress && (
          <section className="mt-8">
            <h2 className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted">
              <Icon name="shirt" className="h-3.5 w-3.5" /> What to wear
            </h2>
            <p className="mt-2 whitespace-pre-wrap text-sm text-ink-soft">{dress}</p>
          </section>
        )}
        {(meta.unplugged || meta.kidsWelcome === false) && (
          <section className="mt-8 grid gap-2 text-sm text-ink-soft">
            {meta.unplugged && <p>Unplugged ceremony — phones down, photographer’s got it.</p>}
            {meta.kidsWelcome === false && <p>Adults-only reception.</p>}
          </section>
        )}

        {travel && (travel.hotels.length > 0 || travel.airport || travel.shuttle) && (
          <section className="mt-8">
            <h2 className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted">
              <Icon name="plane" className="h-3.5 w-3.5" /> Travel
            </h2>
            {travel.airport && <p className="mt-2 text-sm">{travel.airport}</p>}
            {travel.shuttle && <p className="mt-1 text-sm">{travel.shuttle}</p>}
            {travel.parking && <p className="mt-1 text-sm">{travel.parking}</p>}
            <ul className="mt-3 space-y-2">
              {travel.hotels.map((h) => (
                <li key={h.name} className="rounded-xl border border-line bg-surface px-4 py-3 text-sm">
                  <p className="font-medium">{h.name}</p>
                  {h.address && <p className="text-ink-soft">{h.address}</p>}
                  <p className="text-xs text-muted">
                    {[h.rate, h.blockCode ? `code ${h.blockCode}` : "", h.cutoff ? `book by ${h.cutoff}` : ""]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  {h.bookingUrl && (
                    <a
                      href={h.bookingUrl}
                      className="btn btn-primary mt-3 inline-flex min-h-11"
                      target="_blank"
                      rel="noreferrer"
                    >
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
            <h2 className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted">
              <Icon name="gift" className="h-3.5 w-3.5" /> Registry
            </h2>
            <ul className="mt-3 space-y-2 text-sm">
              {registry.links.map((l) => (
                <li key={l.url}>
                  <a
                    href={l.url}
                    className="inline-flex min-h-11 items-center underline"
                    target="_blank"
                    rel="noreferrer"
                  >
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
