import type { LabelFont } from "./fonts";

export type Units = "ft" | "m";
export type PlanRole = "ceremony" | "cocktail" | "reception" | "rehearsal" | "custom";
/** @deprecated use PlanRole — kept for catalog presets */
export type PlanKind = PlanRole;
export type VenueShape = "rect" | "l" | "polygon";
export type LCorner = "nw" | "ne" | "sw" | "se";
export type { LabelFont };

export const MAX_PLANS = 4;

export const PLAN_PRESETS: { role: PlanRole; name: string; blurb: string }[] = [
  { role: "ceremony", name: "Ceremony", blurb: "Aisle, altar, seats" },
  { role: "cocktail", name: "Cocktail", blurb: "High-tops, bar, lounge" },
  { role: "reception", name: "Reception", blurb: "Dinner, dance, cake" },
  { role: "rehearsal", name: "Rehearsal dinner", blurb: "Intimate dinner the night before" },
];

export type AssetKind =
  | "table-round"
  | "table-square"
  | "table-rect"
  | "table-oval"
  | "table-sweetheart"
  | "table-head"
  | "table-cocktail"
  | "table-cake"
  | "table-gift"
  | "table-guestbook"
  | "table-buffet"
  | "stage"
  | "dj"
  | "bar"
  | "dance-floor"
  | "altar"
  | "arch"
  | "aisle"
  | "pew-row"
  | "chair-row"
  | "entrance"
  | "restroom"
  | "pillar"
  | "plant"
  | "photo-booth"
  | "lounge"
  | "fireplace"
  | "window"
  | "kitchen"
  | "coat-check"
  | "label";

export interface Point {
  x: number;
  y: number;
}

export interface Underlay {
  opacity: number;
  scale: number;
  x: number;
  y: number;
  rotation: number;
}

export interface Venue {
  widthIn: number;
  lengthIn: number;
  shape: VenueShape;
  lCutWidthIn: number;
  lCutLengthIn: number;
  lCorner: LCorner;
  polygon: Point[];
  underlay: Underlay | null;
  floorColor: string;
  venueName: string;
  street: string;
  city: string;
  state: string;
  zip: string;
}

export interface PlacedItem {
  id: string;
  kind: AssetKind;
  x: number;
  y: number;
  rotation: number;
  widthIn: number;
  heightIn: number;
  label: string;
  number: number | null;
  seatCount: number;
  seatsOnEnds: boolean;
  locked: boolean;
  font: LabelFont;
  fontSizeIn: number;
  color: string;
  bgColor: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strike: boolean;
  seats: SeatAssignment[];
  archIn: number;
  reserved: boolean;
  reservedFor: string;
}

export interface Guest {
  id: string;
  name: string;
  party?: string;
  notes?: string;
}

export interface SeatAssignment {
  seat: number;
  name: string;
  guestId: string | null;
}

export interface Plan {
  id: string;
  name: string;
  role: PlanRole;
  venue: Venue;
  items: PlacedItem[];
  gridVisible: boolean;
  snap: boolean;
  showDimensions: boolean;
  showWarnings: boolean;
}

export interface Project {
  version: 2;
  name: string;
  units: Units;
  expectedGuests: number;
  guests: Guest[];
  plans: Plan[];
}

export interface SeatPose {
  index: number;
  x: number;
  y: number;
  rotation: number;
}

export type ToolMode = "select" | "pan" | "stamp" | "underlay";
