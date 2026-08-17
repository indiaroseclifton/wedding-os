import { notFound } from "next/navigation";
import { findSignByToken } from "@/lib/data/signage-store";
import { Wordmark } from "@/components/brand/Wordmark";
import { PublicSignDownload } from "./PublicSignDownload";

export default async function PublicSignPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const found = await findSignByToken(token);
  if (!found) notFound();
  const { sign } = found;

  return (
    <div className="min-h-screen bg-paper px-5 py-10 text-ink">
      <div className="mx-auto max-w-3xl">
        <Wordmark href="/" />
        <p className="kicker mt-8">Cricut file</p>
        <h1 className="mt-2 font-serif text-4xl tracking-tight">{sign.heading}</h1>
        <p className="mt-2 max-w-lg text-sm text-muted">
          Download the SVG. In Design Space: Upload → Upload Image → this file. Weld the words, hide the board outline if you only want vinyl.
        </p>
        <PublicSignDownload sign={sign} />
      </div>
    </div>
  );
}
