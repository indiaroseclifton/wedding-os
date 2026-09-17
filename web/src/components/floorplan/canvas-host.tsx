import { useEffect, useState, type ComponentType } from "react";

export function CanvasHost() {
  const [Stage, setStage] = useState<ComponentType | null>(null);

  useEffect(() => {
    let live = true;
    void import("./canvas-stage").then((m) => {
      if (live) setStage(() => m.CanvasStage);
    });
    return () => {
      live = false;
    };
  }, []);

  if (!Stage) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-paper text-sm text-muted">
        Opening the studio…
      </div>
    );
  }
  return <Stage />;
}
