"use client";

type Guest = {
  name: string;
  email?: string;
  side?: string;
  rsvp: string;
  plusOnes: number;
  dietary?: string;
  tableLabel?: string;
  notes?: string;
  address?: string;
  city?: string;
  region?: string;
  postal?: string;
};

function escapeCell(value: string) {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export function ExportCsvButton({ guests }: { guests: Guest[] }) {
  function download() {
    const header = [
      "name",
      "email",
      "side",
      "rsvp",
      "plusOnes",
      "dietary",
      "tableLabel",
      "address",
      "city",
      "region",
      "postal",
      "notes",
    ];
    const lines = [
      header.join(","),
      ...guests.map((g) =>
        [
          g.name,
          g.email || "",
          g.side || "",
          g.rsvp,
          String(g.plusOnes || 0),
          g.dietary || "",
          g.tableLabel || "",
          g.address || "",
          g.city || "",
          g.region || "",
          g.postal || "",
          g.notes || "",
        ]
          .map((c) => escapeCell(String(c)))
          .join(",")
      ),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "guests.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={download}
      disabled={!guests.length}
      className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 disabled:opacity-40"
    >
      Export CSV
    </button>
  );
}
