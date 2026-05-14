"use client";

import { useEffect, useId, useRef, useState } from "react";

import { getLanguageMeta, languages, resolveLang } from "@/lib/i18n";

type LanguageSwitcherProps = {
  currentPath: string;
  activeLang?: string;
};

function getLanguageDisplayCode(code: string) {
  return code === "sr" ? "RS" : code.toUpperCase();
}

function LanguageFlag({ code }: { code: string }) {
  switch (code) {
    case "sr":
      return (
        <svg viewBox="0 0 18 12" className="language-menu__flag-icon" aria-hidden="true" focusable="false">
          <rect width="18" height="4" fill="#c6363c" />
          <rect y="4" width="18" height="4" fill="#244aa5" />
          <rect y="8" width="18" height="4" fill="#f7f7f7" />
        </svg>
      );
    case "en":
      return (
        <svg viewBox="0 0 18 12" className="language-menu__flag-icon" aria-hidden="true" focusable="false">
          <rect width="18" height="12" fill="#0a3d91" />
          <path d="M0 1.1 0 0h1.7L18 9.8V12h-1.7L0 1.1Zm18-1.1v1.1L1.7 12H0v-1.1L16.3 0H18Z" fill="#f7f7f7" />
          <path d="M7 0h4v12H7zM0 4h18v4H0z" fill="#f7f7f7" />
          <path d="M8 0h2v12H8zM0 5h18v2H0z" fill="#d21f34" />
          <path d="M0 0v.7L5.4 4H7L0 0Zm18 0-7 4h1.6L18 .8V0ZM0 12l7-4H5.4L0 11.2V12Zm18 0v-.7L12.6 8H11l7 4Z" fill="#d21f34" />
        </svg>
      );
    case "tr":
      return (
        <svg viewBox="0 0 18 12" className="language-menu__flag-icon" aria-hidden="true" focusable="false">
          <rect width="18" height="12" fill="#d1202f" />
          <circle cx="7" cy="6" r="3.1" fill="#f7f7f7" />
          <circle cx="7.9" cy="6" r="2.45" fill="#d1202f" />
          <path d="m10.9 6 1.76.56-1.09-1.5 1.77-.55h-2.18L10.9 2.8l-.69 1.71H8l1.78.55L8.67 6.56 10.42 6l.48 1.76L10.9 6Z" fill="#f7f7f7" />
        </svg>
      );
    case "fr":
      return (
        <svg viewBox="0 0 18 12" className="language-menu__flag-icon" aria-hidden="true" focusable="false">
          <rect width="6" height="12" fill="#1742a0" />
          <rect x="6" width="6" height="12" fill="#f7f7f7" />
          <rect x="12" width="6" height="12" fill="#d11f34" />
        </svg>
      );
    case "de":
      return (
        <svg viewBox="0 0 18 12" className="language-menu__flag-icon" aria-hidden="true" focusable="false">
          <rect width="18" height="4" fill="#121212" />
          <rect y="4" width="18" height="4" fill="#c52b30" />
          <rect y="8" width="18" height="4" fill="#f0c419" />
        </svg>
      );
    default:
      return null;
  }
}

function withLang(path: string, lang: string) {
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}lang=${lang}`;
}

export function LanguageSwitcher({ currentPath, activeLang = "sr" }: LanguageSwitcherProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const panelId = useId();
  const active = getLanguageMeta(resolveLang(activeLang));

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div className={open ? "language-menu language-menu--open" : "language-menu"} ref={rootRef}>
      <button
        type="button"
        className="language-menu__trigger"
        aria-label={`Language menu: ${active.label}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((current) => !current)}
      >
        <span aria-hidden="true" className="language-menu__flag">
          <LanguageFlag code={active.code} />
        </span>
        <span className="language-menu__code">{getLanguageDisplayCode(active.code)}</span>
      </button>

      {open ? (
        <div className="language-menu__panel" id={panelId} role="menu" aria-label="Language options">
          {languages.map((language) => (
            <a
              key={language.code}
              href={withLang(currentPath, language.code)}
              className={language.code === activeLang ? "language-menu__option language-menu__option--active" : "language-menu__option"}
              role="menuitem"
              title={language.label}
              aria-label={language.label}
              onClick={() => setOpen(false)}
            >
              <span aria-hidden="true" className="language-menu__option-flag">
                <LanguageFlag code={language.code} />
              </span>
              <span className="language-menu__option-code">{getLanguageDisplayCode(language.code)}</span>
              <span className="language-menu__option-label">{language.label}</span>
            </a>
          ))}
        </div>
      ) : null}
    </div>
  );
}
