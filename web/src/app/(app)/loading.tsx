export default function AppLoading() {
  return (
    <div className="space-y-4" aria-busy="true" aria-live="polite">
      <div className="h-8 w-40 rounded-lg bg-line/70" />
      <div className="h-4 w-64 rounded bg-line/50" />
      <div className="mt-6 h-40 rounded-2xl bg-line/40" />
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="h-28 rounded-2xl bg-line/40" />
        <div className="h-28 rounded-2xl bg-line/40" />
      </div>
      <span className="sr-only">Loading this room</span>
    </div>
  );
}
