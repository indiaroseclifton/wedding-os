import { VIBE_KEYS } from "@/lib/vision-match";
import { envelopeForVendor } from "@/lib/budget-envelopes";

export type ScoreableVendor = {
  category: string;
  city: string;
  metro?: string;
  priceBand?: string;
  startingFrom?: string;
  styles: string[];
  blurb?: string;
  goodFor?: string[];
  notFor?: string[];
  leadWeeks?: string;
};

export type ScoreContext = {
  vibe?: string;
  venueType?: string;
  story?: string;
  formal?: string;
  avoid?: string;
  pathChoice?: string;
  city?: string;
  weddingDate?: string;
  envelopePlanned?: number;
};

export type VendorScore = {
  score: number;
  why: string[];
  no: string[];
  diy: boolean;
};

const STORY_KEYS: Record<string, string[]> = {
  linen: ["linen", "cream", "paper", "blush", "ivory"],
  garden: ["garden", "wild", "seasonal", "outdoor", "estate"],
  midnight: ["candle", "evening", "lush", "gold", "formal"],
  coast: ["modern", "minimal", "editorial", "city", "fog"],
  citrus: ["rustic", "farm", "terracotta", "casual"],
  "ink-blush": ["editorial", "contrast", "modern"],
};

const FORMAL_KEYS: Record<string, string[]> = {
  "Black tie": ["formal", "estate", "plated", "ballroom"],
  Cocktail: ["editorial", "modern", "city"],
  "Garden party": ["garden", "outdoor", "casual"],
  Casual: ["casual", "taco", "stations", "farm", "diy"],
};

const CAT_PATH: Record<string, string> = {
  Florist: "flowers",
  Rentals: "tables",
  Stationery: "signs",
  Lighting: "lighting",
  Cake: "cake",
  Photographer: "photo",
};

export function pathIdForCategory(category: string) {
  return CAT_PATH[category];
}

export function scoreVendor(listing: ScoreableVendor, ctx: ScoreContext): VendorScore {
  const why: string[] = [];
  const no: string[] = [];
  let score = 40;
  const hay = haystack(listing);

  const vibeKeys = ctx.vibe ? VIBE_KEYS[ctx.vibe] || [] : [];
  const vibeHits = countHits(hay, vibeKeys);
  if (vibeKeys.length) {
    const pts = Math.min(15, vibeHits * 6);
    score += pts;
    if (vibeHits) why.push(ctx.vibe!);
  }

  const placeWords = words(ctx.venueType);
  const placeHits = countHits(hay, placeWords);
  if (placeWords.length) {
    if (placeHits) {
      score += Math.min(25, 10 + placeHits * 6);
      why.push(ctx.venueType!);
    } else if (listing.notFor?.some((n) => overlap(n, placeWords))) {
      score -= 12;
      no.push(`Not for ${ctx.venueType}`);
    }
  }

  const storyKeys = ctx.story ? STORY_KEYS[ctx.story] || [] : [];
  if (storyKeys.length) {
    const hits = countHits(hay, storyKeys);
    if (hits) {
      score += Math.min(20, hits * 7);
      why.push(ctx.story as string);
    }
  }

  const formalKeys = ctx.formal ? FORMAL_KEYS[ctx.formal] || [] : [];
  if (formalKeys.length) {
    const hits = countHits(hay, formalKeys);
    if (hits) {
      score += 10;
      why.push(ctx.formal as string);
    } else if (ctx.formal === "Black tie" && /taco|casual|diy|food truck/.test(hay)) {
      score -= 8;
      no.push("More casual than black tie");
    }
  }

  const avoidWords = words(ctx.avoid).filter((w) => w.length > 3);
  if (avoidWords.length && countHits(hay, avoidWords)) {
    score -= 30;
    no.push("Touches a hard no");
  }

  if (ctx.city) {
    const here = ctx.city.toLowerCase();
    if (listing.city.toLowerCase().includes(here.split(",")[0].trim()) || listing.metro?.toLowerCase().includes(here.split(",")[0].trim())) {
      score += 10;
      why.push(listing.city);
    }
  }

  const band = listing.priceBand || bandFromStart(listing.startingFrom);
  const want = bandFromPlanned(ctx.envelopePlanned);
  if (band && want) {
    const gap = Math.abs(band.length - want.length);
    if (gap === 0) {
      score += 15;
      why.push(`Fits ${want}`);
    } else if (gap === 1) score += 6;
    else {
      score -= 5;
      no.push(`${band} vs your envelope`);
    }
  }

  if (ctx.weddingDate && listing.leadWeeks) {
    const monthsOut = monthsUntil(ctx.weddingDate);
    const need = minLeadMonths(listing.leadWeeks);
    if (monthsOut != null && need != null) {
      if (monthsOut >= need) score += 5;
      else {
        score -= 8;
        no.push(`Usually books ${listing.leadWeeks}`);
      }
    }
  }

  const diy = ctx.pathChoice === "diy";
  if (diy) {
    score = Math.round(score * 0.62);
    no.push("You marked this as DIY");
  } else if (ctx.pathChoice === "hire") {
    score += 4;
  }

  score = Math.max(0, Math.min(100, Math.round(score)));
  return { score, why: uniq(why).slice(0, 3), no: uniq(no).slice(0, 2), diy };
}

export function envelopeKeyForVendor(category: string, name = "") {
  return envelopeForVendor(name, category);
}

function haystack(v: ScoreableVendor) {
  return [v.styles.join(" "), v.blurb, ...(v.goodFor || []), ...(v.notFor || [])]
    .join(" ")
    .toLowerCase();
}

function words(s?: string) {
  return (s || "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 2);
}

function countHits(hay: string, keys: string[]) {
  return keys.filter((k) => hay.includes(k.toLowerCase())).length;
}

function overlap(text: string, keys: string[]) {
  const t = text.toLowerCase();
  return keys.some((k) => t.includes(k));
}

function bandFromStart(start?: string): "$" | "$$" | "$$$" | "" {
  if (!start) return "";
  const n = Number(start.replace(/[^0-9]/g, ""));
  if (!n) return "";
  if (n < 2000) return "$";
  if (n < 6000) return "$$";
  return "$$$";
}

function bandFromPlanned(n?: number): "$" | "$$" | "$$$" | "" {
  if (!n || n <= 0) return "";
  if (n < 2000) return "$";
  if (n < 6000) return "$$";
  return "$$$";
}

function monthsUntil(iso: string) {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  return (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30.4);
}

function minLeadMonths(lead: string) {
  const m = lead.match(/(\d+)/);
  return m ? Number(m[1]) : null;
}

function uniq(rows: string[]) {
  return Array.from(new Set(rows.filter(Boolean)));
}
