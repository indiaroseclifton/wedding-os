import { ensureDemoWorkspace, loadWorkspaceMeta } from "@/lib/data/workspace";

export default async function SettingsPage() {
  const { workspace } = await ensureDemoWorkspace();
  const meta = await loadWorkspaceMeta(workspace.id, workspace.name);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-slate-600">Workspace basics for this demo.</p>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm">
        <p>
          <span className="text-slate-500">Name</span>
          <br />
          <span className="font-medium">{meta.name}</span>
        </p>
        <p className="mt-3">
          <span className="text-slate-500">Wedding date</span>
          <br />
          <span className="font-medium">{meta.weddingDate || "Not set"}</span>
        </p>
        <p className="mt-3 text-xs text-slate-500">
          Demo mode uses local files under <code>.data/</code>. Neon is connected for Milestone A.
        </p>
      </div>
    </div>
  );
}
