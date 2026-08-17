import Link from "next/link";
import { MORE_ROOMS, VISUAL_ROOMS } from "@/lib/visual-rooms";
import { RoomTile } from "@/components/layout/RoomTile";
import { ensureDemoWorkspace } from "@/lib/data/workspace";
import { roomVisible } from "@/lib/shape";

const CHIPS = [
  "/settings",
  "/diy",
  "/seating",
  "/floorplan",
  "/music",
  "/travel",
  "/payments",
  "/send",
  "/run-of-show",
];

export default async function RoomsPage() {
  const { meta } = await ensureDemoWorkspace();
  const rooms = VISUAL_ROOMS.filter((r) => roomVisible(r.href, meta.shape));
  const chips = MORE_ROOMS.filter((r) => CHIPS.includes(r.href) && roomVisible(r.href, meta.shape));

  return (
    <div className="paper">
      <header className="span-12 max-w-2xl pb-2">
        <h1 className="font-serif text-[clamp(3.5rem,10vw,5.5rem)] leading-[0.88] tracking-[-0.04em]">Rooms</h1>
        <p className="mt-5 max-w-xl text-[1.05rem] leading-7 text-ink-soft">
          Organize the details of the day. Each room holds one part of it — the list, the hour, the money, the people you hired.
        </p>
      </header>

      <div className="span-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rooms.map((room) => (
          <RoomTile key={room.href} {...room} deep={room.href === "/planning"} />
        ))}
      </div>

      <nav className="span-12 flex flex-wrap justify-center gap-2 pt-4" aria-label="More rooms">
        {chips.map((r) => (
          <Link key={r.href} href={r.href} className="rounded-full border border-line bg-surface px-3.5 py-2 text-[13px] text-ink-soft">
            {r.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
