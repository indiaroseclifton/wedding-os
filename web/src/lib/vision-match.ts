export const VIBE_KEYS: Record<string, string[]> = {
  "Romantic classic": ["romantic", "classic", "estate", "garden"],
  "Modern minimal": ["modern", "minimal", "editorial", "city"],
  "Garden / outdoor": ["garden", "outdoor", "wild", "estate"],
  "City chic": ["city", "modern", "editorial", "loft"],
  "Rustic warm": ["rustic", "warm", "barn", "wood"],
  "Bold & colorful": ["bold", "colorful", "maximal"],
};

export const PLAYBOOK_VIBES: Record<string, string[]> = {
  flowers: ["Romantic classic", "Garden / outdoor", "Rustic warm", "Bold & colorful"],
  "table-decor": ["Romantic classic", "Modern minimal", "Garden / outdoor", "City chic"],
  signage: ["Modern minimal", "City chic", "Rustic warm"],
  lighting: ["City chic", "Modern minimal", "Garden / outdoor"],
  cake: ["Romantic classic", "Modern minimal", "Bold & colorful"],
  backdrop: ["Romantic classic", "Garden / outdoor", "Rustic warm"],
  favors: ["Modern minimal", "City chic", "Rustic warm"],
  "welcome-bags": ["City chic", "Garden / outdoor"],
  bar: ["City chic", "Modern minimal", "Bold & colorful"],
  "cake-table": ["Romantic classic", "Garden / outdoor"],
};

export function vibeMatchesStyles(vibe?: string, styles: string[] = [], venueType?: string) {
  const hay = styles.map((s) => s.toLowerCase());
  const vibeKeys = vibe ? VIBE_KEYS[vibe] : undefined;
  const vibeHit = !vibeKeys?.length || hay.some((s) => vibeKeys.some((k) => s.includes(k)));
  const placeWords = venueType?.toLowerCase().split(/[^a-z]+/).filter((w) => w.length > 2) || [];
  const placeHit = !placeWords.length || hay.some((s) => placeWords.some((w) => s.includes(w)));
  if (!vibe && !venueType) return true;
  if (vibe && venueType) return vibeHit || placeHit;
  if (vibe) return vibeHit;
  return placeHit;
}

export function playbookFitsVibe(slug: string, vibe?: string) {
  if (!vibe) return true;
  const list = PLAYBOOK_VIBES[slug];
  if (!list) return true;
  return list.includes(vibe);
}
