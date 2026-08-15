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

  const checklist = [
    {
      done: decisions.some((d) => d.type === "PRIORITIES"),
      label: "Set priorities together",
      href: "/decisions/priorities",
    },
    {
      done: decisions.some((d) => d.type === "STYLE_VIBE" || d.type === "STYLE"),
      label: "Agree style & vibe",
      href: "/decisions/style",
    },
    {
      done: guests.length > 0,
      label: "Start the guest list",
      href: "/guests/new",
    },
    {
      done: vendors.length > 0,
      label: "Add key vendors",
      href: "/vendors/new",
    },
    {
      done: packages.length > 0,
      label: "Create a handoff package",
      href: "/handoffs/new",
    },
  ];
  const remaining = checklist.filter((c) => !c.done).length;

  const cards = [
    { href: "/tasks", label: "Open tasks", value: String(openTasks) },
    { href: "/guests", label: "Guests", value: String(guests.length) },
    { href: "/guests", label: "Headcount", value: String(headcount) },
    { href: "/vendors", label: "Vendors booked", value: String(booked) },
    { href: "/decisions", label: "Decisions locked", value: String(decided) },
    { href: "/handoffs", label: "Handoffs", value: String(packages.length) },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-600">
          Welcome{session ? `, ${session.name}` : ""}. {workspace.name}
        </p>
      </div>

      {remaining > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm font-semibold text-slate-900">Getting started</p>
          <p className="mt-1 text-xs text-slate-500">{remaining} of {checklist.length} still open</p>
          <ul className="mt-3 space-y-2">
            {checklist.map((c) => (
              <li key={c.href} className="flex items-center justify-between text-sm">
                <span className={c.done ? "text-slate-400 line-through" : ""}>{c.label}</span>
                {!c.done ? (
                  <Link href={c.href} className="text-xs font-medium underline">
                    Start
                  </Link>
                ) : (
                  <span className="text-xs text-emerald-700">Done</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

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
          <p className="font-medium text-slate-900">Coordination</p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-slate-600">
            <li>
              <Link href="/dietary" className="underline">
                Dietary rollup for catering
              </Link>
            </li>
            <li>
              <Link href="/handoffs/new" className="underline">
                DJ / day-of handoff
              </Link>
            </li>
            <li>
              <Link href="/people" className="underline">
                Invite wedding party
              </Link>
            </li>
          </ul>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm">
          <p className="font-medium text-slate-900">Plan</p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-slate-600">
            <li>
              <Link href="/timeline" className="underline">
                Timeline milestones
              </Link>
            </li>
            <li>
              <Link href="/floorplan" className="underline">
                Floor plan layout
              </Link>
            </li>
            <li>
              <Link href="/traditions" className="underline">
                Cultural traditions
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
