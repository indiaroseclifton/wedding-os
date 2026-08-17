import Link from "next/link";
import { getSessionUser } from "@/lib/auth/session";
import { MarketingNav } from "@/components/landing/MarketingNav";

const TIERS = [
  {
    name: "Desk",
    price: "Free",
    line: "While we build with you.",
    points: ["Guests, RSVP, seating", "Vendors, contracts, deposits", "DIY studio + checklist", "DJ cue sheet", "One wedding"],
  },
  {
    name: "Studio",
    price: "$29",
    line: "/ month after public launch",
    points: ["Everything in Desk", "Guest site custom domain", "Unlimited handoffs", "Places + music exports", "Priority email"],
  },
  {
    name: "Planner",
    price: "$79",
    line: "/ month · multi-wedding",
    points: ["Everything in Studio", "Multiple couples", "White-label packet", "Team seats", "Coming later"],
  },
];

export default async function PricingPage() {
  const session = await getSessionUser();
  return (
    <div className="min-h-screen bg-paper text-ink">
      <div className="relative pt-24">
        <MarketingNav signedIn={Boolean(session)} tone="light" />
        <div className="mx-auto max-w-5xl px-5 pb-20 sm:px-10">
          <p className="kicker kicker-moss">Pricing</p>
          <h1 className="mt-2 font-serif text-5xl">Simple, on purpose.</h1>
          <p className="mt-3 max-w-lg text-sm text-muted">
            You’re on Desk — free — while we finish discovery. No card.
          </p>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {TIERS.map((t) => (
              <article key={t.name} className="rounded-2xl border border-line bg-surface p-6">
                <p className="text-sm font-medium">{t.name}</p>
                <p className="mt-2 font-serif text-4xl">{t.price}</p>
                <p className="text-xs text-muted">{t.line}</p>
                <ul className="mt-5 space-y-2 text-sm text-ink-soft">
                  {t.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
          <Link
            href={session ? "/dashboard" : "/login"}
            className="mt-10 inline-block rounded-full bg-moss px-5 py-2.5 text-sm font-medium text-ivory"
          >
            {session ? "Back to the desk" : "Start free"}
          </Link>
        </div>
      </div>
    </div>
  );
}
