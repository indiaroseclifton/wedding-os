import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { ensureDemoWorkspace } from "@/lib/data/workspace";
import { getSpeeches } from "@/lib/data/speech-store";
import { SpeechDesk } from "@/components/party/SpeechDesk";

export default async function PartySpeechPage() {
  const session = await getSessionUser();
  if (!session) redirect("/login");
  const { workspace } = await ensureDemoWorkspace();
  const speeches = await getSpeeches(workspace.id);
  const mine =
    speeches.rows.find((r) => r.memberKey === session.name.toLowerCase()) || {
      memberKey: session.name.toLowerCase(),
      name: session.name,
      role: "Speech",
      status: "not_started" as const,
    };

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <p className="kicker kicker-moss">Wedding party</p>
      <h1 className="mt-1 font-serif text-4xl">Your speech</h1>
      <p className="mt-1 text-sm text-muted">Draft here. The couple only sees whether you’re ready — not the words.</p>
      <SpeechDesk initial={mine} />
    </div>
  );
}
