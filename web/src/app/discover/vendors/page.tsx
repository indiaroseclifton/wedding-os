import Link from "next/link";
import { getSessionUser } from "@/lib/auth/session";
import { MarketingNav } from "@/components/landing/MarketingNav";
import { DIRECTORY, DIRECTORY_CATEGORIES } from "@/lib/data/vendor-directory";

export default async function DiscoverVendorsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const session = await getSessionUser();
  const { category } = await searchParams;
  const rows = category ? DIRECTORY.filter((v) => v.category === category) : DIRECTORY;

  return (
    <div className="min-h-screen bg-paper text-ink">
      <div className="relative pb-8 pt-24">
        <MarketingNav signedIn={Boolean(session)} tone="light" />
        <div className="mx-auto max-w-6xl px-5 sm:px-10">
          <p className="text-[11px] uppercase tracking-[0.28em] text-moss">Marketplace</p>
          <h1 className="mt-2 font-serif text-5xl">Find vendors</h1>
          <p className="mt-2 max-w-xl text-sm text-muted">
            Demo listings for Atlanta — real search lives on your desk once you sign in (Google Places).
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              href="/discover/vendors"
              className={`rounded-full px-3 py-1.5 text-xs ${!category ? "bg-moss text-ivory" : "border border-line"}`}
            >
              All
            </Link>
            {DIRECTORY_CATEGORIES.map((c) => (
              <Link
                key={c}
                href={`/discover/vendors?category=${encodeURIComponent(c)}`}
                className={`rounded-full px-3 py-1.5 text-xs ${
                  category === c ? "bg-moss text-ivory" : "border border-line"
                }`}
              >
                {c}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <ul className="mx-auto grid max-w-6xl gap-3 px-5 pb-16 sm:grid-cols-2 sm:px-10 lg:grid-cols-3">
        {rows.map((v) => (
          <li key={v.slug} className="rounded-2xl border border-line bg-surface p-5">
            <p className="text-[11px] text-muted">
              {v.category} · {v.city} · {v.priceBand}
            </p>
            <p className="mt-1 font-serif text-2xl">{v.name}</p>
            <p className="mt-2 text-sm text-ink-soft">{v.blurb}</p>
            <p className="mt-2 text-xs text-muted">from {v.startingFrom}</p>
            <div className="mt-4 flex gap-3">
              <Link href={`/discover/vendors/${v.slug}`} className="text-xs font-medium underline">
                Profile
              </Link>
              <Link href={session ? `/vendors/browse/${v.slug}` : "/login"} className="text-xs underline">
                {session ? "Add to my team" : "Sign in to hire"}
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
