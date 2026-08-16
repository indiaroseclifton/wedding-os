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
import { CinematicDash } from "@/components/this-week/CinematicDash";

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

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <SeedButton />
      </div>
      <CinematicDash
        name={workspace.name}
        couple={meta.coupleNames}
        location={meta.location}
        days={week.days}
        date={meta.weddingDate}
        weekCount={week.now + week.week}
        items={week.items}
        tiles={[
          { href: "/tasks", label: "Open tasks", value: String(openTasks) },
          { href: "/guests", label: "Headcount", value: String(headcount) },
          { href: "/vendors", label: "Booked", value: String(booked) },
          { href: "/handoffs", label: "Handoffs", value: String(packages.length) },
        ]}
      />
      <p className="text-xs text-muted">
        {decisions.length} decisions logged. The rooms are still the work — this is the stage.
      </p>
    </div>
  );
}
