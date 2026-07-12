export type PortfolioIconName =
  | "award"
  | "briefcase"
  | "contact"
  | "documentary"
  | "education"
  | "email"
  | "facebook"
  | "fieldwork"
  | "instagram"
  | "linkedin"
  | "location"
  | "notes"
  | "phone"
  | "project"
  | "publication"
  | "selected"
  | "starting-point"
  | "timeline"
  | "tiktok"
  | "website"
  | "work"
  | "x"
  | "youtube";

type PortfolioIconProps = {
  name: PortfolioIconName;
  className?: string;
};

export function PortfolioIcon({ name, className = "portfolio-icon" }: PortfolioIconProps) {
  const common = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    focusable: false,
  };

  switch (name) {
    case "starting-point":
      return <svg {...common}><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="2.5" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /></svg>;
    case "briefcase":
    case "work":
      return <svg {...common}><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2" /></svg>;
    case "project":
      return <svg {...common}><path d="M3 7.5h7l2 2h9v9.5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" /><path d="M3 7.5V5a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v2.5" /></svg>;
    case "publication":
      return <svg {...common}><path d="M5 3h10l4 4v14H5Z" /><path d="M15 3v5h5M8 12h8M8 16h8" /></svg>;
    case "documentary":
      return <svg {...common}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m10 9 5 3-5 3ZM7 5l2 4M15 5l2 4" /></svg>;
    case "timeline":
      return <svg {...common}><path d="M7 3v18M7 7h9M7 12h6M7 17h10" /><circle cx="7" cy="7" r="2" /><circle cx="7" cy="12" r="2" /><circle cx="7" cy="17" r="2" /></svg>;
    case "selected":
    case "award":
      return <svg {...common}><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9Z" /></svg>;
    case "notes":
      return <svg {...common}><path d="M6 3h12v18H6zM9 7h6M9 11h6M9 15h4" /><path d="M4 6h2M4 10h2M4 14h2M4 18h2" /></svg>;
    case "contact":
    case "email":
      return <svg {...common}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></svg>;
    case "phone":
      return <svg {...common}><path d="M7.2 3h3l1.4 4-2.1 1.7a15.5 15.5 0 0 0 5.8 5.8l1.7-2.1 4 1.4v3c0 2.3-2 4.1-4.3 3.8A16 16 0 0 1 3.4 7.3C3.1 5 4.9 3 7.2 3Z" /></svg>;
    case "website":
      return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></svg>;
    case "location":
      return <svg {...common}><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></svg>;
    case "education":
      return <svg {...common}><path d="m3 9 9-5 9 5-9 5Z" /><path d="M7 12v5c3 2 7 2 10 0v-5M21 9v6" /></svg>;
    case "fieldwork":
      return <svg {...common}><path d="M4 19 9 5l4 8 2-5 5 11Z" /><path d="M3 19h18M9 5l3-2 3 2" /></svg>;
    case "instagram":
      return <svg {...common}><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>;
    case "facebook":
      return <svg {...common}><path d="M14 21v-8h3l.5-4H14V7.2c0-1.2.4-2.2 2.3-2.2H18V2.2c-.7-.1-1.8-.2-3-.2-3 0-5 1.8-5 5.2V9H7v4h3v8" /></svg>;
    case "linkedin":
      return <svg {...common}><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M7 10v7M7 7v.01M11 17v-7M11 13a3.5 3.5 0 0 1 7 0v4" /></svg>;
    case "youtube":
      return <svg {...common}><rect x="2.5" y="5" width="19" height="14" rx="4" /><path d="m10 9 5 3-5 3Z" /></svg>;
    case "x":
      return <svg {...common}><path d="M5 4h4.4L19 20h-4.4ZM19 4 5 20" /></svg>;
    case "tiktok":
      return <svg {...common}><path d="M14 4v10.5a4.5 4.5 0 1 1-4-4.47M14 4c.45 2.5 2 4 5 4.5" /></svg>;
    default:
      return null;
  }
}
