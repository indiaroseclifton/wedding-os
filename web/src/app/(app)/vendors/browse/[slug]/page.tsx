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
      <p className="text-sm text-slate-600">
        Listing not found. <Link href="/vendors/browse" className="underline">Back to browse</Link>
      </p>
    );
  }
  if (!listing) return <p className="text-sm text-slate-500">Loading…</p>;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/vendors/browse" className="text-xs font-medium underline">
          All listings
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">{listing.name}</h1>
        <p className="mt-1 text-sm text-slate-600">
          {listing.category} · {listing.city}, {listing.metro} · {listing.priceBand} · from{" "}
          {listing.startingFrom}
        </p>
      </div>

      <p className="text-sm text-slate-700">{listing.about}</p>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => post({ action: "shortlist", slug })}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          {saved ? "On shortlist" : "Shortlist"}
        </button>
        <button
          type="button"
          disabled={busy || hired}
          onClick={() => post({ action: "hire", slug, status: "RESEARCHING" })}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          {hired ? "Already on your list" : "Add to my wedding"}
        </button>
        <button
          type="button"
          disabled={busy || hired}
          onClick={() => post({ action: "hire", slug, status: "BOOKED" })}
          className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          Book
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm">
          <p className="font-medium">Good for</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-600">
            {listing.goodFor.map((g) => (
              <li key={g}>{g}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm">
          <p className="font-medium">Skip if</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-600">
            {listing.notFor.map((g) => (
              <li key={g}>{g}</li>
            ))}
          </ul>
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">Packages</p>
        <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
          {listing.packages.map((p) => (
            <li key={p.name} className="px-4 py-3 text-sm">
              <div className="flex justify-between gap-2">
                <p className="font-medium">{p.name}</p>
                <p className="text-slate-600">{p.from}</p>
              </div>
              <p className="text-xs text-slate-500">{p.includes}</p>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-slate-500">
          {listing.serviceArea} · book {listing.leadWeeks} out · {listing.styles.join(" · ")}
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm">
        <p className="font-medium">After you book</p>
        <p className="mt-1 text-slate-600">{listing.afterBook}</p>
        <p className="mt-2 text-xs text-slate-500">
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
        className="space-y-2 rounded-xl border border-slate-200 bg-white p-4"
      >
        <p className="text-sm font-medium">Ask a question</p>
        <p className="text-xs text-slate-500">
          Saves on your shortlist and emails a copy to you. Demo listings don't have a real inbox yet.
        </p>
        <input
          type="email"
          value={replyEmail}
          onChange={(e) => setReplyEmail(e.target.value)}
          placeholder="Your email (so they can reply)"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          placeholder={`Date, guest count, and what you need from ${listing.name}…`}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        {mailNote && <p className="text-xs text-slate-600">{mailNote}</p>}
        <button
          type="submit"
          disabled={busy || !message.trim()}
          className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {sent ? "Send another" : "Send inquiry"}
        </button>
      </form>
    </div>
  );
}
