import Link from "next/link";
import { getSessionUser } from "@/lib/auth/session";
import {
  ensureDemoWorkspace,
  getWorkspaceGuests,
  getWorkspaceTasks,
  getWorkspaceDecisions,
} from "@/lib/data/workspace";
import { listVendors } from "@/lib/data/vendors-store";
import { listPackages } from "@/lib/data/handoffs-store";
import { listPayments } from "@/lib/data/payments-store";
import { SeedButton } from "./SeedButton";

function taskOverdue(dueDate?: string, status?: string) {
  if (!dueDate || status === "DONE") return false;
  const due = new Date(dueDate);
  if (Number.isNaN(due.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return due < today;
}

export default async function DashboardPage() {
  const session = await getSessionUser();
  const { workspace } = await ensureDemoWorkspace();
  const [tasks, guests, decisions, vendors, packages, payments] = await Promise.all([
    getWorkspaceTasks(workspace.id),
    getWorkspaceGuests(workspace.id),
    getWorkspaceDecisions(workspace.id),
    listVendors(workspace.id),
    listPackages(workspace.id),
    listPayments(workspace.id),
  ]);

  const openTasks = tasks.filter((t) => t.status !== "DONE").length;
  const overdueTasks = tasks.filter((t) => taskOverdue(t.dueDate, t.status)).length;
  const headcount = guests.reduce((sum, g) => {
    if (g.rsvp === "NO") return sum;
    return sum + 1 + (g.plusOnes || 0);
  }, 0);
  const booked = vendors.filter((v) =>
    ["BOOKED", "PAID_DEPOSIT", "DONE"].includes(v.status)
  ).length;
  const overduePay = payments.filter((p) => {
    if (p.status === "PAID") return false;
    if (p.status === "OVERDUE") return true;
    if (!p.dueDate) return false;
    const due = new Date(p.dueDate);
    if (Number.isNaN(due.getTime())) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return due < today;
  }).length;

  const hasSeed = guests.length > 0 || vendors.length > 0 || tasks.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-600">
            Welcome{session ? `, ${session.name}` : ""}. {workspace.name}
          </p>
        </div>
        <SeedButton />
      </div>

      <div className="rounded-xl border border-slate-900 bg-slate-900 p-4 text-white">
        <p className="text-sm font-semibold">Milestone A happy path</p>
        <p className="mt-1 text-xs text-slate-300">
          Seed → decisions → guests → catering/DJ handoffs → party day-of.
          Phase 2 modules can wait.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {!hasSeed && (
            <span className="rounded-lg bg-white/10 px-3 py-1.5 text-xs">
              Start with Load sample data
            </span>
          )}
          <Link
            href="/demo"
            className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-slate-900"
          >
            Open demo walkthrough
          </Link>
        </div>
      </div>

      {(overdueTasks > 0 || overduePay > 0) && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
          Attention:{" "}
          {overdueTasks > 0 && (
            <Link href="/tasks" className="underline">
              {overdueTasks} overdue task{overdueTasks === 1 ? "" : "s"}
            </Link>
          )}
          {overdueTasks > 0 && overduePay > 0 && " · "}
          {overduePay > 0 && (
            <Link href="/payments" className="underline">
              {overduePay} overdue payment{overduePay === 1 ? "" : "s"}
            </Link>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {[
          { href: "/tasks", label: "Open tasks", value: String(openTasks) },
          { href: "/guests", label: "Guests", value: String(guests.length) },
          { href: "/guests", label: "Headcount", value: String(headcount) },
          { href: "/vendors", label: "Vendors booked", value: String(booked) },
          { href: "/decisions", label: "Decisions", value: String(decisions.length) },
          { href: "/handoffs", label: "Handoffs", value: String(packages.length) },
        ].map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="rounded-xl border border-slate-200 bg-white p-4 hover:bg-slate-50"
          >
            <p className="text-2xl font-semibold">{c.value}</p>
            <p className="text-xs text-slate-500">{c.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm">
          <p className="font-medium text-slate-900">Happy-path links</p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-slate-600">
            <li>
              <Link href="/demo" className="underline">
                Demo walkthrough
              </Link>
            </li>
            <li>
              <Link href="/dietary" className="underline">
                Dietary → catering
              </Link>
            </li>
            <li>
              <Link href="/handoffs/new" className="underline">
                New handoff
              </Link>
            </li>
            <li>
              <Link href="/party" className="underline">
                Party portal
              </Link>
            </li>
          </ul>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm">
          <p className="font-medium text-slate-900">Phase 2 (later)</p>
          <p className="mt-2 text-slate-600">
            Deeper seating studio, e-sign contracts, AI media, multi-event budgets,
            production auth, and Neon as the default store.
          </p>
        </div>
      </div>
    </div>
  );
}
