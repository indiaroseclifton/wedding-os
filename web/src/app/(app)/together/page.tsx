import Link from "next/link";
import { RoomSubnav } from "@/components/layout/RoomSubnav";
import { ensureDemoWorkspace, getWorkspaceDecisions, getWorkspaceMembers, getWorkspaceTasks } from "@/lib/data/workspace";
import { normalizeVision } from "@/lib/vision";

export default async function TogetherPage() {
  const { workspace, meta } = await ensureDemoWorkspace();
  const [members, tasks, decisions] = await Promise.all([
    getWorkspaceMembers(workspace.id),
    getWorkspaceTasks(workspace.id),
    getWorkspaceDecisions(workspace.id),
  ]);
  const a = meta.partnerA || members[0]?.name || "Alex";
  const b = meta.partnerB || members[1]?.name || "Jordan";
  const vision = normalizeVision(decisions.find((decision) => decision.type === "STYLE_VIBE")?.payload);
  const feelA = vision.feel;
  const feelB = vision.feelB || [];
  const aUrls = new Set(feelA.map((picture) => picture.url));
  const bUrls = new Set(feelB.map((picture) => picture.url));
  const overlap = feelA.filter((picture) => bUrls.has(picture.url));
  const onlyA = feelA.filter((picture) => !bUrls.has(picture.url));
  const onlyB = feelB.filter((picture) => !aUrls.has(picture.url));
  const openTasks = tasks.filter((task) => task.status !== "DONE");
  const openDecisions = decisions.filter((decision) => decision.status !== "DECIDED");
  const blocked = openTasks.filter((task) => task.status === "BLOCKED");
  const unowned = openTasks.filter((task) => !task.ownerName?.trim());
  const roleLabels: Record<string, string> = {
    COUPLE: "Couple",
    PLANNER: "Planner / coordinator",
    WEDDING_PARTY: "Wedding party",
    FAMILY: "Family contributor",
    DIY_HELPER: "DIY build helper",
    VENDOR: "Vendor",
    VIEWER: "Read-only approver",
  };
  const roleLabel = (role: string) => roleLabels[role] || role.replaceAll("_", " ").toLowerCase();

  function assignments(name: string) {
    const first = name.split(" ")[0];
    return openTasks.filter((task) => task.ownerName === name || task.ownerName?.includes(first));
  }

  return (
    <div className="space-y-8">
      <RoomSubnav room="planning" />

      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-8">
        <div>
          <p className="kicker kicker-moss">Together</p>
          <h1 className="mt-2 font-serif text-[clamp(2.8rem,7vw,4.8rem)] leading-none tracking-tight">One wedding. Clear owners.</h1>
          <p className="mt-4 max-w-2xl text-base text-ink-soft">See what needs both of you, what is blocked and who is carrying the next handoff.</p>
        </div>
        <Link href="/planning/party" className="btn btn-primary">Invite your folk</Link>
      </header>

      <section className="grid gap-3 sm:grid-cols-3" aria-label="Collaboration health">
        <Link href="/decisions" className="rounded-2xl border border-line bg-surface p-5">
          <p className="kicker">Needs both</p><p className="mt-2 font-serif text-4xl tabular-nums">{openDecisions.length}</p><p className="mt-1 text-sm text-muted">open decisions</p>
        </Link>
        <Link href="/tasks" className="rounded-2xl border border-line bg-surface p-5">
          <p className="kicker">Blocked</p><p className="mt-2 font-serif text-4xl tabular-nums">{blocked.length}</p><p className="mt-1 text-sm text-muted">tasks need help</p>
        </Link>
        <Link href="/tasks" className="rounded-2xl border border-line bg-surface p-5">
          <p className="kicker">No owner</p><p className="mt-2 font-serif text-4xl tabular-nums">{unowned.length}</p><p className="mt-1 text-sm text-muted">handoffs need a face</p>
        </Link>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {[a, b].map((name) => {
          const assigned = assignments(name);
          return (
            <article key={name} className="rounded-[1.5rem] border border-line bg-surface p-6">
              <div className="flex items-start justify-between gap-4">
                <div><p className="kicker">Personal workspace</p><h2 className="mt-2 font-serif text-3xl">{name}</h2></div>
                <span className="rounded-full bg-moss-soft px-3 py-1.5 text-xs">{assigned.length} open</span>
              </div>
              {assigned.length ? (
                <ul className="mt-5 divide-y divide-line">
                  {assigned.slice(0, 5).map((task) => (
                    <li key={task.id} className="py-3">
                      <Link href="/tasks" className="font-medium underline-offset-4 hover:underline">{task.title}</Link>
                      <p className="mt-1 text-sm text-muted">{task.status.replaceAll("_", " ")}{task.dueDate ? ` · due ${task.dueDate}` : ""}</p>
                    </li>
                  ))}
                </ul>
              ) : <p className="mt-5 rounded-2xl bg-paper p-4 text-sm text-muted">Nothing assigned right now.</p>}
            </article>
          );
        })}
      </section>

      <section className="rounded-[1.5rem] border border-line bg-surface p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div><p className="kicker kicker-moss">Shared decisions</p><h2 className="mt-2 font-serif text-3xl">Resolve, approve, move</h2></div>
          <Link href="/decisions" className="text-sm underline underline-offset-4">Decision desk</Link>
        </div>
        {openDecisions.length ? (
          <ul className="mt-5 grid gap-3 md:grid-cols-2">
            {openDecisions.slice(0, 6).map((decision) => (
              <li key={decision.id} className="rounded-2xl border border-line p-4">
                <p className="font-serif text-xl">{decision.title}</p>
                <p className="mt-1 text-sm text-muted">{decision.summary || "Waiting for a shared call."}</p>
                <Link href="/decisions" className="mt-3 inline-block text-sm font-medium underline underline-offset-4">Review together</Link>
              </li>
            ))}
          </ul>
        ) : <p className="mt-5 rounded-2xl bg-moss-soft p-5 text-sm">Every shared decision is resolved.</p>}
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div><p className="kicker">Visual common ground</p><h2 className="mt-2 font-serif text-3xl">Overlap and differences</h2></div>
          <Link href="/planning/vision?walk=1" className="btn btn-ghost">Walk as yourself</Link>
        </div>
        {!feelB.length ? <p className="text-sm text-muted">{b} has not finished the visual walk yet.</p> : null}
        {overlap.length ? (
          <div>
            <p className="kicker">Both kept</p>
            <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">{overlap.map((picture) => <img key={picture.id} src={picture.url} alt="" className="aspect-[4/3] w-full rounded-xl object-cover" />)}</div>
          </div>
        ) : null}
        <div className="grid gap-4 sm:grid-cols-2">
          {[{ name: a, pictures: onlyA }, { name: b, pictures: onlyB }].map((column) => (
            <div key={column.name} className="rounded-2xl border border-line bg-surface p-4">
              <p className="kicker">Only {column.name}</p>
              {column.pictures.length ? <div className="mt-3 grid grid-cols-3 gap-2">{column.pictures.slice(0, 6).map((picture) => <img key={picture.id} src={picture.url} alt="" className="aspect-[4/3] w-full rounded-xl object-cover" />)}</div> : <p className="mt-3 text-sm text-muted">No differences saved.</p>}
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-line pt-6">
        <p className="kicker">Your folk</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {members.map((member) => <span key={member.id} className="rounded-full border border-line bg-surface px-3 py-2 text-sm">{member.name} · {roleLabel(member.role)}</span>)}
          <Link href="/planning/party" className="rounded-full bg-ink px-4 py-2 text-sm text-ivory">Manage roles and invitations</Link>
        </div>
      </section>
    </div>
  );
}
