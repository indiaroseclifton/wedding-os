export type ClauseMark = "good" | "flag" | "skip";

export const CONTRACT_CLAUSES = [
  {
    id: "deposit",
    label: "Deposit & payment schedule",
    good: "25–50% at signing, dated balance",
    flag: "100% up front or cash only",
    ask: "Please change the deposit so we are not paying 100% up front — 25–50% at signing and a dated balance is standard.",
  },
  {
    id: "cancel",
    label: "Cancel / refund",
    good: "Tiered by notice; they refund if they cancel",
    flag: "100% gone, or silent if they cancel",
    ask: "Please add a tiered cancel schedule, and refund us if you cancel.",
  },
  {
    id: "force",
    label: "Force majeure / postpone",
    good: "Weather, venue shut, pandemic — remedy listed",
    flag: "They can walk for any reason",
    ask: "Please add force majeure / postpone language (weather, venue shut) with a listed remedy.",
  },
  {
    id: "insurance",
    label: "Liability / COI",
    good: "They carry insurance and will send a COI",
    flag: "Not liable for anything",
    ask: "Please confirm you carry liability insurance and will send a COI naming us and the venue.",
  },
  {
    id: "who",
    label: "Who shows up",
    good: "Named lead; substitute needs your yes",
    flag: "Anyone they send",
    ask: "Please name the lead who will be there. A substitute should need our yes.",
  },
  {
    id: "overtime",
    label: "Hours & overtime",
    good: "Start–end + $/hr",
    flag: "Hours vague",
    ask: "Please write start–end hours and the overtime rate in dollars per hour.",
  },
  {
    id: "deliver",
    label: "Deliverables",
    good: "Counts, format, date",
    flag: "Vague — “a beautiful day”",
    ask: "Please list deliverables: counts, format, and the date we receive them.",
  },
  {
    id: "exclusive",
    label: "Exclusivity",
    good: "Told before the deposit",
    flag: "Forced in-house after booking",
    ask: "Please remove or disclose exclusivity before we pay a deposit.",
  },
  {
    id: "release",
    label: "Photos / portfolio use",
    good: "Defined uses; you can say no",
    flag: "Unlimited, non-negotiable",
    ask: "Please limit portfolio use and let us decline photos of guests or children.",
  },
] as const;

export type ClauseId = (typeof CONTRACT_CLAUSES)[number]["id"];

export type ContractReview = {
  signedAt?: string;
  depositRefundable?: "yes" | "no" | "partial" | "unknown";
  namedLead?: string;
  hours?: string;
  overtimeRate?: string;
  deliveryDate?: string;
  coiReceived?: boolean;
  clauses?: Partial<Record<ClauseId, ClauseMark>>;
  notes?: string;
  reviewedAt?: string;
};

const CLAUSE_IDS = new Set(CONTRACT_CLAUSES.map((c) => c.id));
const MARKS = new Set<ClauseMark>(["good", "flag", "skip"]);
const REFUND = new Set(["yes", "no", "partial", "unknown"]);

function clip(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export function sanitizeContractReview(input: unknown): ContractReview {
  const raw = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const clauses: ContractReview["clauses"] = {};
  if (raw.clauses && typeof raw.clauses === "object") {
    for (const [key, val] of Object.entries(raw.clauses as Record<string, unknown>)) {
      if (CLAUSE_IDS.has(key as ClauseId) && MARKS.has(val as ClauseMark)) {
        clauses[key as ClauseId] = val as ClauseMark;
      }
    }
  }
  const refund = String(raw.depositRefundable || "");
  return {
    signedAt: clip(raw.signedAt, 20) || undefined,
    depositRefundable: REFUND.has(refund)
      ? (refund as ContractReview["depositRefundable"])
      : "unknown",
    namedLead: clip(raw.namedLead, 80) || undefined,
    hours: clip(raw.hours, 40) || undefined,
    overtimeRate: clip(raw.overtimeRate, 40) || undefined,
    deliveryDate: clip(raw.deliveryDate, 20) || undefined,
    coiReceived: Boolean(raw.coiReceived),
    clauses,
    notes: clip(raw.notes, 2000) || undefined,
    reviewedAt: new Date().toISOString(),
  };
}

export function flagCount(review?: ContractReview | null) {
  if (!review?.clauses) return 0;
  return Object.values(review.clauses).filter((m) => m === "flag").length;
}

export function reviewHint(review?: ContractReview | null) {
  if (!review?.reviewedAt) return "";
  const n = flagCount(review);
  if (n === 1) return "1 contract flag";
  if (n > 1) return `${n} contract flags`;
  return "contract reviewed";
}

export function composeChangeEmail(
  vendorName: string,
  review: ContractReview,
  coupleNames = "The couple"
) {
  const flagged = CONTRACT_CLAUSES.filter((c) => review.clauses?.[c.id] === "flag");
  const lines = flagged.map((c, i) => `${i + 1}. ${c.label} — ${c.ask}`);
  const extra = [
    review.namedLead ? `Named lead we expect: ${review.namedLead}` : "",
    review.hours ? `Hours we understood: ${review.hours}` : "",
    review.overtimeRate ? `Overtime we understood: ${review.overtimeRate}` : "",
    review.notes || "",
  ].filter(Boolean);
  const body = [
    `Hi ${vendorName},`,
    "",
    `We're ${coupleNames}. Before we sign, please change the following:`,
    "",
    ...lines,
    extra.length ? "" : "",
    ...extra,
    "",
    "Happy to hop on a call if that's easier.",
    "",
    "Thank you,",
    coupleNames,
  ]
    .filter((l, i, a) => !(l === "" && a[i - 1] === ""))
    .join("\n");
  return {
    subject: `Contract changes before we sign — ${vendorName}`,
    body,
    count: flagged.length,
  };
}
