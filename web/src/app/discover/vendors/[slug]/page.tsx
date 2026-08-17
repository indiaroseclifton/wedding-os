import Link from "next/link";
import { notFound } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { MarketingNav } from "@/components/landing/MarketingNav";
import { getDirectoryVendor } from "@/lib/data/vendor-directory";

export default async function DiscoverVendorProfile({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const v = getDirectoryVendor(slug);
  if (!v) notFound();
  const session = await getSessionUser();

  return (
    <div className="min-h-screen bg-paper text-ink">
      <div className="relative pt-24">
        <MarketingNav signedIn={Boolean(session)} tone="light" />
        <article className="mx-auto max-w-2xl px-5 pb-20 sm:px-10">
          <p className="kicker">
            {v.category} · {v.city}
          </p>
          <h1 className="mt-2 font-serif text-5xl">{v.name}</h1>
          <p className="mt-3 text-lg text-ink-soft">{v.blurb}</p>
          <p className="mt-6 text-sm leading-7">{v.about}</p>
          <ul className="mt-6 space-y-2 text-sm">
            {v.packages.map((p) => (
              <li key={p.name} className="rounded-xl border border-line bg-surface px-4 py-3">
                <p className="font-medium">
                  {p.name} · {p.from}
                </p>
                <p className="text-xs text-muted">{p.includes}</p>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-muted">
            Good for: {v.goodFor.join(" · ")}
          </p>
          <Link
            href={session ? `/vendors/browse/${v.slug}` : "/login"}
            className="mt-8 inline-block rounded-full bg-moss px-5 py-2.5 text-sm font-medium text-ivory"
          >
            {session ? "Add to my wedding" : "Sign in to inquire"}
          </Link>
        </article>
      </div>
    </div>
  );
}
