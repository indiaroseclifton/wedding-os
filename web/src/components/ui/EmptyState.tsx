import Link from "next/link";

export function EmptyState({
  title,
  body,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: {
  title: string;
  body: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 bg-white/70 px-4 py-8 text-center">
      <h2 className="text-sm font-medium text-slate-900">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">{body}</p>
      {(primaryHref || secondaryHref) && (
        <div className="mt-4 flex flex-col items-center justify-center gap-2 sm:flex-row">
          {primaryHref && primaryLabel ? (
            <Link
              href={primaryHref}
              className="inline-flex w-full items-center justify-center rounded-lg bg-moss px-3 py-2.5 text-sm font-medium text-moss-fg hover:bg-moss/90 sm:w-auto"
            >
              {primaryLabel}
            </Link>
          ) : null}
          {secondaryHref && secondaryLabel ? (
            <Link
              href={secondaryHref}
              className="inline-flex w-full items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50 sm:w-auto"
            >
              {secondaryLabel}
            </Link>
          ) : null}
        </div>
      )}
    </div>
  );
}
