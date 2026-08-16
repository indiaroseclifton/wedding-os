export type VendorCheckItem = { id: string; title: string; done: boolean };

type Template = { category: string; items: string[] };

const TEMPLATES: Template[] = [
  {
    category: "Venue",
    items: [
      "Date held in writing (not just a phone yes)",
      "Ceremony + reception rooms confirmed",
      "Rain plan written, not verbal",
      "Hard stop / noise curfew in the contract",
      "What’s included: tables, chairs, linens, lighting",
      "What’s extra: overtime, cake cutting, corkage",
      "Load-in and load-out times for vendors",
      "Preferred / required vendor list",
      "Insurance (COI) required — whose names",
      "Parking, valet, or shuttle plan",
      "Getting-ready rooms",
      "Floor plan due date",
      "Final guest count deadline",
      "Deposit + remaining payment dates",
    ],
  },
  {
    category: "Photographer",
    items: [
      "Hours of coverage match first-look vs no first-look",
      "Second shooter yes/no",
      "Engagement session included?",
      "Must-have shot list sent",
      "Family groupings written (not “we’ll see”)",
      "Unplugged ceremony — they’ll prompt guests?",
      "Turnaround time for previews and full gallery",
      "Raw files? Print rights?",
      "Album included or extra",
      "Backup camera + cards confirmed",
      "Meal for them on the timeline",
      "Handoff packet sent (timeline + contacts)",
    ],
  },
  {
    category: "Videographer",
    items: [
      "Highlight length + full ceremony/speeches",
      "Same hours as photographer?",
      "Drone allowed at the venue?",
      "Audio: ceremony mics, speeches",
      "Same-day teaser?",
      "Delivery format and rights",
      "Meal on the timeline",
      "Handoff packet sent",
    ],
  },
  {
    category: "Florist",
    items: [
      "Must-have flowers vs budget swaps",
      "Allergies (you, party, guests of honor)",
      "Personal flowers list: bouquet, bout, corsage, toss?",
      "Ceremony pieces reused at reception?",
      "Delivery time and who receives them",
      "Vases / stands — theirs or rentals",
      "Candle policy at the venue",
      "Breakdown: who takes what home",
      "Week-of weather swap plan",
      "Final count after RSVPs",
    ],
  },
  {
    category: "Catering",
    items: [
      "Plated / buffet / stations locked",
      "Tasting scheduled",
      "Kids meals + vendor meals counted",
      "Dietary list sent (veg, GF, nut, etc.)",
      "Cake cutting fee or they do dessert",
      "Service staff count vs guest count",
      "Bar: whose license, last call",
      "China / glass / flatware — them or rental",
      "Leftovers policy",
      "Final headcount deadline (usually 7–14 days)",
      "Overtime rate if speeches run long",
    ],
  },
  {
    category: "DJ / Band",
    items: [
      "Ceremony, cocktail, and reception — one act or split",
      "Cue sheet: processional, first dance, last dance",
      "Must-play list sent",
      "Do-not-play list sent",
      "MC or someone else announces",
      "Microphone for vows and speeches",
      "Hard-stop time in writing",
      "Power / stage plot from venue",
      "Overtime rate",
      "Meal on the timeline",
      "Handoff packet sent",
    ],
  },
  {
    category: "Cake",
    items: [
      "Flavor + filling locked after tasting",
      "Guest count vs “display + sheet”",
      "Delivery time and who sets it",
      "Cake stand — theirs or yours",
      "Topper, flowers, or they decorate",
      "Venue cake-cutting fee",
      "Leftovers / top tier boxed",
    ],
  },
  {
    category: "Hair / Makeup",
    items: [
      "Trial booked (same season as the wedding)",
      "Party count + start time backwards from photos",
      "On-site or salon — parking / room",
      "Touch-up kit for the day",
      "Who pays for the party",
      "Photos of the look you want",
    ],
  },
  {
    category: "Planner",
    items: [
      "Month-of vs full planning vs day-of only",
      "How many planning meetings",
      "Who they talk to (you, parents, vendors)",
      "They attend the rehearsal?",
      "Emergency kit and vendor tips — who handles",
      "Final week timeline they own",
    ],
  },
  {
    category: "Officiant",
    items: [
      "Legal in this county",
      "Meeting / counseling required?",
      "Script: traditional, written vows, mix",
      "Unity ritual?",
      "Rehearsal attendance",
      "License: who files it after",
    ],
  },
  {
    category: "Rentals",
    items: [
      "Floor plan matches chair/table count",
      "Linens, napkins, chargers listed",
      "Lighting / tent / heater if outdoor",
      "Delivery window and who signs",
      "Pickup the next morning — who’s there",
      "Damage waiver / weather",
    ],
  },
  {
    category: "Transportation",
    items: [
      "Who rides with whom (you two vs party vs guests)",
      "Pickup times from getting-ready",
      "Ceremony → photos → reception",
      "Guest shuttle loop + last run",
      "Decor allowed in the car?",
      "Overtime / wait time",
    ],
  },
  {
    category: "Hotel block",
    items: [
      "Room count vs out-of-town RSVPs",
      "Cutoff date on the guest site",
      "Code + booking link live",
      "Welcome bags — front desk or you",
      "Breakfast / shuttle from the hotel",
    ],
  },
];

const ALIAS: Record<string, string> = {
  Photo: "Photographer",
  Photography: "Photographer",
  Video: "Videographer",
  Videography: "Videographer",
  Flowers: "Florist",
  Caterer: "Catering",
  Food: "Catering",
  DJ: "DJ / Band",
  Band: "DJ / Band",
  "DJ / Band": "DJ / Band",
  Bakery: "Cake",
  Dessert: "Cake",
  "Hair and makeup": "Hair / Makeup",
  HMUA: "Hair / Makeup",
  Coordinator: "Planner",
  "Day-of": "Planner",
  Celebrant: "Officiant",
  Chairs: "Rentals",
  Linens: "Rentals",
  Shuttle: "Transportation",
  Limo: "Transportation",
  Hotel: "Hotel block",
};

export function templateCategory(category: string) {
  const key = ALIAS[category] || category;
  return TEMPLATES.find((t) => t.category === key)?.category || key;
}

export function templateFor(category: string): string[] {
  const key = templateCategory(category);
  return TEMPLATES.find((t) => t.category === key)?.items || GENERIC;
}

const GENERIC = [
  "Contract signed and filed",
  "Deposit paid, receipt saved",
  "Date, hours, and address confirmed",
  "What’s included vs extra — in writing",
  "Cancellation / weather clause read",
  "Day-of contact name + number",
  "Handoff or timeline sent",
  "Final payment date on the calendar",
];

export function seedChecklist(category: string): VendorCheckItem[] {
  return templateFor(category).map((title, i) => ({
    id: `c${i + 1}`,
    title,
    done: false,
  }));
}

export const VENDOR_CHECKLIST_TEMPLATES = TEMPLATES;
