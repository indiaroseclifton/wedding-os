import Link from "next/link";
import { V2_ITEMS } from "@/lib/v2-board";
import { HOW_TO } from "@/lib/how-to";

export default function HowIndexPage() {
  const extra = HOW_TO.filter((g) => !V2_ITEMS.some((i) => i.id === g.id));
  return (
    <div className="mx-auto max-w-xl space-y-6 pb-16">
      <p className="kicker kicker-moss">How do I do it</p>
      <h1 className="font-serif text-4xl">Step by step</h1>
      <p className="text-sm leading-6 text-muted">Every room has a walkthrough. Open one, then go do it.</p>
      <ul className="space-y-2">
        {extra.map((g) => (
          <li key={g.id}>
            <Link href={`/how/${g.id}`} className="underline">
              {g.title}
            </Link>
          </li>
        ))}
        {V2_ITEMS.map((item) => (
          <li key={item.id}>
            <Link href={`/how/${item.id}`} className="underline">
              {item.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
