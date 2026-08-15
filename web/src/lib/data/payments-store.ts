import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

const dataDir = path.join(process.cwd(), ".data");
const paymentsFile = path.join(dataDir, "payments.json");

export type PaymentKind = "DEPOSIT" | "FINAL" | "OTHER";

export type PaymentItem = {
  id: string;
  workspaceId: string;
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
  await fs.mkdir(dataDir, { recursive: true });
  try {
    return JSON.parse(await fs.readFile(paymentsFile, "utf8"));
  } catch {
    return [];
  }
}

async function writeJson(rows: PaymentItem[]) {
  await fs.writeFile(paymentsFile, JSON.stringify(rows, null, 2), "utf8");
}

function normalize(row: PaymentItem): PaymentItem {
  return {
    ...row,
    kind: row.kind || (row.label?.toLowerCase().includes("final") ? "FINAL" : row.label?.toLowerCase().includes("deposit") ? "DEPOSIT" : "OTHER"),
  };
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
