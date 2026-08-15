import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

const dataDir = path.join(process.cwd(), ".data");
const paymentsFile = path.join(dataDir, "payments.json");

export type PaymentItem = {
  id: string;
  workspaceId: string;
  vendorName: string;
  label: string;
  amount: number;
  dueDate?: string;
  status: "UPCOMING" | "DUE" | "PAID" | "OVERDUE";
  contractLink?: string;
  notes?: string;
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

export async function listPayments(workspaceId: string) {
  return (await readJson())
    .filter((p) => p.workspaceId === workspaceId)
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
}) {
  const rows = await readJson();
  const row: PaymentItem = {
    id: randomUUID(),
    workspaceId: input.workspaceId,
    vendorName: input.vendorName,
    label: input.label,
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

export async function patchPayment(
  id: string,
  patch: Partial<PaymentItem>
) {
  const rows = await readJson();
  const row = rows.find((p) => p.id === id);
  if (!row) return null;
  Object.assign(row, patch);
  await writeJson(rows);
  return row;
}
