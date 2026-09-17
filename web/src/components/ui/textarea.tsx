import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, ...props }, ref) => (
    <textarea
      className={cn(
        "flex min-h-20 w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink shadow-sm transition-colors placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";

export { Textarea };
