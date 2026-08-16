import Link from "next/link";
import { MORE_ROOMS, VISUAL_ROOMS } from "@/lib/visual-rooms";
import { RoomTile } from "@/components/layout/RoomTile";

export default function RoomsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-4xl">Rooms</h1>
        <p className="mt-1 text-sm text-muted">Everything for this wedding, in one house.</p>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {VISUAL_ROOMS.map((room) => (
          <RoomTile key={room.href} {...room} />
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {MORE_ROOMS.map((r) => (
          <Link key={r.href} href={r.href} className="min-h-11 rounded-full border border-line bg-surface/60 px-3 py-1.5 text-xs backdrop-blur">
            {r.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
