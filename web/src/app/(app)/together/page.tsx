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
  const vision = normalizeVision(decisions.find((d) => d.type === "STYLE_VIBE")?.payload);
  const feelA = vision.feel;
  const feelB = vision.feelB || [];
  const aUrls = new Set(feelA.map((p) => p.url));
  const bUrls = new Set(feelB.map((p) => p.url));
  const overlap = feelA.filter((p) => bUrls.has(p.url));
  const onlyA = feelA.filter((p) => !bUrls.has(p.url));
  const onlyB = feelB.filter((p) => !aUrls.has(p.url));
  const open = tasks.filter((t) => t.status !== "DONE");
  const forA = open.filter((t) => t.ownerName === a || t.ownerName?.includes(a.split(" ")[0]));
  const forB = open.filter((t) => t.ownerName === b || t.ownerName?.includes(b.split(" ")[0]));
  const either = open.filter((t) => !forA.includes(t) && !forB.includes(t));

  return (
    <div className="space-y-8">
      <RoomSubnav room="planning" />
      <div>
        <p className="kicker kicker-moss">Two people</p>
        <h1 className="headline mt-2">The other person</h1>
        <p className="deck mt-2 max-w-xl">
          One desk. Two pairs of eyes. Overlap is the brief. A fight is allowed.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <article className="panel p-5">
          <p className="kicker">{a}</p>
          <p className="mt-2 font-serif text-2xl">{forA.length} open</p>
          <ul className="mt-3 space-y-2 text-sm">
            {forA.slice(0, 6).map((t) => (
              <li key={t.id}>
                <Link href="/tasks" className="underline">
                  {t.title}
                </Link>
              </li>
            ))}
            {!forA.length ? <li className="text-muted">Nothing assigned.</li> : null}
          </ul>
        </article>
        <article className="panel p-5">
          <p className="kicker">{b}</p>
          <p className="mt-2 font-serif text-2xl">{forB.length} open</p>
          <ul className="mt-3 space-y-2 text-sm">
            {forB.slice(0, 6).map((t) => (
              <li key={t.id}>
                <Link href="/tasks" className="underline">
                  {t.title}
                </Link>
              </li>
            ))}
            {!forB.length ? <li className="text-muted">Nothing assigned.</li> : null}
          </ul>
        </article>
      </div>

      {either.length ? (
        <p className="text-sm text-muted">
          {either.length} with no face —{" "}
          <Link href="/tasks" className="underline">
            give them one
          </Link>
          .
        </p>
      ) : null}

      <section className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="kicker kicker-moss">Vision</p>
            <h2 className="font-serif text-3xl">Overlap and fights</h2>
          </div>
          <Link href="/planning/vision?walk=1" className="btn btn-ghost min-h-11">
            Walk as yourself
          </Link>
        </div>
        {!feelB.length ? (
          <p className="text-sm text-muted">
            {b} hasn’t walked yet. The pictures below are only {a}’s until they do.
          </p>
        ) : null}
        {overlap.length ? (
          <div>
            <p className="kicker">Both kept</p>
            <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
              {overlap.map((p) => (
                <img key={p.id} src={p.url} alt="" className="aspect-[4/3] w-full rounded-xl object-cover" />
              ))}
            </div>
          </div>
        ) : null}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="kicker">Only {a}</p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {onlyA.slice(0, 6).map((p) => (
                <img key={p.id} src={p.url} alt="" className="aspect-[4/3] w-full rounded-xl object-cover" />
              ))}
            </div>
          </div>
          <div>
            <p className="kicker">Only {b}</p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {onlyB.slice(0, 6).map((p) => (
                <img key={p.id} src={p.url} alt="" className="aspect-[4/3] w-full rounded-xl object-cover" />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
