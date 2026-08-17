"use client";

const LABELS: Record<string, string> = {
  date_locations: "Date & locations",
  timeline_notes: "Timeline notes",
  key_contacts: "Key contacts",
  special_notes: "Special notes",
  vendor_list: "Vendor list",
  must_play: "Must-play",
  do_not_play: "Do-not-play",
  music_moments: "Music moments",
  tone_notes: "Tone / energy",
  day_of_contact: "Day-of contact",
  must_have_moments: "Must-have moments",
  group_notes: "Family / group notes",
  style_notes: "Style notes",
  constraints: "Constraints",
  headcount: "Headcount",
  dietary_summary: "Dietary summary",
  dietary_detail: "Guest dietary detail",
  service_notes: "Service notes",
};

export function ExportTextButton({
  title,
  sections,
}: {
  title: string;
  sections: Record<string, string>;
}) {
  function download() {
    const body = [
      title,
      "",
      ...Object.entries(sections).map(
        ([key, value]) => `${LABELS[key] || key}\n${value || "—"}\n`
      ),
    ].join("\n");
    const blob = new Blob([body], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "handoff"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={download}
      className="btn btn-ghost print:hidden"
    >
      Download .txt
    </button>
  );
}
