import { notFound } from "next/navigation";
import { PrintButton } from "@/components/ui/PrintButton";
import { ScheduleView } from "@/components/run-of-show/ScheduleView";
import { getDayOfByShareToken, slotsForPlan } from "@/lib/data/dayof-store";
import { getWorkspaceMeta } from "@/lib/data/store";
import { DEMO_WORKSPACE } from "@/lib/data/workspace";
import { AUDIENCES, type Audience } from "@/lib/data/run-of-show";

function asView(raw?: string): Audience | "all" {
  if (raw && (AUDIENCES as readonly string[]).includes(raw)) return raw as Audience;
  return "all";
}

export default async function PublicRunOfShowPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ for?: string; plan?: string }>;
}) {
  const { token } = await params;
  const query = await searchParams;
  const dayOf = await getDayOfByShareToken(token);
  if (!dayOf) notFound();
  const meta = await getWorkspaceMeta(dayOf.workspaceId, DEMO_WORKSPACE.name);
  const plan = query.plan === "rain" ? "rain" : "main";
  const view = asView(query.for);
  const label =
    view === "all" ? "Full run of show" : view === "guests" ? "Day-of" : `${view} call sheet`;

  return (
    <div className="mx-auto min-h-screen max-w-xl px-4 py-10">
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            {meta.coupleNames || meta.name}
          </h1>
          <p className="text-sm text-slate-600">
            {[meta.weddingDate, meta.location].filter(Boolean).join(" · ")}
          </p>
        </div>
        <PrintButton />
      </div>
      <ScheduleView
        slots={slotsForPlan(dayOf, plan)}
        view={view}
        showNotes={view !== "guests"}
      />
      {dayOf.emergencyContact && view !== "guests" && (
        <p className="mt-8 text-sm text-slate-600">Day-of contact: {dayOf.emergencyContact}</p>
      )}
    </div>
  );
}
