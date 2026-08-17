import Link from "next/link";
import { Icon } from "@/components/icons";

export function EmptyState({
  title,
  body,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
  icon = "spark",
}: {
  title: string;
  body: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  icon?: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-line bg-surface px-4 py-8 text-center">
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-moss-soft text-moss">
        <Icon name={icon} className="h-5 w-5" />
      </div>
      <h2 className="text-base font-medium tracking-tight text-ink">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft">{body}</p>
      {(primaryHref || secondaryHref) && (
        <div className="mt-4 flex flex-col items-center justify-center gap-2 sm:flex-row">
          {primaryHref && primaryLabel ? (
            <Link
              href={primaryHref}
              className="btn btn-primary w-full sm:w-auto"
            >
              {primaryLabel}
            </Link>
          ) : null}
          {secondaryHref && secondaryLabel ? (
            <Link
              href={secondaryHref}
              className="btn btn-ghost w-full sm:w-auto"
            >
              {secondaryLabel}
            </Link>
          ) : null}
        </div>
      )}
    </div>
  );
}
