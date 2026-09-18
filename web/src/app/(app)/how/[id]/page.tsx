import Link from "next/link";
import { notFound } from "next/navigation";
import { V2_ITEMS } from "@/lib/v2-board";
import { getHowTo, stepsFor } from "@/lib/how-to";

export default async function HowToPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = V2_ITEMS.find((i) => i.id === id);
  const named = getHowTo(id);
  if (!item && !named) notFound();

  const guide = named || stepsFor(item!.id, item!.title, item!.href, item!.doThis);

  return (
    <div className="mx-auto max-w-xl space-y-6 pb-16">
      <p className="kicker kicker-moss">How do I do it</p>
      <h1 className="font-serif text-4xl">{guide.title}</h1>
      <ol className="space-y-4">
        {guide.steps.map((step, i) => (
          <li key={i} className="flex gap-3">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink text-xs text-ivory">
              {i + 1}
            </span>
            <p className="text-sm leading-6">{step}</p>
          </li>
        ))}
      </ol>
      <div className="flex flex-wrap gap-3">
        <Link href={guide.href} className="rounded-full bg-ink px-4 py-2 text-sm text-ivory">
          Open the room
        </Link>
        <Link href="/v2" className="rounded-full border border-line px-4 py-2 text-sm">
          Back to the board
        </Link>
      </div>
    </div>
  );
}
