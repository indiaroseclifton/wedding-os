"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { DIRECTORY_CATEGORIES } from "@/lib/data/vendor-directory";
import { TEAM_ROLES } from "@/lib/rooms";
import { RoomSubnav } from "@/components/layout/RoomSubnav";
import { vendorCatsFor } from "@/lib/shape";
import { envelopeForVendor } from "@/lib/budget-envelopes";
import { pathIdForCategory, scoreVendor } from "@/lib/vendor-score";
import { rangeFor } from "@/lib/vendor-ranges";

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
  goodFor?: string[];
  notFor?: string[];
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
  const [source, setSource] = useState<"curated" | "near">("curated");
  const [places, setPlaces] = useState<Place[]>([]);
  const [placesOn, setPlacesOn] = useState(false);
  const [placesMsg, setPlacesMsg] = useState<string | null>(null);
  const [near, setNear] = useState("");
  const [hiring, setHiring] = useState<string | null>(null);
  const [vibe, setVibe] = useState("");
  const [venueType, setVenueType] = useState("");
  const [story, setStory] = useState("");
  const [formal, setFormal] = useState("");
  const [avoid, setAvoid] = useState("");
  const [pathChoices, setPathChoices] = useState<Record<string, string>>({});
  const [homeCity, setHomeCity] = useState("");
  const [weddingDate, setWeddingDate] = useState("");
  const [plannedByEnv, setPlannedByEnv] = useState<Record<string, number>>({});
  const [followVision, setFollowVision] = useState(true);
  const [allowedCats, setAllowedCats] = useState<string[] | null>(null);
  const [diyFriendly, setDiyFriendly] = useState(false);

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
      .then((d) => {
        setAllowedCats(vendorCatsFor(d?.meta?.shape));
        if (d?.meta?.location) setHomeCity(d.meta.location);
        if (d?.meta?.weddingDate) setWeddingDate(d.meta.weddingDate);
      })
      .catch(() => {});
    fetch("/api/decisions/style-vibe")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        const p = d?.decision?.payload || {};
        if (typeof p.vibe === "string") setVibe(p.vibe);
        if (typeof p.venueType === "string") setVenueType(p.venueType);
        if (typeof p.story === "string") setStory(p.story);
        if (typeof p.formal === "string") setFormal(p.formal);
        if (typeof p.avoid === "string") setAvoid(p.avoid);
      })
      .catch(() => {});
    fetch("/api/path")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setPathChoices(d?.path?.choices || {}))
      .catch(() => {});
    fetch("/api/budget")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        const map: Record<string, number> = {};
        for (const line of d?.budget?.lines || []) {
          const key = line.category || "";
          map[key] = (map[key] || 0) + (line.planned || 0);
        }
        setPlannedByEnv(map);
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
    const filtered = listings.filter((v) => {
      if (category !== "All" && v.category !== category) return false;
      if (band !== "All" && v.priceBand !== band) return false;
      if (city !== "All" && v.city !== city) return false;
      if (style !== "All" && !v.styles.includes(style)) return false;
      if (diyFriendly && !(v.goodFor || []).some((item) => /diy|collab|partial|a la carte/i.test(item))) return false;
      if (q.trim()) {
        const hay = `${v.name} ${v.city} ${v.blurb} ${v.styles.join(" ")}`.toLowerCase();
        if (!hay.includes(q.trim().toLowerCase())) return false;
      }
      return true;
    });
    const hasVision = Boolean(vibe || venueType || story || formal);
    return filtered
      .map((v) => {
        const pathId = pathIdForCategory(v.category);
        const env = envelopeForVendor(v.name, v.category);
        const match = scoreVendor(v, {
          vibe,
          venueType,
          story,
          formal,
          avoid,
          pathChoice: pathId ? pathChoices[pathId] : undefined,
          city: homeCity,
          weddingDate,
          envelopePlanned: plannedByEnv[env],
        });
        return { v, match };
      })
      .sort((a, b) => {
        if (followVision && hasVision) return b.match.score - a.match.score;
        return a.v.name.localeCompare(b.v.name);
      });
  }, [
    listings,
    category,
    band,
    city,
    style,
    diyFriendly,
    q,
    followVision,
    vibe,
    venueType,
    story,
    formal,
    avoid,
    pathChoices,
    homeCity,
    weddingDate,
    plannedByEnv,
  ]);

  function roleFilled(cat: string) {
    return hiredCats.some((c) => c.toLowerCase().includes(cat.split(" ")[0].toLowerCase())) ||
      listings.some((l) => l.category === cat && hired.includes(l.slug));
  }

  const filled = TEAM_ROLES.filter((r) => roleFilled(r.category)).length;

  return (
    <div className="space-y-6">
      <RoomSubnav room="planning" />
      <div>
        <h1 className="font-serif text-4xl">Find vendors</h1>
        <p className="mt-1 text-sm text-muted">
          Every seat on a typical team — then shortlist and run them here. Not a link farm.
        </p>
        {(vibe || venueType || story) && (
          <label className="mt-3 flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={followVision}
              onChange={(e) => setFollowVision(e.target.checked)}
            />
            Sort curated by my vision
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
                  on ? "bg-moss text-moss-fg" : "border border-line"
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
            source === "near" ? "bg-moss text-moss-fg" : "border border-line"
          }`}
        >
          Near you
        </button>
        <button
          type="button"
          onClick={() => setSource("curated")}
          className={`rounded-full px-3 py-1.5 text-xs font-medium ${
            source === "curated" ? "bg-moss text-moss-fg" : "border border-line"
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
            <button type="submit" className="rounded-full bg-moss px-4 py-2 text-xs font-medium text-moss-fg">
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
          <p className="text-xs text-muted">Near you — we don’t know their look yet. Category, city, rating only.</p>
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
        <label className="flex min-h-11 items-center gap-2 rounded-full border border-line bg-surface px-3 text-sm">
          <input type="checkbox" checked={diyFriendly} onChange={(e) => setDiyFriendly(e.target.checked)} />
          DIY-friendly
        </label>
        <Link href="/vendors/shortlist" className="rounded-full border border-line px-3 py-2 text-xs font-medium">
          Compare ({shortlist.length})
        </Link>
      </div>

      <p className="text-xs text-muted">{rows.length} listings{followVision && (vibe || venueType) ? " · sorted by match" : ""}</p>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map(({ v, match }) => {
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
                  <div className="text-right">
                    {onTeam && <p className="text-[10px] font-medium text-moss">Hired</p>}
                    <p className="font-serif text-xl leading-none">{match.score}</p>
                  </div>
                </div>
                {match.why.length ? (
                  <p className="mt-2 text-[12px] text-moss">{match.why.join(" · ")}</p>
                ) : null}
                {match.no.length ? (
                  <p className="mt-1 text-[12px] text-muted">{match.no.join(" · ")}</p>
                ) : null}
                <p className="mt-1 text-[12px] text-muted">
                  Usually {rangeFor(v.category).low}–{rangeFor(v.category).high} without a venue
                </p>
                <p className="mt-2 text-sm text-ink-soft">{v.blurb}</p>
                {(v.goodFor || []).some((item) => /diy|collab|partial|a la carte/i.test(item)) ? <p className="mt-2 inline-flex rounded-full bg-moss-soft px-2.5 py-1 text-[11px] font-medium">DIY-friendly collaboration</p> : null}
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
