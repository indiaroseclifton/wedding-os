import path from "path";
import { randomUUID } from "crypto";
import { dataDir, ensureDir, readText, writeText } from "./store-io";

const paymentsFile = path.join(dataDir, "payments.json");

export type PaymentKind = "DEPOSIT" | "FINAL" | "OTHER";

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
        : row.label?.toLowerCase().includes("deposit")
          ? "DEPOSIT"
          : "OTHER"),
  };
}

/** Group key: prefer vendor id so a rename does not split the vendor's payments. */
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
  notes?: string;
  kind?: PaymentKind;
}) {
  const rows = await readJson();
  const kind =
    input.kind ||
    (input.label.toLowerCase().includes("final")
      ? "FINAL"
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
  Object.assign(row, patch);
  if (patch.status === "PAID" && !row.paidAt) {
    row.paidAt = new Date().toISOString();
  }
  if (patch.status && patch.status !== "PAID") {
    row.paidAt = undefined;
  }
  await writeJson(rows);
  return normalize(row);
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
    label: input.kind === "DEPOSIT" ? "Deposit" : input.kind === "FINAL" ? "Final" : "Payment",
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
