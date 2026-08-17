export type DecorBuild = {
  id: string;
  title: string;
  line: string;
  time: string;
  people: number;
  difficulty: "Easy" | "Medium" | "Hard";
  materials: { item: string; qty: string }[];
  jobs: { task: string; role: string }[];
};

export const DECOR_BUILDS: DecorBuild[] = [
  {
    id: "drape",
    title: "Draped sweetheart backdrop",
    line: "Stands, chiffon, a floral cage. Three people, one afternoon.",
    time: "2h 15m",
    people: 3,
    difficulty: "Medium",
    materials: [
      { item: "Backdrop stands", qty: "3" },
      { item: "Ivory chiffon", qty: "8 yards" },
      { item: "Floral cages", qty: "2" },
      { item: "Zip ties", qty: "48" },
      { item: "Command hooks", qty: "6" },
      { item: "Safety pins", qty: "2 packs" },
      { item: "LED uplights", qty: "4" },
    ],
    jobs: [
      { task: "Assemble the frame", role: "Someone tall" },
      { task: "Steam and pin the drape", role: "Two hands" },
      { task: "Florals on the cages", role: "Whoever did the bowls" },
    ],
  },
  {
    id: "aisle",
    title: "Aisle markers",
    line: "Jars or buckets, one hardy green, a ribbon. Not a meadow unless you mean it.",
    time: "1h",
    people: 2,
    difficulty: "Easy",
    materials: [
      { item: "Jars or buckets", qty: "16" },
      { item: "Eucalyptus or olive bunches", qty: "8" },
      { item: "Ribbon", qty: "20 yards" },
      { item: "Sand or stones for weight", qty: "1 bag" },
    ],
    jobs: [
      { task: "Wash and dry vessels", role: "Anyone" },
      { task: "Green and ribbon", role: "Two hands" },
    ],
  },
  {
    id: "welcome",
    title: "Welcome sign on an easel",
    line: "Print or Cricut the words. The easel is the thing people forget.",
    time: "45m",
    people: 1,
    difficulty: "Easy",
    materials: [
      { item: "Easel", qty: "1" },
      { item: "Foam board or mirror", qty: "1" },
      { item: "Vinyl or printed sheet", qty: "1" },
      { item: "Transfer tape", qty: "1 roll" },
    ],
    jobs: [{ task: "Weed, transfer, stand it up", role: "One patient person" }],
  },
];
