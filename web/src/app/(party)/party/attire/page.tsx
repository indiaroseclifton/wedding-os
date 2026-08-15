import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { ensureDemoWorkspace } from "@/lib/data/workspace";
import { getAttire } from "@/lib/data/attire-store";

export default async function PartyAttirePage() {
  const session = await getSessionUser();
  if (!session) redirect("/login");
  const { workspace } = await ensureDemoWorkspace();
  const attire = await getAttire(workspace.id);

  return (
    <div className="mx-auto max-w-lg space-y-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Attire</h1>
        <Link href="/party" className="text-xs underline">
          Portal home
        </Link>
      </div>
      {attire.paletteNotes && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Palette</p>
          <p className="mt-1 whitespace-pre-wrap">{attire.paletteNotes}</p>
        </div>
      )}
      <ul className="space-y-3">
        {attire.members.map((m) => (
          <li key={m.id} className="rounded-xl border border-slate-200 bg-white p-4 text-sm">
            <p className="font-semibold">{m.name}</p>
            <p className="text-xs text-slate-500">
              {m.role}
              {m.color ? ` · ${m.color}` : ""} · {m.status.replaceAll("_", " ")}
            </p>
            {m.dressLink && (
              <a
                href={m.dressLink}
                target="_blank"
                rel="noreferrer"
                className="mt-2 block text-xs text-sky-700 underline"
              >
                Open link
              </a>
            )}
          </li>
        ))}
        {!attire.members.length && (
          <li className="text-sm text-slate-500">No attire details yet.</li>
        )}
      </ul>
    </div>
  );
}
