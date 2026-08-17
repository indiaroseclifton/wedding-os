import { SignageStudio } from "@/components/studio/SignageStudio";
import { ensureDemoWorkspace } from "@/lib/data/workspace";

export default async function SignagePage() {
  const { meta } = await ensureDemoWorkspace();
  return (
    <SignageStudio
      names={meta.coupleNames || "Olivia & Mateo"}
      date={meta.weddingDate || ""}
    />
  );
}
