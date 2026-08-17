"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { GuestHero } from "@/components/site/GuestHero";

type Look = {
  names: string;
  date?: string;
  location?: string;
  coverUrl?: string;
  mode: "invite" | "announce";
  night: boolean;
};

export function GuestLetter({
  token,
  title,
  children,
}: {
  token: string;
  title: string;
  children: React.ReactNode;
}) {
  const [look, setLook] = useState<Look | null>(null);

  useEffect(() => {
    fetch(`/api/public/site/${token}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d) return;
        setLook({
          names: d.wedding?.coupleNames || d.wedding?.name || "",
          date: d.look?.dateLine || d.wedding?.dateLine,
          location: d.wedding?.location,
          coverUrl: d.look?.coverUrl,
          mode: d.look?.mode === "announce" ? "announce" : "invite",
          night: Boolean(d.look?.night),
        });
      })
      .catch(() => {});
  }, [token]);

  return (
    <div className={`min-h-screen ${look?.night ? "bg-[#141311] text-[#f3efe6]" : "bg-paper text-ink"}`}>
      {look ? (
        <GuestHero
          compact
          names={look.names}
          date={look.date}
          location={look.location}
          coverUrl={look.coverUrl}
          mode={look.mode}
          night={look.night}
        />
      ) : (
        <div className="h-28 bg-champagne/30" />
      )}
      <main className="mx-auto max-w-md px-5 py-8">
        <Link href={`/w/${token}`} className="text-xs text-moss underline">
          Back to the wedding
        </Link>
        <h1 className="mt-4 font-serif text-4xl tracking-tight">{title}</h1>
        {children}
      </main>
    </div>
  );
}
