"use client";

import { useEffect, useState } from "react";

const SLIDES = [
  {
    kind: "hero" as const,
    kicker: "Wedding OS",
    title: "From a YouTube spiral to a coordination hub",
    body: "How we got from India’s brief to a live product — and why the next face is being designed off-stage.",
    photo: "/brand/tablescape.jpg",
  },
  {
    kind: "split" as const,
    kicker: "01  ·  The hole",
    title: "Pretty websites. Empty weeks.",
    body: "Zola and Joy win on templates and registry. Couples still keep a spreadsheet. India wanted the thing they don’t have: one hallway for this week — plus a way to actually make the flowers.",
    points: [
      "Coordination is the missing product",
      "Vendors end-to-end, not a list of links",
      "DIY as a first-class path, not a blog post",
    ],
    photo: "/brand/setting.jpg",
  },
  {
    kind: "quote" as const,
    kicker: "02  ·  The brief",
    title: "India’s wedding",
    body: "I did all my flowers myself. I had to understand where to get them, cost differences, what I needed. We did all our own table décor. I watched hours of YouTube. I want people who DIY to come here instead.",
  },
  {
    kind: "grid" as const,
    kicker: "03  ·  What we set out to build",
    title: "One product, three jobs",
    cards: [
      { t: "Coordinate", d: "This week: payments, RSVPs, contracts, holes in the day." },
      { t: "Hire", d: "Browse, shortlist, inquire, contract, deposit — not a new tab." },
      { t: "Make", d: "Playbooks sized to your tables. Sources, recipes, shopping lists." },
    ],
  },
  {
    kind: "timeline" as const,
    kicker: "04  ·  How it was built",
    title: "Waves, not a waterfall",
    steps: [
      { t: "Stand up", d: "Vercel, GitHub, Resend magic links. A working login before a pretty box." },
      { t: "Rooms", d: "Guests, RSVP, seating, vendors, run of show, checklist, budget, day-of." },
      { t: "The brief bites", d: "DIY studio, This week as the hallway, multi-event RSVP, contracts, music." },
      { t: "Ship it", d: "Live on Vercel. Mobile tabs. Integrations catalog. Spotify, then Apple Music." },
      { t: "Find a face", d: "Generic → paper → modern SaaS → cinematic stage. Color locked tonight." },
    ],
  },
  {
    kind: "split" as const,
    kicker: "05  ·  The hallway",
    title: "This week is the product",
    body: "Not a dashboard of widgets. A stage with your names, your city, your day-count, and the three things that are actually late. Everything else is a room you walk into.",
    points: [
      "Do now / this week / soon",
      "⌘K jumps a guest, vendor, or room",
      "Rooms are photographs, not a sitemap",
    ],
    photo: "/brand/candles.jpg",
  },
  {
    kind: "split" as const,
    kicker: "06  ·  DIY",
    title: "Playbooks, not Pinterest",
    body: "Flowers, tables, signs, light, cake. Compare wholesale vs grocery vs farm. A list that resizes when you change table count. The YouTube spiral, filed.",
    points: [
      "When to DIY vs when to hire",
      "Shopping list with bought / left",
      "Calendar of hydrate-and-arrange beats",
    ],
    photo: "/brand/flowers.jpg",
  },
  {
    kind: "grid" as const,
    kicker: "07  ·  What’s in the house",
    title: "Shipped, not sketched",
    cards: [
      { t: "People", d: "Guests, RSVP nudges, addresses, seating, floor plan, travel, dietary." },
      { t: "Money & vendors", d: "Directory, shortlist, inquiry thread, contracts, deposits, handoffs." },
      { t: "The day", d: "Run of show, day-of board, party view, packet, attire, music." },
      { t: "Make", d: "Ten DIY playbooks, checklist, timeline, traditions, moodboard." },
      { t: "Guest face", d: "Public site, RSVP, registry, weather, Spotify / Apple playlists." },
      { t: "Ops", d: "Magic-link auth, Prisma/Neon, mobile shell, command palette." },
    ],
  },
  {
    kind: "evolve" as const,
    kicker: "08  ·  Finding a face",
    title: "Five skins. One lesson.",
    phases: [
      { t: "Scaffold", d: "Default type. Looked like a CMS. Fine for wiring rooms." },
      { t: "Paper + moss", d: "Invitation fonts. Still no pictures. Felt like a PDF." },
      { t: "Modern product", d: "Geist, cool paper, product-in-the-hero. You called it boring." },
      { t: "Cinematic", d: "Full-bleed, huge type, glass. Awwwards energy. Still a stock couple." },
      { t: "Theirs", d: "Names, city, cover photo, visual rooms. The sitemap died." },
    ],
  },
  {
    kind: "palette" as const,
    kicker: "09  ·  The system",
    title: "Stage and desk. One family.",
    body: "Analogous earth. No new hues. Champagne is the 10%. Clay only when something is late.",
  },
  {
    kind: "split" as const,
    kicker: "10  ·  Right now",
    title: "Live product. New face incoming.",
    body: "The app is on Vercel. You’re mocking the next face elsewhere with the full design prompt. This deck is the memory so we don’t forget why each room exists.",
    points: [
      "Swap your names and cover in Settings",
      "Mockups come back as the Stage",
      "Desk rooms stay working while the skin changes",
    ],
    photo: "/brand/garden.jpg",
  },
  {
    kind: "close" as const,
    kicker: "Wedding OS",
    title: "Plan the wedding you’re actually throwing.",
    body: "Hire or make it. One week at a time.",
    photo: "/brand/tablescape.jpg",
  },
];

