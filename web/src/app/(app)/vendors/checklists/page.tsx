import Link from "next/link";
import { RoomSubnav } from "@/components/layout/RoomSubnav";
import { VENDOR_CHECKLIST_TEMPLATES } from "@/lib/vendor-checklists";

export default function VendorChecklistsPage() {
  return (
    <div className="space-y-6 pb-16">
      <RoomSubnav room="planning" />
      <div>
        <h1 className="font-serif text-4xl">Vendor checklists</h1>
        <p className="mt-1 text-sm text-muted">
          What to lock for each role — not a generic to-do. Apply one when you hire; it lives on that vendor.
        </p>
      </div>
      {VENDOR_CHECKLIST_TEMPLATES.map((t) => (
        <section key={t.category} className="rounded-2xl border border-line bg-surface p-5">
          <p className="font-serif text-2xl">{t.category}</p>
          <p className="text-xs text-muted">{t.items.length} lines</p>
          <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-ink-soft">
            {t.items.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ol>
        </section>
      ))}
      <p className="text-xs text-muted">
        Hire someone on{" "}
        <Link href="/vendors" className="underline">
          My team
        </Link>{" "}
        and the matching list appears on their page. Add your own lines there.
      </p>
    </div>
  );
}
