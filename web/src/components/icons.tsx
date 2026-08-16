import type { Icon as PhIcon } from "@phosphor-icons/react";
import {
  Airplane,
  Armchair,
  CalendarBlank,
  CheckCircle,
  Circle,
  EnvelopeSimple,
  ForkKnife,
  Gear,
  Gift,
  Handbag,
  Heart,
  House,
  MapPin,
  Microphone,
  MusicNotes,
  PersonSimpleWalk,
  Sparkle,
  Sun,
  TShirt,
  Users,
  Wallet,
} from "@phosphor-icons/react";

const CHROME: Record<string, PhIcon> = {
  settings: Gear,
  gear: Gear,
  home: House,
  guests: Users,
  users: Users,
  vendors: Handbag,
  bag: Handbag,
  planning: CalendarBlank,
  calendar: CalendarBlank,
  day: Sun,
  sun: Sun,
  budget: Wallet,
  wallet: Wallet,
  registry: Gift,
  gift: Gift,
  music: MusicNotes,
  pin: MapPin,
  map: MapPin,
  heart: Heart,
  chair: Armchair,
  mail: EnvelopeSimple,
  plane: Airplane,
  check: CheckCircle,
  spark: Sparkle,
  shirt: TShirt,
  fork: ForkKnife,
  dietary: ForkKnife,
  mic: Microphone,
  speech: Microphone,
  dance: PersonSimpleWalk,
};

function CustomMark({
  name,
  className,
}: {
  name: string;
  className: string;
}) {
  switch (name) {
    case "flower":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className={className}>
          <circle cx="12" cy="10" r="2" />
          <path d="M12 12v9M8 21h8" />
          <path d="M12 8c-2-3-6-2-6 1 3 0 4 2 6 2 2 0 3-2 6-2 0-3-4-4-6-1Z" />
        </svg>
      );
    case "table":
    case "room":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className={className}>
          <ellipse cx="12" cy="10" rx="8" ry="3.5" />
          <path d="M4 10v3c0 2 3.6 3.5 8 3.5s8-1.5 8-3.5v-3M8 16.2V20M16 16.2V20" />
        </svg>
      );
    case "plate":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className={className}>
          <circle cx="12" cy="12" r="8" />
          <circle cx="12" cy="12" r="4" />
        </svg>
      );
    case "contract":
    case "scroll":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className={className}>
          <path d="M7 4h10a2 2 0 0 1 2 2v14l-3-1.5L13 20l-3-1.5L7 20V6a2 2 0 0 1 2-2" />
          <path d="M10 9h6M10 13h6" />
        </svg>
      );
    default:
      return <Circle weight="thin" className={className} aria-hidden />;
  }
}

export function Icon({
  name,
  className = "h-[18px] w-[18px]",
}: {
  name: string;
  className?: string;
}) {
  const Chrome = CHROME[name];
  if (Chrome) return <Chrome weight="thin" className={className} aria-hidden />;
  return <CustomMark name={name} className={className} />;
}
