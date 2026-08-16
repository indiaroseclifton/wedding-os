import path from "path";
import { randomUUID } from "crypto";
import { dataDir, ensureDir, readText, writeText } from "./store-io";

const paymentsFile = path.join(dataDir, "payments.json");

export type PaymentKind = "DEPOSIT" | "PROGRESS" | "FINAL" | "OTHER";

export type PaymentItem = {
  id: string;
  workspaceId: string;
  vendorId?: string;
  vendorName: string;
  label: string;
  kind: PaymentKind;
  amount: number;
  dueDate?: string;
  status: "UPCOMING" | "DUE" | "PAID" | "OVERDUE";
  contractLink?: string;
  receiptUrl?: string;
  notes?: string;
  paidAt?: string;
  createdAt: string;
};

async function readJson(): Promise<PaymentItem[]> {
  await ensureDir();
  try {
    return JSON.parse(await readText(paymentsFile));
  } catch {
    return [];
  }
}

async function writeJson(rows: PaymentItem[]) {
  await writeText(paymentsFile, JSON.stringify(rows, null, 2));
}

function normalize(row: PaymentItem): PaymentItem {
  return {
    ...row,
    kind:
      row.kind ||
      (row.label?.toLowerCase().includes("final")
        ? "FINAL"
        : row.label?.toLowerCase().includes("progress")
          ? "PROGRESS"
          : row.label?.toLowerCase().includes("deposit")
            ? "DEPOSIT"
            : "OTHER"),
  };
}

export function paymentVendorKey(p: Pick<PaymentItem, "vendorId" | "vendorName">) {
  return p.vendorId || `name:${p.vendorName}`;
}

export function resolvePaymentVendorName(
  p: Pick<PaymentItem, "vendorId" | "vendorName">,
  vendors: { id: string; name: string }[]
) {
  if (p.vendorId) {
    const match = vendors.find((v) => v.id === p.vendorId);
    if (match) return match.name;
  }
  return p.vendorName;
}

export function effectiveStatus(p: PaymentItem): PaymentItem["status"] {
  if (p.status === "PAID") return "PAID";
  if (!p.dueDate) return p.status === "OVERDUE" ? "OVERDUE" : p.status === "DUE" ? "DUE" : "UPCOMING";
  const due = new Date(p.dueDate);
  if (Number.isNaN(due.getTime())) return p.status;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (due < today) return "OVERDUE";
  const soon = new Date(today);
  soon.setDate(soon.getDate() + 14);
  if (due <= soon) return "DUE";
  return "UPCOMING";
}

export function paymentRollup(payments: PaymentItem[]) {
  let paid = 0;
  let open = 0;
  let overdue = 0;
  let next: PaymentItem | null = null;
  for (const p of payments) {
    const status = effectiveStatus(p);
    if (status === "PAID") paid += p.amount || 0;
    else {
      open += p.amount || 0;
      if (status === "OVERDUE") overdue += p.amount || 0;
      if (!next || (p.dueDate || "9999") < (next.dueDate || "9999")) next = p;
    }
  }
  return { paid, open, overdue, next, count: payments.length };
}

export async function listPayments(workspaceId: string) {
  return (await readJson())
    .filter((p) => p.workspaceId === workspaceId)
    .map(normalize)
    .sort((a, b) => (a.dueDate || "").localeCompare(b.dueDate || ""));
}

export async function addPayment(input: {
  workspaceId: string;
  vendorName: string;
  vendorId?: string;
  label: string;
  amount: number;
  dueDate?: string;
  contractLink?: string;
  receiptUrl?: string;
  notes?: string;
  kind?: PaymentKind;
}) {
  const rows = await readJson();
  const kind =
    input.kind ||
    (input.label.toLowerCase().includes("final")
      ? "FINAL"
      : input.label.toLowerCase().includes("progress")
        ? "PROGRESS"
        : input.label.toLowerCase().includes("deposit")
          ? "DEPOSIT"
          : "OTHER");
  const row: PaymentItem = {
    id: randomUUID(),
    workspaceId: input.workspaceId,
    vendorId: input.vendorId,
    vendorName: input.vendorName,
    label: input.label,
    kind,
    amount: input.amount,
    dueDate: input.dueDate,
    status: "UPCOMING",
    contractLink: input.contractLink,
    receiptUrl: input.receiptUrl,
    notes: input.notes,
    createdAt: new Date().toISOString(),
  };
  rows.push(row);
  await writeJson(rows);
  return row;
}

