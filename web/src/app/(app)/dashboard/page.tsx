import Link from "next/link";
import { getSessionUser } from "@/lib/auth/session";

export default async function DashboardPage() {
  const session = await getSessionUser();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-600">
          Welcome{session ? `, ${session.name}` : ""}. Demo shell is running.
        </p>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
        <p className="font-medium text-slate-900">You\u2019re online</p>
        <p className="mt-2">
          Database migration succeeded. More planning modules will appear here as
          they are uploaded to GitHub.
        </p>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-slate-600">
          <li>Neon database: connected</li>
          <li>Demo sign-in: working</li>
          <li>Full feature pages: still uploading</li>
        </ul>
      </div>
      <Link
        href="/login"
        className="inline-block text-sm font-medium text-slate-900 underline"
      >
        Switch demo user
      </Link>
    </div>
  );
}
