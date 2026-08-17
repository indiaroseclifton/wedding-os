import { Icon } from "@/components/icons";

export function PrintSeal({ label }: { label: string }) {
  return (
    <p className="kicker kicker-moss flex items-center gap-2">
      <Icon name="sprig" className="h-4 w-4" />
      {label}
    </p>
  );
}
