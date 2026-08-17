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
      className="group relative aspect-[4/3] overflow-hidden rounded-[1.35rem] outline-none transition duration-300 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-moss focus-visible:ring-offset-2 focus-visible:ring-offset-paper active:translate-y-0"
    >
      <img
        src={photo}
        alt=""
        className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.06] group-active:scale-[1.02]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-ink/15 to-transparent transition duration-500 group-hover:from-ink/70" />
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
        <div className="min-w-0">
          <span className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-surface/92 text-ink shadow-sm backdrop-blur-sm">
            {icon ? <Icon name={icon} className="h-4 w-4" /> : null}
          </span>
          <p className="font-serif text-[1.45rem] leading-none tracking-tight text-ivory">{label}</p>
          <p className="mt-1 text-[13px] text-ivory/80">{line}</p>
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface/92 text-ink shadow-sm backdrop-blur-sm transition duration-300 group-hover:translate-x-0.5 group-hover:bg-moss group-hover:text-moss-fg">
          <Icon name="arrow" className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}