export async function patchPayment(id: string, patch: Partial<PaymentItem>) {
  const rows = await readJson();
  const row = rows.find((p) => p.id === id);
  if (!row) return null;
  const next: Partial<PaymentItem> = {};
  for (const [key, value] of Object.entries(patch) as [keyof PaymentItem, PaymentItem[keyof PaymentItem]][]) {
    if (value !== undefined) next[key] = value as never;
  }
  Object.assign(row, next);
  if (patch.status === "PAID" && !row.paidAt) {
    row.paidAt = new Date().toISOString();
  }
  if (patch.status && patch.status !== "PAID") {
    row.paidAt = undefined;
  }
  await writeJson(rows);
  return normalize(row);
}

export async function deletePayment(id: string) {
  const rows = await readJson();
  const next = rows.filter((p) => p.id !== id);
  if (next.length === rows.length) return false;
  await writeJson(next);
  return true;
}

export async function upsertVendorMilestone(input: {
  workspaceId: string;
  vendorId: string;
  vendorName: string;
  kind: PaymentKind;
  amount: number;
  dueDate?: string;
  contractLink?: string;
  status?: PaymentItem["status"];
}) {
  const rows = await readJson();
  const existing = rows.find(
    (p) =>
      p.workspaceId === input.workspaceId &&
      p.vendorId === input.vendorId &&
      normalize(p).kind === input.kind
  );
  if (existing) {
    existing.amount = input.amount;
    existing.vendorName = input.vendorName;
    if (input.dueDate !== undefined) existing.dueDate = input.dueDate || undefined;
    if (input.contractLink) existing.contractLink = input.contractLink;
    if (input.status) {
      existing.status = input.status;
      existing.paidAt =
        input.status === "PAID" ? existing.paidAt || new Date().toISOString() : undefined;
    }
    await writeJson(rows);
    return normalize(existing);
  }
  const created = await addPayment({
    workspaceId: input.workspaceId,
    vendorId: input.vendorId,
    vendorName: input.vendorName,
    label:
      input.kind === "DEPOSIT"
        ? "Deposit"
        : input.kind === "FINAL"
          ? "Final"
          : input.kind === "PROGRESS"
            ? "Progress"
            : "Payment",
    kind: input.kind,
    amount: input.amount,
    dueDate: input.dueDate,
    contractLink: input.contractLink,
  });
  if (input.status && input.status !== created.status) {
    return (await patchPayment(created.id, { status: input.status })) || created;
  }
  return created;
}

export function paymentsForVendor(
  payments: PaymentItem[],
  vendor: { id: string; name: string }
) {
  const name = vendor.name.toLowerCase();
  return payments.filter(
    (p) => p.vendorId === vendor.id || (!p.vendorId && p.vendorName.toLowerCase() === name)
  );
}

export function vendorMoneyHint(payments: PaymentItem[]): string {
  if (!payments.length) return "";
  const open = payments.filter((p) => p.status !== "PAID");
  const paid = payments.filter((p) => p.status === "PAID");
  if (!open.length) return paid.length > 1 ? "paid in full" : `${paid[0].label.toLowerCase()} paid`;
  const overdue = open.filter((p) => effectiveStatus(p) === "OVERDUE");
  if (overdue.length) {
    const amt = overdue.reduce((s, p) => s + (p.amount || 0), 0);
    return `${overdue.length} overdue · $${Math.round(amt).toLocaleString()}`;
  }
  const next = [...open].sort((a, b) => (a.dueDate || "9999").localeCompare(b.dueDate || "9999"))[0];
  if (next?.dueDate) return `${next.label} due ${next.dueDate}`;
  return `${open.length} open`;
}
