import { notFound } from "next/navigation";
import { readAllStudio } from "@/lib/data/studio-store";
import { publicHandoff } from "@/lib/studio/handoff";
import { SetupGuide } from "@/components/studio/SetupGuide";
import { ensureDemoWorkspace } from "@/lib/data/workspace";
export const dynamic = "force-dynamic";
export const metadata = {
  robots: { index: false, follow: false },
  title: "Wedding build guide · Vowfolk",
};
export default async function Page({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  if (!/^[a-f0-9]{40}$/.test(token)) notFound();
  const all = await readAllStudio(),
    p = Object.values(all)
      .flatMap((s) => s.projects)
      .find((p) => p.shareToken === token);
  if (!p) notFound();
  const { meta } = await ensureDemoWorkspace();
  return <SetupGuide guide={publicHandoff(p, meta.weddingDate || "")} />;
}
