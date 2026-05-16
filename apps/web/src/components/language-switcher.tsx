"use client";

import { useEffect, useId, useRef, useState } from "react";

import { LanguageIcon, getLanguageDisplayCode } from "@/components/language-icon";
import { getLanguageMeta, languages, resolveLang, withLang } from "@/lib/i18n";

type LanguageSwitcherProps = {
  currentPath: string;
  activeLang?: string;
};

const menuCopyByLang = {
  sr: {
    trigger: "Meni jezika",
    options: "Opcije jezika",
  },
  en: {
    trigger: "Language menu",
    options: "Language options",
  },
  tr: {
    trigger: "Dil menusu",
    options: "Dil secenekleri",
  },
  fr: {
    trigger: "Menu langue",
    options: "Options de langue",
  },
  de: {
    trigger: "Sprachmenu",
    options: "Sprachoptionen",
  },
  es: {
    trigger: "Menú de idioma",
    options: "Opciones de idioma",
  },
  el: {
    trigger: "Μενού γλώσσας",
    options: "Επιλογές γλώσσας",
  },
  ar: {
    trigger: "قائمة اللغة",
    options: "خيارات اللغة",
  },
} as const;

export function LanguageSwitcher({ currentPath, activeLang = "sr" }: LanguageSwitcherProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const panelId = useId();
  const resolvedLang = resolveLang(activeLang);
  const active = getLanguageMeta(resolvedLang);
  const menuCopy = menuCopyByLang[resolvedLang];

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
        aria-label={`${menuCopy.trigger}: ${active.label}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((current) => !current)}
      >
        <span aria-hidden="true" className="language-menu__flag">
          <LanguageIcon code={active.code} />
        </span>
        <span className="language-menu__code">{getLanguageDisplayCode(active.code)}</span>
      </button>

      {open ? (
        <div className="language-menu__panel" id={panelId} role="menu" aria-label={menuCopy.options}>
          {languages.map((language) => (
            <a
              key={language.code}
              href={withLang(currentPath, language.code)}
              className={
                language.code === resolvedLang ? "language-menu__option language-menu__option--active" : "language-menu__option"
              }
              role="menuitem"
              title={language.label}
              aria-label={language.label}
              onClick={() => setOpen(false)}
            >
              <span aria-hidden="true" className="language-menu__option-flag">
                <LanguageIcon code={language.code} />
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
