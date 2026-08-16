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

export function vibeMatchesStyles(vibe: string | undefined, styles: string[]) {
  if (!vibe) return true;
  const keys = VIBE_KEYS[vibe];
  if (!keys?.length) return true;
  return styles.some((s) => keys.some((k) => s.toLowerCase().includes(k)));
}

export function playbookFitsVibe(slug: string, vibe?: string) {
  if (!vibe) return true;
  const list = PLAYBOOK_VIBES[slug];
  if (!list) return true;
  return list.includes(vibe);
}
