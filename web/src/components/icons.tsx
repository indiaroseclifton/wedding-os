export function Icon({
  name,
  className = "h-[18px] w-[18px]",
}: {
  name: string;
  className?: string;
}) {
  const cn = className;
  switch (name) {
    case "home":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={cn}>
          <path d="M4 11.5 12 5l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-8.5Z" />
        </svg>
      );
    case "guests":
    case "users":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={cn}>
          <circle cx="9" cy="8" r="3" />
          <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
          <circle cx="17" cy="9" r="2.2" />
          <path d="M16 19a4.5 4.5 0 0 1 5-4.4" />
        </svg>
      );
    case "vendors":
    case "bag":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={cn}>
          <path d="M4 10h16l-1 10H5L4 10Z" />
          <path d="M8 10V7a4 4 0 0 1 8 0v3" />
        </svg>
      );
    case "planning":
    case "calendar":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={cn}>
          <rect x="4" y="5" width="16" height="15" rx="2" />
          <path d="M8 3v4M16 3v4M4 10h16" />
        </svg>
      );
    case "day":
    case "sun":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={cn}>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4" />
        </svg>
      );
    case "budget":
    case "wallet":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={cn}>
          <rect x="3" y="6" width="18" height="13" rx="2" />
          <path d="M3 10h18M8 15h3" />
        </svg>
      );
    case "registry":
    case "gift":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={cn}>
          <rect x="4" y="11" width="16" height="9" rx="1.5" />
          <path d="M4 11h16M12 11v9M12 11c-2-4-6-4-6 0M12 11c2-4 6-4 6 0" />
        </svg>
      );
    case "music":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={cn}>
          <path d="M9 18V6l10-2v12" />
          <circle cx="7" cy="18" r="2.4" />
          <circle cx="17" cy="16" r="2.4" />
        </svg>
      );
    case "pin":
    case "map":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={cn}>
          <path d="M12 21s7-5.4 7-11a7 7 0 1 0-14 0c0 5.6 7 11 7 11Z" />
          <circle cx="12" cy="10" r="2.2" />
        </svg>
      );
    case "heart":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={cn}>
          <path d="M12 20s-7-4.4-7-9.2A4.2 4.2 0 0 1 12 7a4.2 4.2 0 0 1 7 3.8C19 15.6 12 20 12 20Z" />
        </svg>
      );
    case "flower":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={cn}>
          <circle cx="12" cy="10" r="2" />
          <path d="M12 12v9M8 21h8" />
          <path d="M12 8c-2-3-6-2-6 1 3 0 4 2 6 2 2 0 3-2 6-2 0-3-4-4-6-1Z" />
        </svg>
      );
    case "chair":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={cn}>
          <path d="M7 10h10v4H7zM8 14v6M16 14v6M6 20h12M9 10V6h6v4" />
        </svg>
      );
    case "mail":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={cn}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m4 7 8 6 8-6" />
        </svg>
      );
    case "plane":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={cn}>
          <path d="M3 12h7l9-7v14l-9-7H3z" />
        </svg>
      );
    case "check":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={cn}>
          <circle cx="12" cy="12" r="8" />
          <path d="m8.5 12.5 2.3 2.3 4.7-5" />
        </svg>
      );
    case "spark":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={cn}>
          <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" />
        </svg>
      );
    case "shirt":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={cn}>
          <path d="M8 6 12 8l4-2 3 3-3 2v9H8V9L5 7l3-3Z" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={cn}>
          <circle cx="12" cy="12" r="8" />
        </svg>
      );
  }
}
