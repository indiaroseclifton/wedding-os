export const THEMES = [
  { id: "linen", label: "Linen", paper: "#f3efe6", moss: "#1c3d32", ink: "#12110f" },
  { id: "night", label: "Night", paper: "#121410", moss: "#c4a574", ink: "#f6f1e8" },
  { id: "garden", label: "Garden", paper: "#e7efe4", moss: "#2d5a3d", ink: "#142018" },
  { id: "blush", label: "Blush", paper: "#f6ebe8", moss: "#7a3d3d", ink: "#2a1816" },
  { id: "ink", label: "Ink", paper: "#1a1916", moss: "#eadec8", ink: "#f6f1e8" },
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
};

export function packsForFaith(faith?: string, extra?: string[]) {
  const row = FAITHS.find((f) => f.id === faith);
  const fromFaith = row?.packs || [];
  const more = extra || [];
  return Array.from(new Set([...fromFaith, ...more]));
}
