export function BrandMark({
  className = "text-moss",
  size = 28,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      className={className}
      aria-hidden
    >
      <path
        d="M16 28c0-8 7-12 7-20-4 2-7 7-7 12 0-5-3-10-7-12 0 8 7 12 7 20Z"
        fill="currentColor"
        fillOpacity="0.9"
      />
      <path
        d="M10 11c2.2 1.4 3.8 3.6 4.6 6M22 11c-2.2 1.4-3.8 3.6-4.6 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
