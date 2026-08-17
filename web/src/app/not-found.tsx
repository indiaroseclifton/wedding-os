import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="text-sm text-muted">This route is not in the app yet.</p>
      <Link href="/login" className="text-sm font-medium text-ink underline">
        Go to sign in
      </Link>
    </div>
  );
}
