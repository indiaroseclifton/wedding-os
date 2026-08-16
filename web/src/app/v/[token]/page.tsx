import { notFound } from "next/navigation";
import { PrintButton } from "@/components/ui/PrintButton";
import { getSendByToken } from "@/lib/data/sends-store";
import { getVendor } from "@/lib/data/vendors-store";
import { assemblePacket } from "@/lib/send/assemble";
import { defaultNeeds } from "@/lib/send/needs";
import { PacketView } from "@/components/send/PacketView";
import { VendorDesk } from "@/components/send/VendorDesk";

export default async function VendorPacketPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const send = await getSendByToken(token);
  if (!send || send.status !== "SENT") notFound();
  const vendor = await getVendor(send.vendorId);
  if (!vendor) notFound();
  const packet = await assemblePacket(send.workspaceId, vendor, send.attachments);
  const needs = send.needs?.length ? send.needs : defaultNeeds(vendor.category);

  return (
    <div className="min-h-screen bg-paper text-ink">
      <div className="mx-auto max-w-2xl px-5 py-10 sm:px-8">
        <div className="mb-6 flex items-start justify-between gap-3 print:hidden">
          <p className="text-[11px] uppercase tracking-[0.22em] text-moss">For you</p>
          <PrintButton label="Print" />
        </div>
        <PacketView packet={packet} attachments={send.attachments} note={send.note} />
        <VendorDesk
          token={token}
          receivedAt={send.receivedAt}
          receivedName={send.receivedName}
          slots={packet.callSheet}
          needs={needs}
          questions={send.questions || []}
          sections={send.attachments}
        />
        <p className="mt-10 text-xs text-muted print:hidden">
          This page stays current. If they change the room or the kitchen, refresh — same link.
        </p>
      </div>
    </div>
  );
}
