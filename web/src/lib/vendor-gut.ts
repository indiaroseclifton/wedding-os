export const GUT_MARKS = ["yes", "maybe", "no"] as const;
export type GutMark = (typeof GUT_MARKS)[number];

export const GUT_LABEL: Record<GutMark, string> = {
  yes: "Yes",
  maybe: "Maybe",
  no: "No",
};

export function googleReviewUrl(name: string, city?: string) {
  const q = [name, city, "reviews"].filter(Boolean).join(" ");
  return `https://www.google.com/search?q=${encodeURIComponent(q)}`;
}
