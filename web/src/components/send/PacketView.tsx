import type { AssembledPacket } from "@/lib/send/assemble";
import type { AttachmentId } from "@/lib/send/attachments";
import { ATTACHMENTS } from "@/lib/send/attachments";
import { PrintSeal } from "@/components/ui/PrintSeal";

function dollars(n: number) {
  return n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function prettyDue(iso?: string) {
  if (!iso) return "";
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function PacketView({
  packet,
  attachments,
  note,
}: {
  packet: AssembledPacket;
  attachments: AttachmentId[];
  note?: string;
}) {
  const on = new Set(attachments);
  return (
    <article className="space-y-8 text-ink">
      <header className="border-b border-line pb-5">
        <PrintSeal label="Vendor packet" />
        <h1 className="mt-1 font-serif text-4xl leading-tight">{packet.vendor.name}</h1>
        <p className="mt-1 text-sm text-muted">
          {packet.couple}
          {packet.datePretty ? ` · ${packet.datePretty}` : ""}
          {packet.location ? ` · ${packet.location}` : ""}
        </p>
        <p className="text-xs text-ink-soft">{packet.vendor.category}</p>
      </header>

      {packet.vision && (packet.vision.vibe || packet.vision.cover) ? (
        <section>
          <h2 className="font-serif text-2xl">How it should feel</h2>
          {packet.vision.cover ? (
            <img src={packet.vision.cover} alt="" className="mt-3 aspect-[16/8] w-full rounded-2xl object-cover" />
          ) : null}
          <p className="mt-3 font-serif text-2xl">{packet.vision.vibe}</p>
          <p className="mt-1 text-sm text-muted">{[packet.vision.formal, packet.vision.story].filter(Boolean).join(" · ")}</p>
          {packet.vision.hex.length ? (
            <div className="mt-3 flex gap-1.5">
              {packet.vision.hex.map((c) => (
                <span key={c} className="h-6 w-6 rounded-full border border-line" style={{ background: c }} />
              ))}
            </div>
          ) : null}
          {packet.vision.avoid ? <p className="mt-2 text-sm">Hard no: {packet.vision.avoid}</p> : null}
          {packet.vision.nos.length ? (
            <div className="mt-3 flex gap-2">
              {packet.vision.nos.slice(0, 6).map((src) => (
                <img key={src} src={src} alt="" className="h-12 w-14 rounded object-cover opacity-55" />
              ))}
            </div>
          ) : null}
        </section>
      ) : null}

      {note?.trim() && (
        <section className="rounded-2xl border border-line bg-surface px-5 py-4">
          <p className="kicker kicker-moss">A note from us</p>
          <p className="mt-2 whitespace-pre-wrap font-serif text-xl leading-snug">{note.trim()}</p>
        </section>
      )}

      {packet.handoffNote?.trim() && (
        <section className="rounded-2xl border border-line bg-surface px-5 py-4">
          <p className="kicker kicker-moss">Extra notes</p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{packet.handoffNote.trim()}</p>
        </section>
      )}

      {on.has("when_where") && (
        <section>
          <h2 className="font-serif text-2xl">When & where</h2>
          <dl className="mt-2 space-y-1 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Couple</dt>
              <dd>{packet.whenWhere.couple}</dd>
            </div>
            {packet.whenWhere.date && (
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Date</dt>
                <dd>{packet.whenWhere.date}</dd>
              </div>
            )}
            {packet.whenWhere.location && (
              <div className="flex justify-between gap-4">
                <dt className="text-muted">City</dt>
                <dd>{packet.whenWhere.location}</dd>
              </div>
            )}
            {packet.whenWhere.emergency && (
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Day-of</dt>
                <dd>{packet.whenWhere.emergency}</dd>
              </div>
            )}
          </dl>
        </section>
      )}

      {on.has("call_sheet") && (
        <section className="print:break-inside-avoid">
          <h2 className="font-serif text-2xl">Call sheet</h2>
          {packet.callSheet.length === 0 ? (
            <p className="mt-2 text-sm text-muted">No run of show yet.</p>
          ) : (
            <ul className="mt-2 divide-y divide-line rounded-2xl border border-line bg-surface">
              {packet.callSheet.map((s) => (
                <li key={s.id} className="px-4 py-3 text-sm">
                  <p className="font-medium">
                    <span className="tabular-nums text-moss">{s.time}</span>
                    {s.endTime ? <span className="text-muted">–{s.endTime}</span> : null} {s.title}
                  </p>
                  <p className="text-xs text-muted">
                    {[s.location, s.lead].filter(Boolean).join(" · ")}
                  </p>
                  {s.notes && <p className="mt-1 text-xs text-ink-soft">{s.notes}</p>}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {on.has("floor") && (
        <section>
          <h2 className="font-serif text-2xl">Room</h2>
          {packet.floor.room && <p className="mt-1 text-xs text-muted">{packet.floor.room}</p>}
          {packet.floor.fixtures.length > 0 && (
            <p className="mt-2 text-sm">{packet.floor.fixtures.join(" · ")}</p>
          )}
          <ul className="mt-2 divide-y divide-line rounded-2xl border border-line bg-surface">
            {packet.floor.tables.map((t) => (
              <li key={t.name} className="flex justify-between px-4 py-2.5 text-sm">
                <span>{t.name}</span>
                <span className="tabular-nums text-muted">
                  {t.seated}/{t.capacity}
                </span>
              </li>
            ))}
            {!packet.floor.tables.length && (
              <li className="px-4 py-3 text-sm text-muted">No tables on the plan yet.</li>
            )}
          </ul>
        </section>
      )}

      {on.has("seating") && (
        <section className="print:break-before-page">
          <h2 className="font-serif text-2xl">Seating</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {packet.seating.map((t) => (
              <div key={t.name} className="break-inside-avoid rounded-2xl border border-line bg-surface p-4">
                <p className="text-sm font-medium">{t.name}</p>
                <ul className="mt-2 space-y-1 text-sm">
                  {t.people.map((g) => (
                    <li key={g.name}>
                      {g.name}
                      {(g.meal || g.dietary) && (
                        <span className="text-xs text-muted">
                          {" "}
                          · {[g.meal, g.dietary].filter(Boolean).join(" · ")}
                        </span>
                      )}
                    </li>
                  ))}
                  {!t.people.length && <li className="text-muted">Empty</li>}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {on.has("cues") && (
        <section className="print:break-before-page">
          <h2 className="font-serif text-2xl">Cue book</h2>
          {packet.cues.acts.map((act) => (
            <div key={act.act} className="mt-4">
              <h3 className="kicker kicker-moss">{act.act}</h3>
              <ul className="mt-2 divide-y divide-line rounded-2xl border border-line bg-surface">
                {act.rows.map((r) => (
                  <li key={r.label} className="px-4 py-3 text-sm">
                    <p className="font-medium">{r.label}</p>
                    <p className="text-xs text-muted">{r.when}</p>
                    <p className="mt-1">{r.song}</p>
                    {r.extra && <p className="text-xs text-ink-soft">{r.extra}</p>}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="mt-4 space-y-1 text-sm">
            <p>
              <span className="text-muted">Must play:</span>{" "}
              {packet.cues.mustPlay.join("; ") || "—"}
            </p>
            <p>
              <span className="text-muted">Do not play:</span>{" "}
              {packet.cues.doNotPlay.join("; ") || "—"}
            </p>
            {packet.cues.announce && (
              <p>
                <span className="text-muted">Announce:</span> {packet.cues.announce}
              </p>
            )}
            {packet.cues.feel && (
              <p>
                <span className="text-muted">Feel:</span> {packet.cues.feel}
              </p>
            )}
            {packet.cues.noLineDances && <p>No line dances.</p>}
            {packet.cues.spotify && (
              <p>
                <span className="text-muted">Spotify:</span> {packet.cues.spotify}
              </p>
            )}
            {packet.cues.apple && (
              <p>
                <span className="text-muted">Apple Music:</span> {packet.cues.apple}
              </p>
            )}
          </div>
        </section>
      )}

      {on.has("kitchen") && (
        <section className="print:break-before-page">
          <h2 className="font-serif text-2xl">Kitchen</h2>
          <ul className="mt-2 divide-y divide-line rounded-2xl border border-line bg-surface">
            {packet.kitchen.meals.map((m) => (
              <li key={m.label} className="flex justify-between px-4 py-2.5 text-sm">
                <span>{m.label}</span>
                <span className="tabular-nums">{m.n}</span>
              </li>
            ))}
            <li className="flex justify-between px-4 py-2.5 text-sm font-medium">
              <span>Heads</span>
              <span className="tabular-nums">{packet.kitchen.heads}</span>
            </li>
          </ul>
          <h3 className="mt-5 font-serif text-xl">Allergy cards</h3>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            {packet.kitchen.cards.map((c) => (
              <article key={c.name} className="break-inside-avoid rounded-2xl border-2 border-clay p-4">
                <p className="font-serif text-2xl">{c.name}</p>
                <p className="text-sm text-clay">{c.note}</p>
                <p className="mt-2 text-xs text-muted">
                  {c.meal || "Meal unset"}
                  {c.table ? ` · ${c.table}` : " · table unset"}
                </p>
              </article>
            ))}
            {!packet.kitchen.cards.length && <p className="text-sm text-muted">No allergy flags.</p>}
          </div>
          {(packet.kitchen.leftover?.packOut ||
            packet.kitchen.leftover?.leftoverTo ||
            packet.kitchen.leftover?.donate) && (
            <div className="mt-4 text-sm">
              <h3 className="font-serif text-xl">Leftovers</h3>
              {packet.kitchen.leftover.packOut && <p className="mt-1">Pack out: {packet.kitchen.leftover.packOut}</p>}
              {packet.kitchen.leftover.leftoverTo && <p>Goes to: {packet.kitchen.leftover.leftoverTo}</p>}
              {packet.kitchen.leftover.donate && <p>Donate: {packet.kitchen.leftover.donate}</p>}
              {packet.kitchen.leftover.fridge && <p>Fridge: {packet.kitchen.leftover.fridge}</p>}
              {packet.kitchen.leftover.notes && <p className="text-muted">{packet.kitchen.leftover.notes}</p>}
            </div>
          )}
        </section>
      )}

      {on.has("money") && (
        <section>
          <h2 className="font-serif text-2xl">Money</h2>
          <p className="mt-1 text-xs text-muted">
            {dollars(packet.money.paid)} paid · {dollars(packet.money.open)} open
          </p>
          <ul className="mt-2 divide-y divide-line rounded-2xl border border-line bg-surface">
            {packet.money.rows.map((r) => (
              <li key={r.label + r.due} className="flex items-baseline justify-between gap-3 px-4 py-2.5 text-sm">
                <span>
                  {r.label}
                  {r.due && <span className="text-xs text-muted"> · {prettyDue(r.due)}</span>}
                </span>
                <span className="tabular-nums">
                  {dollars(r.amount)}{" "}
                  <span className="text-xs uppercase tracking-wide text-muted">{r.status.toLowerCase()}</span>
                </span>
              </li>
            ))}
            {!packet.money.rows.length && (
              <li className="px-4 py-3 text-sm text-muted">No schedule on the ledger yet.</li>
            )}
          </ul>
        </section>
      )}

      {on.has("clauses") && (
        <section>
          <h2 className="font-serif text-2xl">What we marked</h2>
          {(packet.clauseMeta.namedLead || packet.clauseMeta.hours) && (
            <p className="mt-2 text-sm">
              {[
                packet.clauseMeta.namedLead && `Lead: ${packet.clauseMeta.namedLead}`,
                packet.clauseMeta.hours && `Hours: ${packet.clauseMeta.hours}`,
                packet.clauseMeta.overtimeRate && `OT: ${packet.clauseMeta.overtimeRate}`,
                packet.clauseMeta.coiReceived && "COI received",
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          )}
          <ul className="mt-2 space-y-2">
            {packet.clauses.map((c) => (
              <li key={c.label} className="rounded-2xl border border-line bg-surface px-4 py-3 text-sm">
                <p className="font-medium">
                  {c.label}{" "}
                  <span className="text-xs uppercase tracking-wide text-muted">{c.mark}</span>
                </p>
                {c.ask && <p className="mt-1 text-ink-soft">{c.ask}</p>}
              </li>
            ))}
            {!packet.clauses.length && !packet.clauseMeta.namedLead && (
              <li className="text-sm text-muted">Nothing marked on the contract yet.</li>
            )}
          </ul>
        </section>
      )}

      {on.has("contacts") && (
        <section>
          <h2 className="font-serif text-2xl">Contacts</h2>
          <ul className="mt-2 divide-y divide-line rounded-2xl border border-line bg-surface">
            {packet.contacts.map((c) => (
              <li key={c.role + c.name} className="px-4 py-2.5 text-sm">
                <p className="font-medium">{c.name}</p>
                <p className="text-xs text-muted">
                  {[c.role, c.phone, c.email].filter(Boolean).join(" · ")}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {on.has("floral") && (
        <section>
          <h2 className="font-serif text-2xl">{ATTACHMENTS.floral.label}</h2>
          {packet.floral.notes && <p className="mt-2 whitespace-pre-wrap text-sm">{packet.floral.notes}</p>}
          {packet.floral.fixtures.length > 0 && (
            <p className="mt-2 text-sm text-muted">On the floor: {packet.floral.fixtures.join(" · ")}</p>
          )}
          {!packet.floral.notes && !packet.floral.fixtures.length && (
            <p className="mt-2 text-sm text-muted">No stem notes yet.</p>
          )}
        </section>
      )}
    </article>
  );
}
