const SEARCH = "https://places.googleapis.com/v1/places:searchText";

export function placesConfigured() {
  return Boolean(process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_MAPS_API_KEY);
}

function key() {
  return process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_MAPS_API_KEY || "";
}

export const PLACE_QUERY: Record<string, string> = {
  Venue: "wedding venue",
  Photographer: "wedding photographer",
  Videographer: "wedding videographer",
  Florist: "wedding florist",
  Catering: "wedding caterer",
  "DJ / Band": "wedding DJ",
  Cake: "wedding cake bakery",
  "Hair / Makeup": "bridal hair and makeup",
  Planner: "wedding planner",
  Officiant: "wedding officiant",
  Rentals: "wedding rental company",
  Stationery: "wedding invitations",
  Transportation: "wedding transportation",
  Lighting: "wedding lighting company",
  "Photo Booth": "photo booth rental",
  Bar: "mobile bartending wedding",
  "Bridal salon": "bridal salon",
  "Hotel block": "hotel",
};

export type PlaceHit = {
  placeId: string;
  name: string;
  address: string;
  rating?: number;
  ratings?: number;
  mapsUrl: string;
  website?: string;
  phone?: string;
};

export async function searchPlaces(query: string, near?: string): Promise<PlaceHit[]> {
  const textQuery = [query.trim(), near?.trim()].filter(Boolean).join(" in ");
  const res = await fetch(SEARCH, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": key(),
      "X-Goog-FieldMask":
        "places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.googleMapsUri,places.websiteUri,places.nationalPhoneNumber",
    },
    body: JSON.stringify({ textQuery, maxResultCount: 12 }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error?.message || "Places search failed");
  }
  return ((data.places || []) as {
    id?: string;
    displayName?: { text?: string };
    formattedAddress?: string;
    rating?: number;
    userRatingCount?: number;
    googleMapsUri?: string;
    websiteUri?: string;
    nationalPhoneNumber?: string;
  }[]).map((p) => ({
    placeId: p.id || "",
    name: p.displayName?.text || "Untitled",
    address: p.formattedAddress || "",
    rating: p.rating,
    ratings: p.userRatingCount,
    mapsUrl: p.googleMapsUri || "",
    website: p.websiteUri,
    phone: p.nationalPhoneNumber,
  }));
}
