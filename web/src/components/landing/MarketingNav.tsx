import Link from "next/link";
import { Wordmark } from "@/components/brand/Wordmark";

export function MarketingNav({
  signedIn,
  tone = "dark",
}: {
  signedIn?: boolean;
  tone?: "dark" | "light";
}) {
  const light = tone === "light";
  return (
    <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-5 py-5 sm:px-10">
      <Wordmark href="/" className={light ? "text-ink" : "text-ivory"} />
      <nav className={`hidden items-center gap-6 text-xs font-medium sm:flex ${light ? "text-ink-soft" : "text-white/70"}`}>
        <Link href="/discover">Discover</Link>
        <Link href="/discover/vendors">Vendors</Link>
        <Link href="/pricing">Pricing</Link>
      </nav>
      <Link
        href={signedIn ? "/dashboard" : "/login"}
        className={
          light
            ? "rounded-full bg-moss px-4 py-2 text-xs font-medium text-ivory"
            : "rounded-full bg-champagne px-4 py-2 text-xs font-medium text-night"
        }
      >
        {signedIn ? "Your desk" : "Sign in"}
      </Link>
    </header>
  );
}
