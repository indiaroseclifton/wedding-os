import Link from "next/link";
import { MORE_ROOMS, VISUAL_ROOMS, prettyWeddingDate } from "@/lib/visual-rooms";
import { RoomTile } from "@/components/layout/RoomTile";
import { ensureDemoWorkspace } from "@/lib/data/workspace";
import { roomVisible } from "@/lib/shape";
import { Icon } from "@/components/icons";

export default async function RoomsPage() {
  const { meta } = await ensureDemoWorkspace();
  const rooms = VISUAL_ROOMS.filter((r) => roomVisible(r.href, meta.shape));
  const chips = MORE_ROOMS.filter((r) => roomVisible(r.href, meta.shape));
  const dateLine = [prettyWeddingDate(meta.weddingDate), meta.location].filter(Boolean).join("  ·  ");

  return (
    <div className="rooms-stage">
      <header className="mb-6">
        {dateLine ? <p className="kicker">{dateLine}</p> : null}
        <h1 className="headline mt-2">Rooms</h1>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rooms.map((room) => (
          <RoomTile key={room.href} {...room} />
        ))}
      </div>

      <nav className="mt-8 flex flex-wrap gap-2" aria-label="More rooms">
        {chips.map((r) => (
          <Link
            key={r.href}
            href={r.href}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-surface px-3.5 text-[13px] text-ink-soft hover:text-ink"
          >
            <Icon name={r.icon} className="h-3.5 w-3.5" />
            {r.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
