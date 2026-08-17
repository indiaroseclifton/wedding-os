import Link from "next/link";
import { Icon } from "@/components/icons";
import { DESK_TOOLS } from "@/lib/tools";

export function ToolTable() {
  return (
    <section>
      <p className="mb-3 kicker kicker-moss">Tools</p>
      <div className="overflow-hidden rounded-2xl border border-white/50 bg-surface/40 backdrop-blur-md">
        <table className="w-full text-left">
          <caption className="sr-only">Standalone tools on the desk</caption>
          <thead className="border-b border-white/40 kicker">
            <tr>
              <th className="px-4 py-3 font-medium">Tool</th>
              <th className="hidden px-4 py-3 font-medium sm:table-cell">What it does</th>
            </tr>
          </thead>
          <tbody>
            {DESK_TOOLS.map((t) => (
              <tr key={t.href} className="border-t border-white/30">
                <td className="px-4 py-3">
                  <Link href={t.href} scroll={false} className="flex min-h-11 items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface/60 text-moss">
                      <Icon name={t.icon} className="h-5 w-5" />
                    </span>
                    <span>
                      <span className="block font-medium text-ink">{t.label}</span>
                      <span className="block text-xs text-muted sm:hidden">{t.line}</span>
                    </span>
                  </Link>
                </td>
                <td className="hidden px-4 py-3 text-sm text-ink-soft sm:table-cell">{t.line}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
