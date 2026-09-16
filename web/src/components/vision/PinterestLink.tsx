"use client";

export function PinterestLink({
  value,
  onChange,
}: {
  value?: string;
  onChange: (url: string) => void;
}) {
  const href = (value || "").trim();
  const ready = /^https?:\/\/(www\.)?pinterest\./i.test(href);
  return (
    <section className="rounded-2xl border border-line bg-surface p-4">
      <p className="kicker">Pinterest</p>
      <h2 className="mt-1 font-serif text-2xl">The board you already have</h2>
      <p className="mt-2 text-sm text-muted">
        Paste the board. We do not import pins. Open Pinterest when you want more pictures.
      </p>
      <label className="mt-3 block text-sm">
        <span className="font-medium">Board URL</span>
        <input
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://www.pinterest.com/you/wedding/"
          className="field mt-1"
        />
      </label>
      <div className="mt-3 flex flex-wrap gap-2">
        {ready ? (
          <a href={href} target="_blank" rel="noreferrer" className="btn btn-primary min-h-11">
            Open my board
          </a>
        ) : null}
        <a href="https://www.pinterest.com/search/pins/?q=wedding%20moodboard" target="_blank" rel="noreferrer" className="btn btn-ghost min-h-11">
          Search Pinterest
        </a>
        <a href="https://www.pinterest.com/" target="_blank" rel="noreferrer" className="btn btn-ghost min-h-11">
          Open Pinterest
        </a>
      </div>
    </section>
  );
}
