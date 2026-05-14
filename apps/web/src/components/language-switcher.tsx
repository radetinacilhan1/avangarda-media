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
        <span aria-hidden="true" className="language-menu__flag">{active.flag}</span>
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
              <span aria-hidden="true" className="language-menu__option-flag">{language.flag}</span>
              <span className="language-menu__option-code">{getLanguageDisplayCode(language.code)}</span>
              <span className="language-menu__option-label">{language.label}</span>
            </a>
          ))}
        </div>
      ) : null}
    </div>
  );
}
