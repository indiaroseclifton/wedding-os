"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { DIRECTORY_CATEGORIES } from "@/lib/data/vendor-directory";
import { TEAM_ROLES } from "@/lib/rooms";
import { RoomSubnav } from "@/components/layout/RoomSubnav";
import { vibeMatchesStyles } from "@/lib/vision-match";
import { vendorCatsFor } from "@/lib/shape";

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
  leadWeeks?: string;
};

type Place = {
  placeId: string;
  name: string;
  address: string;
  rating?: number;
  ratings?: number;
  mapsUrl: string;
  website?: string;
  phone?: string;
};

const PHOTOS: Record<string, string> = {
  Venue: "/brand/garden.jpg",
  Photographer: "/brand/setting.jpg",
  Videographer: "/brand/candles.jpg",
  Florist: "/brand/flowers.jpg",
  Catering: "/brand/tablescape.jpg",
  "DJ / Band": "/brand/candles.jpg",
  Cake: "/brand/setting.jpg",
  "Hair / Makeup": "/brand/setting.jpg",
  Planner: "/brand/garden.jpg",
  Officiant: "/brand/garden.jpg",
  Rentals: "/brand/tablescape.jpg",
  Stationery: "/brand/flowers.jpg",
  Transportation: "/brand/garden.jpg",
  Lighting: "/brand/candles.jpg",
  "Photo Booth": "/brand/setting.jpg",
  Bar: "/brand/tablescape.jpg",
  "Bridal salon": "/brand/flowers.jpg",
  "Hotel block": "/brand/garden.jpg",
};

