export type ClauseMark = "good" | "flag" | "skip";

export const CONTRACT_CLAUSES = [
  {
    id: "deposit",
    label: "Deposit & payment schedule",
    good: "25–50% at signing, dated balance",
    flag: "100% up front or cash only",
  },
  {
    id: "cancel",
    label: "Cancel / refund",
    good: "Tiered by notice; they refund if they cancel",
    flag: "100% gone, or silent if they cancel",
  },
  {
    id: "force",
    label: "Force majeure / postpone",
    good: "Weather, venue shut, pandemic — remedy listed",
    flag: "They can walk for any reason",
  },
  {
    id: "insurance",
    label: "Liability / COI",
    good: "They carry insurance and will send a COI",
    flag: "Not liable for anything",
  },
  {
    id: "who",
    label: "Who shows up",
    good: "Named lead; substitute needs your yes",
    flag: "Anyone they send",
  },
  {
    id: "overtime",
    label: "Hours & overtime",
    good: "Start–end + $/hr",
    flag: "Hours vague",
  },
  {
    id: "deliver",
    label: "Deliverables",
    good: "Counts, format, date",
    flag: "Vague — “a beautiful day”",
  },
  {
    id: "exclusive",
    label: "Exclusivity",
    good: "Told before the deposit",
    flag: "Forced in-house after booking",
  },
  {
    id: "release",
    label: "Photos / portfolio use",
    good: "Defined uses; you can say no",
    flag: "Unlimited, non-negotiable",
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
