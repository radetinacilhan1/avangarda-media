"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import type { Lang } from "@/lib/i18n";

type MobileHeaderMenuItem = {
  key: string;
  href: string;
  label: string;
};

type MobileHeaderMenuProps = {
  lang: Lang;
  items: MobileHeaderMenuItem[];
};

const copy: Record<Lang, { trigger: string; open: string; close: string }> = {
  sr: { trigger: "Sekcije", open: "Otvori sekcije", close: "Zatvori sekcije" },
  en: { trigger: "Menu", open: "Open sections menu", close: "Close sections menu" },
  tr: { trigger: "Menu", open: "B\u00f6l\u00fcm men\u00fcs\u00fcn\u00fc a\u00e7", close: "B\u00f6l\u00fcm men\u00fcs\u00fcn\u00fc kapat" },
  fr: { trigger: "Menu", open: "Ouvrir le menu des sections", close: "Fermer le menu des sections" },
  de: { trigger: "Menue", open: "Bereichsmen\u00fc \u00f6ffnen", close: "Bereichsmen\u00fc schlie\u00dfen" }
};

export function MobileHeaderMenu({ lang, items }: MobileHeaderMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const labels = copy[lang];
  const menuId = useMemo(() => `mobile-header-menu-${lang}`, [lang]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    const mediaQuery = window.matchMedia("(min-width: 769px)");
    const handleViewportChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    mediaQuery.addEventListener("change", handleViewportChange);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      mediaQuery.removeEventListener("change", handleViewportChange);
    };
  }, [open]);

  return (
    <div className={`mobile-header-menu${open ? " mobile-header-menu--open" : ""}`} ref={containerRef}>
      <button
        type="button"
        className="mobile-header-menu__trigger"
        aria-expanded={open}
        aria-controls={menuId}
        aria-haspopup="menu"
        aria-label={open ? labels.close : labels.open}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="mobile-header-menu__trigger-label">{labels.trigger}</span>
        <span className="mobile-header-menu__trigger-caret" aria-hidden="true">
          <svg viewBox="0 0 24 24" focusable="false">
            <path d="M7 10.5L12 15.5L17 10.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>

      {open ? (
        <nav className="mobile-header-menu__panel" id={menuId} aria-label={labels.trigger} role="menu">
          {items.map((item) => (
            <a key={item.key} href={item.href} className="mobile-header-menu__link" role="menuitem" onClick={() => setOpen(false)}>
              {item.label}
            </a>
          ))}
        </nav>
      ) : null}
    </div>
  );
}
