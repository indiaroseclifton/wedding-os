import Link from "next/link";
import { Icon } from "@/components/icons";

export function RoomTile({
  href,
  photo,
  label,
  line,
  icon,
  onClick,
}: {
  href: string;
  photo: string;
  label: string;
  line: string;
  icon?: string;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      scroll={false}
      onClick={onClick}
      className="group relative aspect-[5/4] overflow-hidden rounded-2xl border border-white/50 bg-surface/30"
    >
      <img
        src={photo}
        alt=""
        className="h-full w-full object-cover opacity-50 saturate-[.65] transition duration-500 group-hover:scale-[1.03] group-hover:opacity-65"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-paper/95 via-paper/30 to-paper/10 backdrop-blur-[2px]" />
      <div className="absolute inset-x-0 bottom-0 p-3">
        <p className="flex items-center gap-2 font-serif text-xl text-ink">
          {icon ? <Icon name={icon} className="h-4 w-4" /> : null}
          {label}
        </p>
        <p className="mt-0.5 text-[11px] leading-4 text-ink-soft">{line}</p>
      </div>
    </Link>
  );
}
