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
      <header className="span-12 max-w-2xl pb-4">
        <h1 className="headline">Rooms</h1>
        <p className="deck mt-5">
          Each room holds one part of the day — the list, the hour, the money, the people you hired.
        </p>
      </header>

      <div className="span-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rooms.map((room) => (
          <RoomTile key={room.href} {...room} deep={room.href === "/planning"} />
        ))}
      </div>

      <nav className="span-12 pt-6" aria-label="More rooms">
        <p className="kicker mb-3 text-center">Also</p>
        <div className="flex flex-wrap justify-center gap-2">
          {chips.map((r) => (
            <Link
              key={r.href}
              href={r.href}
              className="rounded-full border border-line/80 bg-surface px-3 py-1.5 text-xs text-muted"
            >
              {r.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
