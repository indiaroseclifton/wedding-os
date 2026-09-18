export function AfterGiftRules() {
  return (
    <section className="rounded-2xl border border-line bg-surface p-5">
      <p className="kicker">Thank-you clock</p>
      <h2 className="mt-1 font-serif text-2xl">Two weeks, then three months</h2>
      <ul className="mt-3 space-y-2 text-sm text-muted">
        <li>Gift arrived before the day — write within two weeks of opening it.</li>
        <li>Gift arrived on or after the day — write within three months of the wedding.</li>
        <li>Presence counts. A person who came and gave nothing still gets a note.</li>
      </ul>
    </section>
  );
}
