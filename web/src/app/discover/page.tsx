import Link from "next/link";
import { getSessionUser } from "@/lib/auth/session";
import { MarketingNav } from "@/components/landing/MarketingNav";
import { DIRECTORY, DIRECTORY_CATEGORIES } from "@/lib/data/vendor-directory";
import { DiscoverNear } from "@/components/discover/DiscoverNear";

const PHOTOS: Record<string, string> = {
  Venue: "/brand/garden.jpg",
  Photographer: "/brand/setting.jpg",
  Florist: "/brand/flowers.jpg",
  Catering: "/brand/tablescape.jpg",
  "DJ / Band": "/brand/candles.jpg",
};

export default async function DiscoverPage() {
  const session = await getSessionUser();
  return (
    <div className="min-h-screen bg-paper text-ink">
      <div className="relative h-72 overflow-hidden">
        <img src="/brand/flowers.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-black/45" />
        <MarketingNav signedIn={Boolean(session)} />
        <div className="relative mx-auto flex h-full max-w-6xl items-end px-5 pb-10 sm:px-10">
          <div className="text-ivory">
            <p className="text-[11px] uppercase tracking-[0.28em] text-champagne">Discover</p>
            <h1 className="mt-2 font-serif text-5xl">Vendors and rooms, before you commit.</h1>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl space-y-12 px-5 py-12 sm:px-10">
        <DiscoverNear />
        <section>
          <div className="flex items-end justify-between">
            <h2 className="font-serif text-3xl">Vendor categories</h2>
            <Link href="/discover/vendors" className="text-sm underline">
              Browse all
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {DIRECTORY_CATEGORIES.map((c) => (
              <Link
                key={c}
                href={`/discover/vendors?category=${encodeURIComponent(c)}`}
                className="overflow-hidden rounded-2xl border border-line bg-surface"
              >
                <img src={PHOTOS[c] || "/brand/tablescape.jpg"} alt="" className="h-20 w-full object-cover" />
                <p className="px-3 py-2 text-sm font-medium">{c}</p>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-serif text-3xl">Featured</h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {DIRECTORY.slice(0, 6).map((v) => (
              <li key={v.slug} className="rounded-2xl border border-line bg-surface p-5">
                <p className="kicker">{v.category}</p>
                <p className="mt-1 font-serif text-2xl">{v.name}</p>
                <p className="mt-2 text-sm text-ink-soft">{v.blurb}</p>
                <p className="mt-2 text-xs text-muted">
                  {v.city} · from {v.startingFrom}
                </p>
                <Link href={`/discover/vendors/${v.slug}`} className="mt-3 inline-block text-xs underline">
                  View
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