const SWATCHES = [
  { name: "night", hex: "#0C0E0B", fg: "#F6F1E8" },
  { name: "ivory", hex: "#F6F1E8", fg: "#12110F" },
  { name: "champagne", hex: "#EADEC8", fg: "#12110F" },
  { name: "paper", hex: "#F6F5F2", fg: "#12110F" },
  { name: "moss", hex: "#1C3D32", fg: "#F6F5F2" },
  { name: "clay", hex: "#9A4034", fg: "#F6F1E8" },
];

export function ProcessDeck() {
  const [i, setI] = useState(0);
  const last = SLIDES.length - 1;

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
        e.preventDefault();
        setI((n) => Math.min(n + 1, last));
      }
      if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        setI((n) => Math.max(n - 1, 0));
      }
      if (e.key === "Home") setI(0);
      if (e.key === "End") setI(last);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [last]);

  const slide = SLIDES[i];

  return (
    <div className="relative min-h-screen bg-night text-ivory">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-5 py-6 sm:px-10 sm:py-8">
        <header className="flex items-center justify-between text-[11px] uppercase tracking-[0.22em] text-champagne/80">
          <span>Wedding OS  ·  process</span>
          <span>
            {String(i + 1).padStart(2, "0")} / {String(SLIDES.length).padStart(2, "0")}
          </span>
        </header>

        <main className="flex flex-1 flex-col justify-center py-8">
          {slide.kind === "hero" && (
            <div className="grid items-center gap-10 lg:grid-cols-2">
              <div>
                <p className="text-[11px] uppercase tracking-[0.28em] text-champagne">{slide.kicker}</p>
                <h1 className="mt-4 font-serif text-5xl leading-[0.95] tracking-tight sm:text-6xl">
                  {slide.title}
                </h1>
                <p className="mt-6 max-w-md text-base leading-7 text-white/70">{slide.body}</p>
              </div>
              <div className="overflow-hidden rounded-[1.5rem]">
                <img src={slide.photo} alt="" className="aspect-[4/5] w-full object-cover object-[center_28%] lg:aspect-[5/6]" />
              </div>
            </div>
          )}

          {slide.kind === "split" && (
            <div className="grid items-center gap-10 lg:grid-cols-2">
              <div>
                <p className="text-[11px] uppercase tracking-[0.28em] text-champagne">{slide.kicker}</p>
                <h2 className="mt-4 font-serif text-4xl leading-[1.05] tracking-tight sm:text-5xl">
                  {slide.title}
                </h2>
                <p className="mt-5 max-w-md text-base leading-7 text-white/70">{slide.body}</p>
                <ul className="mt-6 space-y-2">
                  {slide.points.map((p) => (
                    <li key={p} className="text-sm text-ivory/90">
                      —  {p}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="overflow-hidden rounded-[1.5rem]">
                <img src={slide.photo} alt="" className="aspect-[4/3] w-full object-cover" />
              </div>
            </div>
          )}

          {slide.kind === "quote" && (
            <div className="mx-auto max-w-3xl">
              <p className="text-[11px] uppercase tracking-[0.28em] text-champagne">{slide.kicker}</p>
              <h2 className="mt-4 font-serif text-3xl">{slide.title}</h2>
              <p className="mt-8 font-serif text-3xl leading-snug tracking-tight text-ivory sm:text-4xl">
                “{slide.body}”
              </p>
            </div>
          )}

          {slide.kind === "grid" && (
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-champagne">{slide.kicker}</p>
              <h2 className="mt-4 font-serif text-4xl tracking-tight">{slide.title}</h2>
              <div className="mt-10 grid gap-3 sm:grid-cols-3">
                {slide.cards.map((c) => (
                  <article key={c.t} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <h3 className="font-serif text-2xl">{c.t}</h3>
                    <p className="mt-2 text-sm leading-6 text-white/65">{c.d}</p>
                  </article>
                ))}
              </div>
            </div>
          )}

          {slide.kind === "timeline" && (
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-champagne">{slide.kicker}</p>
              <h2 className="mt-4 font-serif text-4xl tracking-tight">{slide.title}</h2>
              <ol className="mt-10 space-y-5">
                {slide.steps.map((s, n) => (
                  <li key={s.t} className="grid gap-2 border-t border-white/10 pt-4 sm:grid-cols-[8rem_1fr]">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-champagne/80">
                      {String(n + 1).padStart(2, "0")}  {s.t}
                    </p>
                    <p className="text-sm leading-6 text-white/75">{s.d}</p>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {slide.kind === "evolve" && (
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-champagne">{slide.kicker}</p>
              <h2 className="mt-4 font-serif text-4xl tracking-tight">{slide.title}</h2>
              <ol className="mt-10 grid gap-3 sm:grid-cols-5">
                {slide.phases.map((p, n) => (
                  <li key={p.t} className="rounded-2xl border border-white/10 p-4">
                    <p className="text-[11px] text-champagne/70">{String(n + 1).padStart(2, "0")}</p>
                    <p className="mt-2 font-serif text-xl">{p.t}</p>
                    <p className="mt-2 text-xs leading-5 text-white/60">{p.d}</p>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {slide.kind === "palette" && (
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-champagne">{slide.kicker}</p>
              <h2 className="mt-4 font-serif text-4xl tracking-tight">{slide.title}</h2>
              <p className="mt-4 max-w-lg text-sm leading-6 text-white/70">{slide.body}</p>
              <div className="mt-10 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
                {SWATCHES.map((s) => (
                  <div key={s.name} className="overflow-hidden rounded-2xl" style={{ background: s.hex, color: s.fg }}>
                    <div className="aspect-square p-4">
                      <p className="font-serif text-lg">{s.name}</p>
                      <p className="mt-1 text-[11px] tracking-wide opacity-70">{s.hex}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-6 text-xs text-white/50">
                Stage: night / ivory / champagne. Desk: paper / ink / moss. Clay only when something is late.
              </p>
            </div>
          )}

          {slide.kind === "close" && (
            <div className="relative overflow-hidden rounded-[1.75rem]">
              <img src={slide.photo} alt="" className="h-[62vh] w-full object-cover object-[center_28%]" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />
              <div className="absolute inset-x-0 bottom-0 p-8 sm:p-12">
                <p className="text-[11px] uppercase tracking-[0.28em] text-champagne">{slide.kicker}</p>
                <h2 className="mt-3 font-serif text-4xl leading-[1.05] sm:text-6xl">{slide.title}</h2>
                <p className="mt-4 text-sm text-white/75">{slide.body}</p>
              </div>
            </div>
          )}
        </main>

        <footer className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => setI((n) => Math.max(n - 1, 0))}
            disabled={i === 0}
            className="text-xs uppercase tracking-[0.16em] text-champagne disabled:opacity-30"
          >
            Back
          </button>
          <div className="flex flex-1 justify-center gap-1.5">
            {SLIDES.map((_, n) => (
              <button
                key={n}
                type="button"
                aria-label={`Slide ${n + 1}`}
                onClick={() => setI(n)}
                className={`h-1.5 rounded-full transition ${n === i ? "w-6 bg-champagne" : "w-1.5 bg-white/25"}`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => setI((n) => Math.min(n + 1, last))}
            disabled={i === last}
            className="text-xs uppercase tracking-[0.16em] text-champagne disabled:opacity-30"
          >
            Next
          </button>
        </footer>
      </div>
    </div>
  );
}
