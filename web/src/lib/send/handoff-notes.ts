import { listPackages, SECTION_LABELS, type StoredPackage } from "@/lib/data/handoffs-store";
import type { StoredVendor } from "@/lib/data/vendors-store";

const TEMPLATE_MATCH: Record<string, RegExp> = {
  DJ: /dj|band|music/,
  PHOTOGRAPHER: /photo/,
  CATERING: /cater|food|bar/,
  FLORIST: /florist|floral|flower/,
  VENUE: /venue/,
  CAKE: /cake|dessert/,
  HMU: /hair|makeup|hmu|beauty/,
  TRANSPORT: /transport|limo|bus/,
  PLANNER: /planner|coord/,
  DAY_OF: /planner|coord|day.of/,
};

export function matchVendorToPackage(vendors: StoredVendor[], pkg: StoredPackage) {
  const email = pkg.recipientEmail?.trim().toLowerCase();
  if (email) {
    const byEmail = vendors.find((v) => v.email?.trim().toLowerCase() === email);
    if (byEmail) return byEmail;
  }
  const name = pkg.recipientName?.trim().toLowerCase();
  if (name) {
    const byName = vendors.find(
      (v) => v.name.toLowerCase() === name || v.contactName?.toLowerCase() === name
    );
    if (byName) return byName;
  }
  const re = TEMPLATE_MATCH[pkg.template];
  if (re) {
    const hit = vendors.find((v) => re.test(v.category.toLowerCase()));
    if (hit) return hit;
  }
  return null;
}

export function packageNoteText(pkg: StoredPackage) {
  return Object.entries(pkg.sections || {})
    .filter(([, v]) => v?.trim())
    .map(([k, v]) => `${SECTION_LABELS[k] || k}\n${v.trim()}`)
    .join("\n\n");
}

export async function findHandoffNote(workspaceId: string, vendor: StoredVendor) {
  const packages = await listPackages(workspaceId);
  const mine = packages.filter((p) => matchVendorToPackage([vendor], p)?.id === vendor.id);
  const best = mine.find((p) => p.status === "SHARED") || mine[0];
  if (!best) return "";
  return packageNoteText(best);
}
