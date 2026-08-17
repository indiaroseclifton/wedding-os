import Link from "next/link";
import { Icon } from "@/components/icons";

export function RoomTile({
  href,
  photo,
  label,
  line,
  icon,
  deep,
  onClick,
}: {
  href: string;
  photo: string;
  label: string;
  line: string;
  icon?: string;
  deep?: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      scroll={false}
      onClick={onClick}
      className="group relative aspect-[4/3] overflow-hidden rounded-[1.35rem]"
    >
      <img
        src={photo}
        alt=""
        className={`h-full w-full object-cover transition duration-700 group-hover:scale-[1.03] ${
          deep ? "opacity-80 saturate-[.55]" : "opacity-70 saturate-[.45]"
        }`}
      />
      <div
        className={`absolute inset-0 ${
          deep
            ? "bg-gradient-to-t from-moss/80 via-moss/15 to-transparent"
            : "bg-gradient-to-t from-paper/90 via-paper/25 to-paper/5"
        }`}
      />
      <div className="absolute inset-x-0 bottom-0 p-5">
        <p className={`spot flex items-center gap-2 ${deep ? "text-ivory" : "text-ink"}`}>
          {icon ? <Icon name={icon} className="h-4 w-4 opacity-80" /> : null}
          {label}
        </p>
        <p className={`mt-1 text-[13px] ${deep ? "text-ivory/70" : "text-muted"}`}>{line}</p>
      </div>
    </Link>
  );
}
