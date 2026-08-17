import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ensureDemoWorkspace } from "@/lib/data/workspace";
import { listPolls } from "@/lib/data/polls-store";

export default async function PollsPage() {
  const { workspace } = await ensureDemoWorkspace();
  const polls = await listPolls(workspace.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="title">Polls</h1>
          <p className="mt-1 text-sm text-muted">
            Quick votes for menu, song, color, or anything else.
          </p>
        </div>
        <Link
          href="/polls/new"
          className="btn btn-primary"
        >
          New poll
        </Link>
      </div>

      {polls.length === 0 ? (
        <EmptyState
          title="No polls yet"
          body="Create a poll with two or more options. Partners can vote from the same workspace."
          primaryHref="/polls/new"
          primaryLabel="New poll"
        />
      ) : (
        <ul className="divide-y divide-line glass-panel rounded-2xl">
          {polls.map((p) => {
            const voteCount = Object.keys(p.votes || {}).length;
            return (
              <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-ink">{p.title}</p>
                  <p className="text-xs text-muted">{voteCount} vote{voteCount === 1 ? "" : "s"}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={p.status} />
                  <Link href={`/polls/${p.id}`} className="text-xs font-medium underline">
                    Open
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
