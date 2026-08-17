import { RoomSubnav } from "@/components/layout/RoomSubnav";
import { ensureDemoWorkspace } from "@/lib/data/workspace";
import { listVendors } from "@/lib/data/vendors-store";
import { rangeFor } from "@/lib/vendor-ranges";
import { FirstAsk } from "./FirstAsk";
import { isBooked } from "@/lib/send/status";

const STARTERS = [
  "What's the floor for our headcount and date — not a package PDF?",
  "Can you hold the date, and until when?",
  "What is not included that couples forget?",
];

export default async function AskPage() {
  const { workspace, meta } = await ensureDemoWorkspace();
  const vendors = await listVendors(workspace.id);
  const researching = vendors.filter((v) => !isBooked(v.status));

  return (
    <div className="space-y-6">
      <RoomSubnav room="planning" />
      <div>
        <p className="kicker kicker-moss">First letter</p>
        <h1 className="headline mt-2">Ask before the packet</h1>
        <p className="deck mt-2 max-w-xl">
          Three questions they dodge. A clock. If they stay silent, the card says so.
        </p>
      </div>
      {!researching.length ? (
        <p className="text-sm text-muted">Everyone on the team is booked. Packet lives under Send.</p>
      ) : (
        <ul className="space-y-4">
          {researching.map((v) => (
            <li key={v.id} className="panel p-5">
              <p className="font-serif text-2xl">{v.name}</p>
              <p className="text-xs text-muted">
                {v.category} · usually {rangeFor(v.category).low}–{rangeFor(v.category).high}
              </p>
              <p className="mt-1 text-sm text-muted">{rangeFor(v.category).line}</p>
              <FirstAsk
                vendorId={v.id}
                starters={STARTERS}
                asks={v.asks || []}
                quoteLow={v.quoteLow}
                quoteNote={v.quoteNote}
                city={meta.location}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
