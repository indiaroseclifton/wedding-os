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

export default async function DashboardPage() {
  const session = await getSessionUser();
  const { workspace } = await ensureDemoWorkspace();
  const [tasks, guests, decisions, vendors, packages] = await Promise.all([
    getWorkspaceTasks(workspace.id),
    getWorkspaceGuests(workspace.id),
    getWorkspaceDecisions(workspace.id),
    listVendors(workspace.id),
    listPackages(workspace.id),
  ]);

  const openTasks = tasks.filter((t) => t.status !== "DONE").length;
  const headcount = guests.reduce((sum, g) => {
    if (g.rsvp === "NO") return sum;
    return sum + 1 + (g.plusOnes || 0);
  }, 0);
  const booked = vendors.filter((v) =>
    ["BOOKED", "PAID_DEPOSIT", "DONE"].includes(v.status)
  ).length;
  const decided = decisions.filter((d) => d.status === "DECIDED").length;

  const cards = [
    { href: "/tasks", label: "Open tasks", value: String(openTasks) },
    { href: "/guests", label: "Guests", value: String(guests.length) },
    { href: "/guests", label: "Headcount", value: String(headcount) },
    { href: "/vendors", label: "Vendors booked", value: String(booked) },
    { href: "/decisions", label: "Decisions locked", value: String(decided) },
    { href: "/handoffs", label: "Handoff packages", value: String(packages.length) },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-600">
          Welcome{session ? `, ${session.name}` : ""}. {workspace.name}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {cards.map((c) => (
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
          <p className="font-medium text-slate-900">Keep moving</p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-slate-600">
            <li>
              <Link href="/decisions/priorities" className="underline">
                Align on priorities
              </Link>
            </li>
            <li>
              <Link href="/handoffs/new" className="underline">
                Create a DJ or day-of handoff
              </Link>
            </li>
            <li>
              <Link href="/seating" className="underline">
                Seat remaining guests
              </Link>
            </li>
          </ul>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm">
          <p className="font-medium text-slate-900">Shortcuts</p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-slate-600">
            <li>
              <Link href="/guests/import" className="underline">
                Import guest CSV
              </Link>
            </li>
            <li>
              <Link href="/music" className="underline">
                Must-play / do-not-play
              </Link>
            </li>
            <li>
              <Link href="/polls" className="underline">
                Start a quick poll
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
