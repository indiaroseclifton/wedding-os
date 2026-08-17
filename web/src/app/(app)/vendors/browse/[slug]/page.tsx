"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Pkg = { name: string; from: string; includes: string };
type Listing = {
  slug: string;
  name: string;
  category: string;
  city: string;
  metro: string;
  priceBand: string;
  startingFrom: string;
  styles: string[];
  blurb: string;
  about: string;
  packages: Pkg[];
  serviceArea: string;
  leadWeeks: string;
  goodFor: string[];
  notFor: string[];
  afterBook: string;
  diySlug?: string;
  email: string;
};

export default function DirectoryProfilePage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [listing, setListing] = useState<Listing | null>(null);
  const [saved, setSaved] = useState(false);
  const [hired, setHired] = useState(false);
  const [message, setMessage] = useState("");
  const [replyEmail, setReplyEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [history, setHistory] = useState<{ message: string; createdAt: string }[]>([]);
  const [mailNote, setMailNote] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [missing, setMissing] = useState(false);

  async function load() {
    const res = await fetch("/api/directory");
    if (!res.ok) return;
    const data = await res.json();
    const found = (data.listings || []).find((v: Listing) => v.slug === slug);
    if (!found) {
      setMissing(true);
      return;
    }
    setListing(found);
    setSaved((data.shortlist || []).includes(slug));
    setHired((data.hiredSlugs || []).includes(slug));
    setHistory((data.inquiries || []).filter((i: { slug: string }) => i.slug === slug));
    setSent((data.inquiries || []).some((i: { slug: string }) => i.slug === slug));
    if (data.yourEmail && !data.yourEmail.endsWith("@example.com")) {
      setReplyEmail((prev) => prev || data.yourEmail);
    }
  }

  useEffect(() => {
    load();
  }, [slug]);

  async function post(body: Record<string, unknown>) {
    setBusy(true);
    try {
      const res = await fetch("/api/directory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) return;
      const data = await res.json();
      if (body.action === "shortlist") setSaved((data.shortlist || []).includes(slug));
      if (body.action === "inquire") {
        setSent(true);
        if (Array.isArray(data.inquiries)) {
          setHistory(data.inquiries.filter((i: { slug: string }) => i.slug === slug));
        }
        const bits = [];
        if (data.emailedYou) bits.push("copy emailed to you");
        if (data.emailedVendor) bits.push("sent to the vendor");
        if (data.demoVendor && !data.emailedVendor) bits.push("saved — this listing is demo, no vendor inbox");
        if (data.emailError && bits.length === 0) bits.push("saved, email did not send (check Resend)");
        setMailNote(bits.join(". ") || "Saved on your shortlist");
      }
      if (body.action === "hire") {
        setHired(true);
        if (data.vendor?.id) router.push(`/vendors/${data.vendor.id}`);
      }
    } finally {
      setBusy(false);
    }
  }

  if (missing) {
    return (
      <p className="text-sm text-muted">
        Listing not found. <Link href="/vendors/browse" className="underline">Back to browse</Link>
      </p>
    );
  }
  if (!listing) return <p className="text-sm text-muted">Loading…</p>;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/vendors/browse" className="text-xs font-medium underline">
          All listings
        </Link>
        <h1 className="mt-2 title">{listing.name}</h1>
        <p className="mt-1 text-sm text-muted">
          {listing.category} · {listing.city}, {listing.metro} · {listing.priceBand} · from{" "}
          {listing.startingFrom}
        </p>
      </div>

      <p className="text-sm text-ink-soft">{listing.about}</p>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => post({ action: "shortlist", slug })}
          className="rounded-lg border border-line px-3 py-2 text-sm"
        >
          {saved ? "On shortlist" : "Shortlist"}
        </button>
        <button
          type="button"
          disabled={busy || hired}
          onClick={() => post({ action: "hire", slug, status: "RESEARCHING" })}
          className="rounded-lg border border-line px-3 py-2 text-sm"
        >
          {hired ? "Already on your list" : "Add to my wedding"}
        </button>
        <button
          type="button"
          disabled={busy || hired}
          onClick={() => post({ action: "hire", slug, status: "BOOKED" })}
          className="btn btn-primary"
        >
          Book
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="glass-panel rounded-2xl p-4 text-sm">
          <p className="font-medium">Good for</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-ink-soft">
            {listing.goodFor.map((g) => (
              <li key={g}>{g}</li>
            ))}
          </ul>
        </div>
        <div className="glass-panel rounded-2xl p-4 text-sm">
          <p className="font-medium">Skip if</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-ink-soft">
            {listing.notFor.map((g) => (
              <li key={g}>{g}</li>
            ))}
          </ul>
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">Packages</p>
        <ul className="divide-y divide-line glass-panel rounded-2xl">
          {listing.packages.map((p) => (
            <li key={p.name} className="px-4 py-3 text-sm">
              <div className="flex justify-between gap-2">
                <p className="font-medium">{p.name}</p>
                <p className="text-ink-soft">{p.from}</p>
              </div>
              <p className="text-xs text-muted">{p.includes}</p>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-muted">
          {listing.serviceArea} · book {listing.leadWeeks} out · {listing.styles.join(" · ")}
        </p>
      </div>

      <div className="glass-panel rounded-2xl p-4 text-sm">
        <p className="font-medium">After you book</p>
        <p className="mt-1 text-ink-soft">{listing.afterBook}</p>
        <p className="mt-2 text-xs text-muted">
          Coordination is the point — payments, handoffs, and day-of live in this app, not in their inbox.
        </p>
        {listing.diySlug && (
          <p className="mt-2">
            <Link href={`/diy/${listing.diySlug}`} className="underline">
              Or DIY this category
            </Link>
          </p>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!message.trim()) return;
          post({ action: "inquire", slug, message, replyEmail });
        }}
        className="space-y-2 glass-panel rounded-2xl p-4"
      >
        <p className="text-sm font-medium">Ask a question</p>
        <p className="text-xs text-muted">
          Saves on your shortlist and emails a copy to you. If they’re already on My vendors, it lands on their thread.
        </p>
        {history.length > 0 && (
          <ul className="space-y-2 rounded-lg bg-surface p-3">
            {history.map((h) => (
              <li key={h.createdAt + h.message.slice(0, 12)} className="text-xs">
                <p className="text-muted">You · {h.createdAt.slice(0, 10)}</p>
                <p className="whitespace-pre-wrap text-ink">{h.message}</p>
              </li>
            ))}
          </ul>
        )}
        <input
          type="email"
          value={replyEmail}
          onChange={(e) => setReplyEmail(e.target.value)}
          placeholder="Your email (so they can reply)"
          className="w-full rounded-lg border border-line px-3 py-2 text-sm"
        />
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          placeholder={`Date, guest count, and what you need from ${listing.name}…`}
          className="w-full rounded-lg border border-line px-3 py-2 text-sm"
        />
        {mailNote && <p className="text-xs text-muted">{mailNote}</p>}
        <button
          type="submit"
          disabled={busy || !message.trim()}
          className="btn btn-primary"
        >
          {sent ? "Send another" : "Send inquiry"}
        </button>
      </form>
    </div>
  );
}
