export type KnownStore = {
  id: string;
  name: string;
  match: RegExp;
  start: string;
  line: string;
};

export const KNOWN_STORES: KnownStore[] = [
  { id: "zola", name: "Zola", match: /zola\.com/i, start: "https://www.zola.com/registry", line: "Cash, honeymoon, and the list." },
  { id: "amazon", name: "Amazon", match: /amazon\./i, start: "https://www.amazon.com/wedding/home", line: "Ships to the door." },
  { id: "bloomingdales", name: "Bloomingdale’s", match: /bloomingdale/i, start: "https://www.bloomingdales.com/registry/wedding/registryhome", line: "The registry desk." },
  { id: "anthropologie", name: "Anthropologie", match: /anthropologie/i, start: "https://www.anthropologie.com/registry", line: "Table and house." },
  { id: "macys", name: "Macy’s", match: /macys\.com/i, start: "https://www.macys.com/registry/wedding", line: "The department floor." },
  { id: "target", name: "Target", match: /target\.com/i, start: "https://www.target.com/gift-registry", line: "Everyday and the big pieces." },
  { id: "etsy", name: "Etsy", match: /etsy\.com/i, start: "https://www.etsy.com/wedding", line: "Made by someone." },
];

export function detectStore(url: string): KnownStore | null {
  return KNOWN_STORES.find((s) => s.match.test(url)) || null;
}

export function storeNameFromUrl(url: string, fallback = "") {
  return detectStore(url)?.name || fallback || hostLabel(url);
}

export function hostLabel(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "Store";
  }
}

export function zolaKey(url: string): string | null {
  try {
    const u = new URL(url);
    if (!/zola\.com$/i.test(u.hostname.replace(/^www\./, ""))) return null;
    const parts = u.pathname.split("/").filter(Boolean);
    const at = parts.indexOf("registry");
    if (at >= 0 && parts[at + 1]) return parts[at + 1];
    if (parts[0] === "wedding" && parts[2] === "registry" && parts[1]) return parts[1];
    return null;
  } catch {
    return null;
  }
}
