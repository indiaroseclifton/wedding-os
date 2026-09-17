export const BUDGET_PHASES = [
  {
    id: "budget",
    label: "Budget",
    line: "A number in mind. The split can wait.",
  },
  {
    id: "booked",
    label: "Booked",
    line: "Deposits are out. People have a yes.",
  },
  {
    id: "additions",
    label: "Additions",
    line: "The plan exists. Extra things land on it.",
  },
  {
    id: "crunch",
    label: "Crunch",
    line: "Close the last decisions and the last payments.",
  },
] as const;

export type BudgetPhaseId = (typeof BUDGET_PHASES)[number]["id"];

export type BudgetOption = {
  id: string;
  label: string;
  amount: number;
};

export type BudgetAlternative = {
  id: string;
  title: string;
  options: BudgetOption[];
  agreedId: string;
};

export function phaseCopy(id: BudgetPhaseId) {
  return BUDGET_PHASES.find((p) => p.id === id) || BUDGET_PHASES[0];
}

export function suggestPhase(input: {
  budget: number;
  now: number;
  agreed: number;
  lineCount: number;
}): BudgetPhaseId {
  if (!input.budget && !input.lineCount) return "budget";
  if (input.now <= 0 && input.agreed <= 0) return "budget";
  if (input.budget && input.agreed / input.budget >= 0.88) return "crunch";
  if (input.now > 0 && input.lineCount > 8) return "additions";
  if (input.now > 0 || input.agreed > 0) return "booked";
  return "budget";
}

export function chosenAmount(alt: BudgetAlternative, pickId?: string) {
  const id = pickId || alt.agreedId;
  const hit = alt.options.find((o) => o.id === id);
  return hit?.amount || 0;
}

export function whatIfTotal(
  agreed: number,
  alts: BudgetAlternative[],
  picks: Record<string, string>,
) {
  let next = agreed;
  for (const alt of alts) {
    const from = chosenAmount(alt, alt.agreedId);
    const to = chosenAmount(alt, picks[alt.id] || alt.agreedId);
    next += to - from;
  }
  return next;
}

export function emptyAlternative(): BudgetAlternative {
  return {
    id: `alt-${Date.now()}`,
    title: "",
    agreedId: "a",
    options: [
      { id: "a", label: "Option A", amount: 0 },
      { id: "b", label: "Option B", amount: 0 },
    ],
  };
}
