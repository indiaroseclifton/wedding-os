import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { ensureDemoWorkspace } from "@/lib/data/workspace";
import { getTravel } from "@/lib/data/travel-store";

export default async function PartyStayPage() {
  const session = await getSessionUser();
  if (!session) redirect("/login");
  const { workspace } = await ensureDemoWorkspace();
  const travel = await getTravel(workspace.id);

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <p className="kicker kicker-moss">Wedding party</p>
      <h1 className="mt-1 font-serif text-4xl">Where you stay</h1>
      <p className="mt-1 text-sm text-muted">The couple’s hotel block and how to get there.</p>

      {travel.hotels.length === 0 ? (
        <p className="mt-8 text-sm text-muted">No hotel block yet. Ask the couple to add one under Travel.</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {travel.hotels.map((h) => (
            <li key={h.id} className="rounded-2xl border border-line bg-surface p-4">
              <p className="font-serif text-2xl">{h.name}</p>
              <p className="text-xs text-muted">
                {[h.address, h.rate, h.kind].filter(Boolean).join(" · ")}
              </p>
              {h.blockCode && <p className="mt-2 text-sm">Code {h.blockCode}</p>}
              {h.cutoff && <p className="text-xs text-muted">Book by {h.cutoff}</p>}
              {h.bookingUrl && (
                <a href={h.bookingUrl} className="mt-2 inline-block text-sm underline" target="_blank" rel="noreferrer">
                  Book this block
                </a>
              )}
              {h.notes && <p className="mt-2 text-sm text-ink-soft">{h.notes}</p>}
            </li>
          ))}
        </ul>
      )}

      <dl className="mt-8 space-y-2 text-sm">
        {travel.airport && (
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted">Airport</dt>
            <dd>{travel.airport}</dd>
          </div>
        )}
        {travel.shuttle && (
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted">Shuttle</dt>
            <dd>{travel.shuttle}</dd>
          </div>
        )}
        {travel.parking && (
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted">Parking</dt>
            <dd>{travel.parking}</dd>
          </div>
        )}
      </dl>
    </div>
  );
}
