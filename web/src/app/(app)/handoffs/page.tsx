import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { RoomSubnav } from "@/components/layout/RoomSubnav";
import { ensureDemoWorkspace } from "@/lib/data/workspace";
import { listPackages } from "@/lib/data/handoffs-store";

export default async function HandoffsPage() {
  const { workspace } = await ensureDemoWorkspace();
  const packages = await listPackages(workspace.id);

  return (
    <div className="space-y-6">
      <RoomSubnav room="vendors" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="kicker kicker-moss">Vendors</p>
          <h1 className="title mt-2">Extra notes</h1>
          <p className="deck mt-2">
            These land on the live packet. Vendors never get this link — they get{" "}
            <Link href="/send" className="underline">
              Send
            </Link>
            .
          </p>
        </div>
        <Link href="/handoffs/new" className="btn btn-primary">
          New package
        </Link>
      </div>

      {packages.length === 0 ? (
        <EmptyState
          title="No handoff packages yet"
          body="Create a DJ, day-of, or photographer package, fill the sections, then share a link."
          primaryHref="/handoffs/new"
          primaryLabel="New package"
        />
      ) : (
        <ul className="panel divide-y divide-line">
          {packages.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-ink">{p.title}</p>
                <p className="text-xs text-muted">
                  {p.template.replace("_", " ")}
                  {p.recipientName ? ` · ${p.recipientName}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={p.status} />
                <Link href={`/handoffs/${p.id}`} className="text-xs font-medium underline">
                  Open
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
