export const THEMES = [
  { id: "linen", label: "Linen", paper: "#f3efe6", moss: "#1c3d32", ink: "#12110f" },
  { id: "night", label: "Night", paper: "#121410", moss: "#c4a574", ink: "#f6f1e8" },
  { id: "garden", label: "Garden", paper: "#e7efe4", moss: "#2d5a3d", ink: "#142018" },
  { id: "blush", label: "Blush", paper: "#f6ebe8", moss: "#7a3d3d", ink: "#2a1816" },
  { id: "ink", label: "Ink", paper: "#1a1916", moss: "#eadec8", ink: "#f6f1e8" },
  { id: "champagne", label: "Champagne", paper: "#f4ead6", moss: "#8a6a3a", ink: "#2a2216" },
  { id: "fog", label: "Fog", paper: "#e8ecea", moss: "#4a5c58", ink: "#1a1e1d" },
  { id: "slate", label: "Slate", paper: "#e4e6ea", moss: "#2c3544", ink: "#12151a" },
  { id: "terracotta", label: "Terracotta", paper: "#f3e4d8", moss: "#9a4030", ink: "#2a1610" },
  { id: "olive", label: "Olive", paper: "#ece8d4", moss: "#4a4a28", ink: "#1c1c10" },
  { id: "cocoa", label: "Cocoa", paper: "#1c1612", moss: "#d4b896", ink: "#f6efe6" },
  { id: "midnight", label: "Midnight", paper: "#0e1420", moss: "#8aa4c8", ink: "#eef2f8" },
] as const;

export type ThemeId = (typeof THEMES)[number]["id"];

export const FAITHS = [
  { id: "none", label: "No religious ceremony", packs: [] as string[] },
  { id: "secular", label: "Secular / civil", packs: ["secular"] },
  { id: "christian", label: "Christian", packs: ["christian_general"] },
  { id: "catholic", label: "Catholic", packs: ["catholic"] },
  { id: "jewish", label: "Jewish", packs: ["jewish"] },
  { id: "hindu", label: "Hindu", packs: ["hindu"] },
  { id: "muslim", label: "Muslim", packs: ["muslim"] },
  { id: "chinese", label: "Chinese traditions", packs: ["chinese"] },
  { id: "hispanic", label: "Hispanic / Latin", packs: ["hispanic"] },
  { id: "greek_orthodox", label: "Greek Orthodox", packs: ["greek_orthodox"] },
  { id: "interfaith", label: "Interfaith (pick packs below)", packs: [] as string[] },
] as const;

export type FaithId = (typeof FAITHS)[number]["id"];

export const PACK_OPTIONS = [
  { id: "jewish", name: "Jewish" },
  { id: "hindu", name: "Hindu" },
  { id: "muslim", name: "Muslim" },
  { id: "catholic", name: "Catholic" },
  { id: "christian_general", name: "Christian" },
  { id: "chinese", name: "Chinese" },
  { id: "hispanic", name: "Hispanic / Latin" },
  { id: "greek_orthodox", name: "Greek Orthodox" },
  { id: "secular", name: "Secular / civil" },
] as const;

export const COVER_PRESETS = [
  { id: "tablescape", url: "/brand/tablescape.jpg", label: "Table" },
  { id: "garden", url: "/brand/garden.jpg", label: "Garden" },
  { id: "setting", url: "/brand/setting.jpg", label: "Setting" },
  { id: "flowers", url: "/brand/flowers.jpg", label: "Flowers" },
  { id: "candles", url: "/brand/candles.jpg", label: "Candles" },
  { id: "paper", url: "/brand/paper.jpg", label: "Paper" },
] as const;

export const GLASS_LEVELS = [
  { id: "low", label: "Matte" },
  { id: "mid", label: "Glass" },
  { id: "high", label: "Frost" },
] as const;

export const DENSITY = [
  { id: "roomy", label: "Roomy" },
  { id: "regular", label: "Regular" },
  { id: "compact", label: "Compact" },
] as const;

export const TYPE_SCALES = [
  { id: "small", label: "Small" },
  { id: "regular", label: "Regular" },
  { id: "large", label: "Large" },
] as const;

export type WorkspacePrefs = {
  theme?: ThemeId;
  faith?: FaithId;
  faithPacks?: string[];
  ceremonyStyle?: "religious" | "civil" | "both";
  formality?: string;
  weekend?: string;
  partnerA?: string;
  partnerB?: string;
  kidsWelcome?: boolean;
  unplugged?: boolean;
  defaultPlusOnes?: number;
  timezone?: string;
  guestSitePublic?: boolean;
  onboarded?: boolean;
  firstWalkDone?: boolean;
  diyBias?: "hire" | "diy" | "mix";
  shape?: "us" | "small" | "weekend" | "two";
  enterHow?: "together" | "one-then" | "already" | "none";
  gatheringDate?: string;
  siteMode?: "invite" | "announce";
  glass?: "low" | "mid" | "high";
  density?: "roomy" | "regular" | "compact";
  typeScale?: "small" | "regular" | "large";
};

export function packsForFaith(faith?: string, extra?: string[]) {
  const row = FAITHS.find((f) => f.id === faith);
  const fromFaith = row?.packs || [];
  const more = extra || [];
  return Array.from(new Set([...fromFaith, ...more]));
}
