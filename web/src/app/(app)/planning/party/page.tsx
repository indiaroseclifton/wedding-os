import Link from "next/link";
import { RoomSubnav } from "@/components/layout/RoomSubnav";
import {
  ensureDemoWorkspace,
  getWorkspaceMembers,
  getWorkspaceTasks,
} from "@/lib/data/workspace";
import { listInvites } from "@/lib/data/store";
import { getAttire } from "@/lib/data/attire-store";
import { getDayOf } from "@/lib/data/dayof-store";
import { getSpeeches } from "@/lib/data/speech-store";

export default async function PartyHubPage() {
  const { workspace } = await ensureDemoWorkspace();
  const [members, invites, attire, tasks, dayOf, speeches] = await Promise.all([
    getWorkspaceMembers(workspace.id),
    listInvites(workspace.id),
    getAttire(workspace.id),
    getWorkspaceTasks(workspace.id),
    getDayOf(workspace.id),
    getSpeeches(workspace.id),
  ]);

  const party = members.filter((m) => m.role !== "COUPLE");
  const pending = invites.filter((i) => i.role !== "COUPLE" && i.status === "PENDING");

  const rows = [
    ...party.map((m) => {
      const dress = attire.members.find((a) => a.name.toLowerCase() === m.name.toLowerCase());
      const theirs = tasks.filter((t) => t.ownerId === m.userId);
      const open = theirs.filter((t) => t.status !== "DONE").length;
      const check = dayOf.checkIns.find((c) => c.name.toLowerCase() === m.name.toLowerCase());
      const speech = speeches.rows.find((s) => s.memberKey === m.name.toLowerCase());
      return {
        key: m.id,
        name: m.name,
        email: m.email,
        status: m.status,
        role: dress?.role || m.role.replaceAll("_", " ").toLowerCase(),
        attire: dress?.status || "—",
        size: dress?.size,
        open,
        checkIn: check?.status,
        speech: speech?.status,
      };
    }),
    ...pending.map((i) => ({
      key: i.id,
      name: i.name || i.email || "Invite",
      email: i.email || "",
      status: "PENDING",
      role: "Invited",
      attire: "—",
      size: undefined as string | undefined,
      open: 0,
      checkIn: undefined as string | undefined,
      speech: undefined as string | undefined,
    })),
  ];

  return (
    <div>
      <RoomSubnav room="day" />
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-4xl">Team</h1>
          <p className="mt-1 text-sm text-muted">
            {party.length} in · {pending.length} invite{pending.length === 1 ? "" : "s"} waiting
          </p>
        </div>
        <Link href="/people" className="btn btn-primary">
          Invite someone
        </Link>
      </div>

      <ul className="mt-8 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
        {rows.map((r) => (
          <li key={r.key} className="grid gap-1 px-4 py-3 sm:grid-cols-[1.4fr_1fr_1fr_5rem]">
            <div>
              <p className="text-sm font-medium">{r.name}</p>
              <p className="text-xs text-muted">
                {r.role}
                {r.email ? ` · ${r.email}` : ""}
              </p>
            </div>
            <p className="text-sm text-ink-soft">
              {r.status === "PENDING" ? "Invite out" : r.status === "ACTIVE" ? "In" : r.status}
            </p>
            <p className="text-sm text-ink-soft">
              Attire {String(r.attire).replaceAll("_", " ").toLowerCase()}
              {r.size ? ` · ${r.size}` : ""}
            </p>
            <p className="text-sm text-ink-soft">{r.open} open</p>
            <p className="text-xs text-muted">
              Speech {r.speech ? r.speech.replace("_", " ") : "—"}
              {r.checkIn ? ` · day ${r.checkIn.toLowerCase()}` : ""}
            </p>
          </li>
        ))}
        {!rows.length && (
          <li className="px-4 py-10 text-center text-sm text-muted">
            No collaborators yet. Invite the people helping make and run the day.
          </li>
        )}
      </ul>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link href="/attire" className="rounded-full border border-line px-3 py-1.5 text-xs">
          Attire
        </Link>
        <Link href="/day-of" className="rounded-full border border-line px-3 py-1.5 text-xs">
          Day-of jobs
        </Link>
        <Link href="/checklist?lane=party" className="rounded-full border border-line px-3 py-1.5 text-xs">
          Party checklist
        </Link>
        <Link href="/events" className="rounded-full border border-line px-3 py-1.5 text-xs">
          Their events
        </Link>
      </div>
    </div>
  );
}
