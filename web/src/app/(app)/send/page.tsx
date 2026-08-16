import Link from "next/link";
import { RoomSubnav } from "@/components/layout/RoomSubnav";
import { ensureDemoWorkspace } from "@/lib/data/workspace";
import { listVendors } from "@/lib/data/vendors-store";
import { listSends } from "@/lib/data/sends-store";
import { defaultAttachments, ATTACHMENTS } from "@/lib/send/attachments";
import { assemblePacket } from "@/lib/send/assemble";

function stamp(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default async function SendDeskPage() {
  const { workspace } = await ensureDemoWorkspace();
  const [vendors, sends] = await Promise.all([listVendors(workspace.id), listSends(workspace.id)]);
  const sendByVendor = new Map(sends.map((s) => [s.vendorId, s]));
  const bookedFirst = [...vendors].sort((a, b) => {
    const rank = (s: string) => (["BOOKED", "PAID_DEPOSIT", "DONE"].includes(s) ? 0 : 1);
    return rank(a.status) - rank(b.status) || a.name.localeCompare(b.name);
  });

  const cards = await Promise.all(
    bookedFirst.map(async (v) => {
      const send = sendByVendor.get(v.id);
      const attachments = send?.attachments?.length ? send.attachments : defaultAttachments(v.category);
      const packet = await assemblePacket(workspace.id, v, attachments);
      return { vendor: v, send, attachments, packet };
    })
  );

  const unsent = cards.filter(
    (c) => ["BOOKED", "PAID_DEPOSIT", "DONE"].includes(c.vendor.status) && c.send?.status !== "SENT"
  ).length;

  return (
    <div className="space-y-8">
      <RoomSubnav room="vendors" />
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-moss">Vendors</p>
          <h1 className="mt-1 font-serif text-4xl">Send</h1>
          <p className="mt-2 max-w-xl text-sm text-muted">
            One packet each. The room, the cues, the kitchen, the money — live from the desk, not another form.
          </p>
        </div>
        <p className="text-sm text-ink-soft">
          {vendors.length} on the team
          {unsent ? ` · ${unsent} booked, not sent` : ""}
        </p>
      </div>

      {cards.length === 0 ? (
        <div className="rounded-2xl border border-line bg-surface px-5 py-10 text-sm text-muted">
          Add a vendor first. Then this desk knows what to send them.
          <div className="mt-4">
            <Link href="/vendors" className="rounded-full bg-moss px-4 py-2 text-ivory">
              Open vendors
            </Link>
          </div>
        </div>
      ) : (
        <ul className="grid gap-3">
          {cards.map(({ vendor, send, attachments, packet }) => {
            const booked = ["BOOKED", "PAID_DEPOSIT", "DONE"].includes(vendor.status);
            return (
              <li key={vendor.id}>
                <Link
                  href={`/send/${vendor.id}`}
                  className="block rounded-[1.4rem] border border-line bg-surface px-5 py-4 transition hover:border-moss/40"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-serif text-2xl leading-tight">{vendor.name}</p>
                      <p className="mt-0.5 text-xs text-muted">
                        {vendor.category}
                        {booked ? " · booked" : ` · ${vendor.status.replaceAll("_", " ").toLowerCase()}`}
                        {vendor.email ? ` · ${vendor.email}` : " · no email"}
                      </p>
                    </div>
                    <p className="text-xs text-moss">
                      {send?.receivedAt
                        ? `They opened it ${stamp(send.receivedAt)}`
                        : send?.status === "SENT"
                          ? `Sent ${stamp(send.sentAt)}`
                          : booked
                            ? "Ready to send"
                            : "Preview"}
                    </p>
                  </div>
                  {(() => {
                    const openQ = (send?.questions || []).filter((q) => !q.answer).length;
                    const openN = (send?.needs || []).filter((n) => !n.done).length;
                    if (!openQ && !openN) return null;
                    return (
                      <p className="mt-1 text-xs text-clay">
                        {openQ ? `${openQ} question${openQ === 1 ? "" : "s"}` : ""}
                        {openQ && openN ? " · " : ""}
                        {openN ? `${openN} still needed from them` : ""}
                      </p>
                    );
                  })()}
                  <ul className="mt-3 flex flex-wrap gap-1.5">
                    {attachments.map((id) => {
                      const row = packet.readiness.find((r) => r.id === id);
                      return (
                        <li
                          key={id}
                          className={`rounded-full px-2.5 py-1 text-[11px] ${
                            row?.ready ? "bg-moss/10 text-moss" : "bg-clay/10 text-clay"
                          }`}
                        >
                          {ATTACHMENTS[id].label}
                        </li>
                      );
                    })}
                  </ul>
                  {packet.gaps.length > 0 && (
                    <p className="mt-2 text-xs text-clay">{packet.gaps[0]}</p>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <p className="text-xs text-muted">
        Need a custom text package?{" "}
        <Link href="/handoffs" className="underline">
          Handoffs
        </Link>{" "}
        still exist for notes that aren’t on the desk.
      </p>
    </div>
  );
}
