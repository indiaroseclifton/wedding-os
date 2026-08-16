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
import { SeedButton } from "./SeedButton";
import { loadThisWeek } from "@/lib/this-week";

const URGENCY = {
  now: { label: "Do now", className: "bg-rose-50 text-rose-800" },
  week: { label: "This week", className: "bg-amber-50 text-amber-900" },
  soon: { label: "Soon", className: "bg-slate-100 text-slate-600" },
} as const;

export default async function DashboardPage() {
  const session = await getSessionUser();
  const { workspace, meta } = await ensureDemoWorkspace();
  const [tasks, guests, decisions, vendors, packages, week] = await Promise.all([
    getWorkspaceTasks(workspace.id),
    getWorkspaceGuests(workspace.id),
    getWorkspaceDecisions(workspace.id),
    listVendors(workspace.id),
    listPackages(workspace.id),
    loadThisWeek(workspace.id, meta.weddingDate),
  ]);

  const openTasks = tasks.filter((t) => t.status !== "DONE").length;
  const headcount = guests.reduce((sum, g) => {
    if (g.rsvp === "NO") return sum;
    return sum + 1 + (g.plusOnes || 0);
  }, 0);
  const booked = vendors.filter((v) =>
    ["BOOKED", "PAID_DEPOSIT", "DONE"].includes(v.status)
  ).length;
  const days = week.days;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{workspace.name}</h1>
          <p className="mt-1 text-sm text-slate-600">
            Welcome{session ? `, ${session.name}` : ""}.
            {meta.coupleNames ? ` ${meta.coupleNames}.` : ""}
            {meta.location ? ` ${meta.location}.` : ""}
          </p>
        </div>
        <SeedButton />
      </div>

      <div className="rounded-xl border border-slate-900 bg-slate-900 p-4 text-white">
        {days != null ? (
          <>
            <p className="text-3xl font-semibold tracking-tight">
              {days === 0 ? "Today" : days > 0 ? `${days} days` : `${Math.abs(days)} days ago`}
            </p>
            <p className="mt-1 text-xs text-slate-300">
              {days >= 0 ? "until the wedding" : "since the wedding"} · {meta.weddingDate}
              {week.now + week.week > 0
                ? ` · ${week.now + week.week} thing${week.now + week.week === 1 ? "" : "s"} this week`
                : " · you’re clear this week"}
            </p>
          </>
        ) : (
          <>
            <p className="text-sm font-semibold">Set your date</p>
            <p className="mt-1 text-xs text-slate-300">
              Add names, date, and city in Settings so this list is yours.
            </p>
          </>
        )}
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href="/settings"
            className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-slate-900"
          >
            Wedding details
          </Link>
          <Link
            href="/people"
            className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white"
          >
            Invite someone
          </Link>
        </div>
      </div>

      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold">This week</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Payments, people, contracts, DIY beats, and holes in the day — one list, one door each.
          </p>
        </div>
        {week.items.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
            You’re clear. When a payment is due, an RSVP is missing, or flowers need hydrating, it
            shows up here.
          </div>
        ) : (
          <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
            {week.items.map((item) => {
              const u = URGENCY[item.urgency];
              return (
                <li key={item.id} className="flex flex-wrap items-start justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${u.className}`}>
                      {u.label}
                    </span>
                    <p className="mt-1 text-sm font-medium text-slate-900">{item.title}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{item.detail}</p>
                  </div>
                  <Link
                    href={item.href}
                    className="shrink-0 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white"
                  >
                    {item.cta}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { href: "/tasks", label: "Open tasks", value: String(openTasks) },
          { href: "/guests", label: "Headcount", value: String(headcount) },
          { href: "/vendors", label: "Vendors booked", value: String(booked) },
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

      <p className="text-xs text-slate-500">
        {decisions.length} decisions logged. Everything else lives in the rooms on the left — this
        page is the hallway.
      </p>
    </div>
  );
}
