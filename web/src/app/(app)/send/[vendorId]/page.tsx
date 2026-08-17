import Link from "next/link";
import { notFound } from "next/navigation";
import { PrintButton } from "@/components/ui/PrintButton";
import { RoomSubnav } from "@/components/layout/RoomSubnav";
import { ensureDemoWorkspace } from "@/lib/data/workspace";
import { loadSendPreview, sendHref } from "@/lib/send/assemble";
import { SendComposer } from "@/components/send/SendComposer";
import { AnswerInbox } from "@/components/send/AnswerInbox";
import { sendStrip } from "@/lib/send/status";
import { emailIsConnected } from "@/lib/email/send";

export default async function SendVendorPage({
  params,
}: {
  params: Promise<{ vendorId: string }>;
}) {
  const { vendorId } = await params;
  const { workspace } = await ensureDemoWorkspace();
  const data = await loadSendPreview(workspace.id, vendorId);
  if (!data) notFound();
  const { vendor, existing, attachments, packet } = data;

  return (
    <div className="space-y-6">
      <RoomSubnav room="vendors" />
      <div className="flex flex-wrap items-start justify-between gap-3 print:hidden">
        <div>
          <Link href="/send" className="text-xs underline">
            All packets
          </Link>
          <h1 className="mt-2 font-serif text-4xl">{vendor.name}</h1>
          <p className="mt-1 text-sm text-muted">
            {vendor.category}
            {existing?.status === "SENT" && existing.sentAt
              ? ` · last sent ${new Date(existing.sentAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}`
              : " · not sent yet"}
            {existing ? ` · ${sendStrip(existing).line}` : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <PrintButton label="Print" />
          <Link href={`/vendors/${vendor.id}`} className="rounded-full border border-line px-4 py-2 text-sm">
            Vendor
          </Link>
        </div>
      </div>

      {existing && (existing.questions?.length || existing.needs?.some((n) => n.done || n.fileUrl)) ? (
        <AnswerInbox sendId={existing.id} questions={existing.questions || []} needs={existing.needs || []} />
      ) : null}

      <SendComposer
        vendorId={vendor.id}
        packet={packet}
        initialAttachments={attachments}
        initialNote={existing?.note}
        sharePath={existing?.status === "SENT" ? sendHref(existing) : null}
        lastSentAt={existing?.sentAt}
        lastSentTo={existing?.sentTo}
        emailedAt={existing?.emailedAt}
        receivedAt={existing?.receivedAt}
        emailConnected={emailIsConnected()}
      />
    </div>
  );
}