export default function VendorBrowsePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [shortlist, setShortlist] = useState<string[]>([]);
  const [hired, setHired] = useState<string[]>([]);
  const [hiredCats, setHiredCats] = useState<string[]>([]);
  const [category, setCategory] = useState("All");
  const [band, setBand] = useState("All");
  const [city, setCity] = useState("All");
  const [style, setStyle] = useState("All");
  const [q, setQ] = useState("");
  const [source, setSource] = useState<"curated" | "near">("near");
  const [places, setPlaces] = useState<Place[]>([]);
  const [placesOn, setPlacesOn] = useState(false);
  const [placesMsg, setPlacesMsg] = useState<string | null>(null);
  const [near, setNear] = useState("");
  const [hiring, setHiring] = useState<string | null>(null);
  const [vibe, setVibe] = useState("");
  const [venueType, setVenueType] = useState("");
  const [followVision, setFollowVision] = useState(true);
  const [allowedCats, setAllowedCats] = useState<string[] | null>(null);

  async function load() {
    const res = await fetch("/api/directory");
    if (!res.ok) return;
    const data = await res.json();
    setListings(data.listings || []);
    setShortlist(data.shortlist || []);
    setHired(data.hiredSlugs || []);
    const mine = await fetch("/api/vendors");
    if (mine.ok) {
      const v = await mine.json();
      setHiredCats((v.vendors || []).map((x: { category?: string }) => x.category || ""));
    }
  }

  useEffect(() => {
    const cat = new URLSearchParams(window.location.search).get("category");
    if (cat) setCategory(cat);
    load();
    fetch("/api/workspace")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setAllowedCats(vendorCatsFor(d?.meta?.shape)))
      .catch(() => {});
    fetch("/api/decisions/style-vibe")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        const v = d?.decision?.payload?.vibe;
        if (typeof v === "string") setVibe(v);
        const place = d?.decision?.payload?.venueType;
        if (typeof place === "string") setVenueType(place);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (source !== "near") return;
    void runPlaces(category === "All" ? "Photographer" : category);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source, category]);

  async function runPlaces(cat = category) {
    const params = new URLSearchParams({
      category: cat === "All" ? "Photographer" : cat,
    });
    if (q.trim()) params.set("q", q.trim());
    if (near.trim()) params.set("near", near.trim());
    const res = await fetch(`/api/integrations/places/search?${params}`);
    const d = await res.json().catch(() => ({}));
    setPlacesOn(Boolean(d.configured));
    setPlaces(d.places || []);
    setPlacesMsg(d.error || (d.configured ? null : "Add GOOGLE_PLACES_API_KEY in Vercel to search near you."));
    if (d.near && !near) setNear(d.near);
  }

  async function hirePlace(p: Place) {
    setHiring(p.placeId);
    const res = await fetch("/api/integrations/places/hire", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        placeId: p.placeId,
        name: p.name,
        category: category === "All" ? "Other" : category,
        address: p.address,
        website: p.website,
        phone: p.phone,
        mapsUrl: p.mapsUrl,
      }),
    });
    setHiring(null);
    if (res.ok) {
      setHiredCats((c) => [...c, category === "All" ? "Other" : category]);
      window.location.href = "/vendors";
    }
  }

  async function toggle(slug: string) {
    const res = await fetch("/api/directory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "shortlist", slug }),
    });
    if (res.ok) {
      const data = await res.json();
      setShortlist(data.shortlist || []);
    }
  }

  const cities = useMemo(() => Array.from(new Set(listings.map((v) => v.city))).sort(), [listings]);
  const styles = useMemo(
    () => Array.from(new Set(listings.flatMap((v) => v.styles))).sort(),
    [listings]
  );

  const rows = useMemo(() => {
    return listings.filter((v) => {
      if (category !== "All" && v.category !== category) return false;
      if (band !== "All" && v.priceBand !== band) return false;
      if (city !== "All" && v.city !== city) return false;
      if (style !== "All" && !v.styles.includes(style)) return false;
      if (followVision && (vibe || venueType) && !vibeMatchesStyles(vibe, v.styles, venueType)) return false;
      if (q.trim()) {
        const hay = `${v.name} ${v.city} ${v.blurb} ${v.styles.join(" ")}`.toLowerCase();
        if (!hay.includes(q.trim().toLowerCase())) return false;
      }
      return true;
    });
  }, [listings, category, band, city, style, q, followVision, vibe, venueType]);

  function roleFilled(cat: string) {
    return hiredCats.some((c) => c.toLowerCase().includes(cat.split(" ")[0].toLowerCase())) ||
      listings.some((l) => l.category === cat && hired.includes(l.slug));
  }

  const filled = TEAM_ROLES.filter((r) => roleFilled(r.category)).length;

  return (
    <div className="space-y-6">
      <RoomSubnav room="vendors" />
      <div>
        <h1 className="font-serif text-4xl">Find vendors</h1>
        <p className="mt-1 text-sm text-muted">
          Every seat on a typical team — then shortlist and run them here. Not a link farm.
        </p>
        {(vibe || venueType) && (
          <label className="mt-3 flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={followVision}
              onChange={(e) => setFollowVision(e.target.checked)}
            />
            Match my vision ({[vibe, venueType].filter(Boolean).join(" · ")})
          </label>
        )}
      </div>

      <section className="rounded-2xl border border-line bg-surface p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold">Your team</p>
          <p className="text-xs text-muted">
            {filled} of {TEAM_ROLES.length} roles · couples hire ~14
          </p>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {TEAM_ROLES.filter((role) => !allowedCats || allowedCats.includes(role.category)).map((role) => {
            const on = roleFilled(role.category);
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => setCategory(role.category)}
                className={`rounded-full px-3 py-1 text-[11px] font-medium ${
                  on ? "bg-moss text-ivory" : "border border-line"
                }`}
              >
                {on ? "✓ " : ""}
                {role.label}
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <p className="mb-2 text-sm font-semibold">Categories</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {DIRECTORY_CATEGORIES.filter((c) => !allowedCats || allowedCats.includes(c)).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`overflow-hidden rounded-xl text-left ${
                category === c ? "ring-2 ring-moss" : "border border-line"
              }`}
            >
              <img src={PHOTOS[c] || "/brand/garden.jpg"} alt="" className="h-16 w-full object-cover" />
              <p className="px-2 py-1.5 text-[11px] font-medium">{c}</p>
            </button>
          ))}
        </div>
        {category !== "All" && (
          <button type="button" onClick={() => setCategory("All")} className="mt-2 text-xs underline">
            Show all
          </button>
        )}
      </section>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setSource("near")}
          className={`rounded-full px-3 py-1.5 text-xs font-medium ${
            source === "near" ? "bg-moss text-ivory" : "border border-line"
          }`}
        >
          Near you
        </button>
        <button
          type="button"
          onClick={() => setSource("curated")}
          className={`rounded-full px-3 py-1.5 text-xs font-medium ${
            source === "curated" ? "bg-moss text-ivory" : "border border-line"
          }`}
        >
          Curated demo
        </button>
      </div>

      {source === "near" && (
        <div className="space-y-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void runPlaces();
            }}
            className="flex flex-wrap gap-2"
          >
            <input
              value={near}
              onChange={(e) => setNear(e.target.value)}
              placeholder="City (Atlanta, GA)"
              className="rounded-lg border border-line px-3 py-2 text-sm"
            />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Or type a search"
              className="min-w-[12rem] flex-1 rounded-lg border border-line px-3 py-2 text-sm"
            />
            <button type="submit" className="rounded-full bg-moss px-4 py-2 text-xs font-medium text-ivory">
              Search
            </button>
          </form>
          {placesMsg && (
            <p className="text-sm text-muted">
              {placesMsg}{" "}
              {!placesOn && (
                <Link href="/integrations" className="underline">
                  How
                </Link>
              )}
            </p>
          )}
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {places.map((p) => (
              <li key={p.placeId} className="rounded-2xl border border-line bg-surface p-4">
                <p className="font-medium">{p.name}</p>
                <p className="text-[11px] text-muted">{p.address}</p>
                {p.rating != null && (
                  <p className="mt-1 text-xs text-ink-soft">
                    {p.rating} ★{p.ratings ? ` · ${p.ratings} reviews` : ""}
                  </p>
                )}
                <div className="mt-3 flex flex-wrap gap-3">
                  {p.mapsUrl && (
                    <a href={p.mapsUrl} target="_blank" rel="noreferrer" className="text-xs underline">
                      Maps
                    </a>
                  )}
                  {p.website && (
                    <a href={p.website} target="_blank" rel="noreferrer" className="text-xs underline">
                      Site
                    </a>
                  )}
                  <button
                    type="button"
                    disabled={hiring === p.placeId}
                    onClick={() => hirePlace(p)}
                    className="text-xs font-medium underline"
                  >
                    {hiring === p.placeId ? "Adding…" : "Add to my team"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {source === "curated" && (
        <>
      <div className="flex flex-wrap gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, city, style"
          className="min-w-[12rem] flex-1 rounded-lg border border-line px-3 py-2 text-sm"
        />
        <select value={city} onChange={(e) => setCity(e.target.value)} className="rounded-lg border border-line px-3 py-2 text-sm">
          <option>All</option>
          {cities.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select value={band} onChange={(e) => setBand(e.target.value)} className="rounded-lg border border-line px-3 py-2 text-sm">
          <option>All</option>
          <option value="$">$</option>
          <option value="$$">$$</option>
          <option value="$$$">$$$</option>
        </select>
        <select value={style} onChange={(e) => setStyle(e.target.value)} className="rounded-lg border border-line px-3 py-2 text-sm">
          <option>All</option>
          {styles.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <Link href="/vendors/shortlist" className="rounded-full border border-line px-3 py-2 text-xs font-medium">
          Compare ({shortlist.length})
        </Link>
      </div>

      <p className="text-xs text-muted">{rows.length} listings</p>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((v) => {
          const saved = shortlist.includes(v.slug);
          const onTeam = hired.includes(v.slug);
          return (
            <li key={v.slug} className="overflow-hidden rounded-2xl border border-line bg-surface">
              <img src={PHOTOS[v.category] || "/brand/garden.jpg"} alt="" className="h-32 w-full object-cover" />
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{v.name}</p>
                    <p className="text-[11px] text-muted">
                      {v.category} · {v.city} · {v.priceBand}
                    </p>
                  </div>
                  {onTeam && <span className="text-[10px] font-medium text-moss">Hired</span>}
                </div>
                <p className="mt-2 text-sm text-ink-soft">{v.blurb}</p>
                <p className="mt-1 text-[11px] text-muted">
                  from {v.startingFrom}
                  {v.leadWeeks ? ` · book ${v.leadWeeks}` : ""}
                </p>
                <div className="mt-3 flex gap-3">
                  <Link href={`/vendors/browse/${v.slug}`} className="text-xs font-medium underline">
                    Open
                  </Link>
                  <button type="button" onClick={() => toggle(v.slug)} className="text-xs underline">
                    {saved ? "On shortlist" : "Shortlist"}
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      {rows.length === 0 && <p className="text-sm text-muted">No listings match those filters.</p>}
        </>
      )}
    </div>
  );
}
