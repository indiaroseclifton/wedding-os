"use client";

type Table = { id: string; name: string; capacity: number; shape: string };
type Guest = { id: string; name: string; tableLabel?: string | null; dietary?: string | null };

function TableShape({
  shape,
  name,
  guests,
  capacity,
}: {
  shape: string;
  name: string;
  guests: Guest[];
  capacity: number;
}) {
  const over = guests.length > capacity;
  const isRound = shape === "ROUND" || shape === "SWEETHEART" || !shape;
  const isHead = shape === "HEAD";

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`relative flex flex-wrap items-center justify-center gap-1 border-2 border-slate-300 bg-white p-3 shadow-sm ${
          isRound
            ? "h-36 w-36 rounded-full"
            : isHead
              ? "h-20 w-48 rounded-2xl"
              : "h-28 w-40 rounded-xl"
        } ${over ? "border-rose-400" : ""}`}
      >
        <span className="absolute -top-2 rounded bg-slate-900 px-2 py-0.5 text-[10px] font-medium text-white">
          {name}
        </span>
        {guests.length === 0 ? (
          <span className="text-[10px] text-slate-400">Empty</span>
        ) : (
          guests.map((g) => (
            <span
              key={g.id}
              title={g.dietary || g.name}
              className="max-w-[4.5rem] truncate rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] text-slate-700"
            >
              {g.name.split(" ")[0]}
            </span>
          ))
        )}
      </div>
      <p className={`text-[10px] ${over ? "text-rose-600" : "text-slate-500"}`}>
        {guests.length}/{capacity}
      </p>
    </div>
  );
}

export function SeatingChart({
  tables,
  guests,
}: {
  tables: Table[];
  guests: Guest[];
}) {
  if (!tables.length) return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
      <p className="mb-4 text-xs font-medium uppercase tracking-wide text-slate-500">
        Chart preview
      </p>
      <div className="flex flex-wrap items-start justify-center gap-8">
        {tables.map((t) => (
          <TableShape
            key={t.id}
            shape={t.shape}
            name={t.name}
            capacity={t.capacity}
            guests={guests.filter((g) => g.tableLabel === t.name)}
          />
        ))}
      </div>
    </div>
  );
}
