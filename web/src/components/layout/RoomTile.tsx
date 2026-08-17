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
        className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/55 via-ink/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
        <div className="min-w-0">
          <span className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-surface/90 text-ink shadow-sm">
            {icon ? <Icon name={icon} className="h-4 w-4" /> : null}
          </span>
          <p className="font-serif text-[1.45rem] leading-none tracking-tight text-ivory">{label}</p>
          <p className="mt-1 text-[13px] text-ivory/80">{line}</p>
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface/90 text-ink shadow-sm">
          <Icon name="arrow" className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}
