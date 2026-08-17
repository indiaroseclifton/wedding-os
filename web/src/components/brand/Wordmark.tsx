import Link from "next/link";

export function Wordmark({
  href = "/dashboard",
  className = "",
}: {
  href?: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`font-serif text-[1.35rem] font-normal tracking-[0.22em] text-ink ${className}`}
    >
      VOWFOLK
    </Link>
  );
}
