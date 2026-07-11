import type { Lang } from "@/lib/i18n";

type LanguageIconProps = {
  code: Lang;
  className?: string;
};

export function getLanguageDisplayCode(code: Lang | string) {
  return code.toUpperCase();
}

export function LanguageIcon({ code, className = "language-menu__flag-icon" }: LanguageIconProps) {
  switch (code) {
    case "sr":
      return (
        <svg viewBox="0 0 20 14" className={className} aria-hidden="true" focusable="false">
          <rect width="20" height="14" rx="2" fill="#f7f7f7" />
          <rect width="20" height="4.67" rx="2" fill="#c83a45" />
          <rect y="4.67" width="20" height="4.66" fill="#1f4da2" />
          <rect y="9.33" width="20" height="4.67" rx="2" fill="#f7f7f7" />
          <g transform="translate(4 2.35)">
            <path
              d="M1.28.45h2.16c.72 0 1.3.58 1.3 1.3v3.18c0 1.46-1.02 2.76-2.38 3.28C1 7.69 0 6.39 0 4.93V1.75C0 1.03.58.45 1.28.45Z"
              fill="#fff5c1"
            />
            <path
              d="M1.72 1h1.28c.52 0 .94.42.94.94v2.62c0 .99-.68 1.88-1.58 2.25-.91-.37-1.6-1.26-1.6-2.25V1.94C.76 1.42 1.18 1 1.72 1Z"
              fill="#d7ad2d"
            />
            <path d="M2.34 1.54v2.76M1.46 2.52h1.76" stroke="#f7f7f7" strokeWidth=".52" strokeLinecap="round" />
          </g>
        </svg>
      );
    case "en":
      return (
        <svg viewBox="0 0 20 14" className={className} aria-hidden="true" focusable="false">
          <rect width="20" height="14" rx="2" fill="#0b3f95" />
          <path d="M0 1.2V0h1.86L20 10.1V14h-1.86L0 1.2Zm20-1.2v1.2L1.86 14H0v-1.2L18.14 0H20Z" fill="#f7f7f7" />
          <path d="M7.9 0h4.2v14H7.9zM0 4.9h20v4.2H0z" fill="#f7f7f7" />
          <path d="M8.75 0h2.5v14h-2.5zM0 5.75h20v2.5H0z" fill="#d41f38" />
          <path d="M0 0v.7L6 4.2h1.55L0 0Zm20 0-7.55 4.2H14L20 .86V0ZM0 14l7.55-4.2H6L0 13.32V14Zm20 0v-.68L14 9.8h-1.55L20 14Z" fill="#d41f38" />
        </svg>
      );
    case "tr":
      return (
        <svg viewBox="0 0 20 14" className={className} aria-hidden="true" focusable="false">
          <rect width="20" height="14" rx="2" fill="#d32234" />
          <circle cx="7.6" cy="7" r="3.4" fill="#f7f7f7" />
          <circle cx="8.65" cy="7" r="2.65" fill="#d32234" />
          <path
            d="m12 7 1.72.56-1.05-1.47 1.75-.57h-2.16L12 3.82l-.66 1.7H9.12l1.73.57-1.04 1.47L11.53 7l.47 1.74L12 7Z"
            fill="#f7f7f7"
          />
        </svg>
      );
    case "fr":
      return (
        <svg viewBox="0 0 20 14" className={className} aria-hidden="true" focusable="false">
          <rect width="6.66" height="14" rx="2" fill="#1744a7" />
          <rect x="6.66" width="6.68" height="14" fill="#f7f7f7" />
          <rect x="13.34" width="6.66" height="14" rx="2" fill="#d21f38" />
        </svg>
      );
    case "de":
      return (
        <svg viewBox="0 0 20 14" className={className} aria-hidden="true" focusable="false">
          <rect width="20" height="14" rx="2" fill="#111316" />
          <rect y="4.67" width="20" height="4.66" fill="#c33036" />
          <rect y="9.33" width="20" height="4.67" rx="2" fill="#f2c531" />
        </svg>
      );
    case "es":
      return (
        <svg viewBox="0 0 20 14" className={className} aria-hidden="true" focusable="false">
          <rect width="20" height="14" rx="2" fill="#ab1821" />
          <rect y="3.5" width="20" height="7" fill="#f1bf00" />
          <g transform="translate(4.25 4.45)">
            <path d="M.35 1.1h3.7v2.35c0 1.35-.82 2.35-1.85 2.75C1.17 5.8.35 4.8.35 3.45Z" fill="#b0182b" stroke="#fff4c2" strokeWidth=".35" />
            <path d="M.8.55h2.8M1.15.15h2.1" stroke="#fff4c2" strokeWidth=".45" strokeLinecap="round" />
            <path d="M2.2 1.2v4.2M.9 2.65h2.6" stroke="#f4ca34" strokeWidth=".35" opacity=".9" />
          </g>
        </svg>
      );
    case "el":
      return (
        <svg viewBox="0 0 20 14" className={className} aria-hidden="true" focusable="false">
          <rect width="20" height="14" rx="2" fill="#0d63b5" />
          <path d="M0 1.75h20M0 5.25h20M0 8.75h20M0 12.25h20" stroke="#f7f7f7" strokeWidth="1.5" />
          <rect width="8.7" height="7.9" rx="2" fill="#0d63b5" />
          <path d="M0 4h8.7M4.35 0v7.9" stroke="#f7f7f7" strokeWidth="1.7" />
        </svg>
      );
    case "ar":
      return (
        <svg viewBox="0 0 20 14" className={className} aria-hidden="true" focusable="false">
          <rect width="20" height="14" rx="2" fill="#11151b" />
          <rect x="1.2" y="1.2" width="17.6" height="11.6" rx="2.4" fill="#171c24" stroke="#d8b41d" strokeWidth=".7" />
          <text x="10" y="9.4" textAnchor="middle" fill="#f0c419" fontSize="8" fontWeight="700" fontFamily="Arial, sans-serif">ع</text>
        </svg>
      );
    default:
      return null;
  }
}
