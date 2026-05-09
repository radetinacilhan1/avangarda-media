"use client";

import { useEffect, useMemo, useState } from "react";

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

const copy: Record<Lang, { trigger: string; close: string }> = {
  sr: { trigger: "Sekcije", close: "Zatvori meni" },
  en: { trigger: "Menu", close: "Close menu" },
  tr: { trigger: "Menu", close: "Menuyu kapat" },
  fr: { trigger: "Menu", close: "Fermer le menu" },
  de: { trigger: "Menue", close: "Menue schliessen" }
};

export function MobileHeaderMenu({ lang, items }: MobileHeaderMenuProps) {
  const [open, setOpen] = useState(false);
  const labels = copy[lang];
  const dialogId = useMemo(() => `mobile-header-menu-${lang}`, [lang]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const root = document.documentElement;
    const previousOverflow = document.body.style.overflow;
    const previousRootOverflow = root.style.overflow;
    const previousOverscroll = document.body.style.overscrollBehavior;

    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";
    root.style.overflow = "hidden";

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

    document.addEventListener("keydown", handleKeyDown);
    mediaQuery.addEventListener("change", handleViewportChange);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.overscrollBehavior = previousOverscroll;
      root.style.overflow = previousRootOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      mediaQuery.removeEventListener("change", handleViewportChange);
    };
  }, [open]);

  return (
    <div className="mobile-header-menu">
      <button
        type="button"
        className="mobile-header-menu__trigger"
        aria-expanded={open}
        aria-controls={dialogId}
        onClick={() => setOpen(true)}
      >
        <span className="mobile-header-menu__trigger-accent" aria-hidden="true" />
        <span className="mobile-header-menu__trigger-label">{labels.trigger}</span>
        <span className="mobile-header-menu__trigger-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" focusable="false">
            <path d="M4 7h16M4 12h16M4 17h16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </span>
      </button>

      {open ? (
        <>
          <button
            type="button"
            className="mobile-header-menu__overlay"
            aria-label={labels.close}
            onClick={() => setOpen(false)}
          />

          <div className="mobile-header-menu__sheet" id={dialogId} role="dialog" aria-modal="true" aria-label={labels.trigger}>
            <div className="mobile-header-menu__sheet-head">
              <span className="mobile-header-menu__sheet-spacer" aria-hidden="true" />
              <span className="mobile-header-menu__sheet-title">{labels.trigger}</span>
              <button
                type="button"
                className="mobile-header-menu__close"
                aria-label={labels.close}
                onClick={() => setOpen(false)}
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>

            <nav className="mobile-header-menu__nav" aria-label={labels.trigger}>
              {items.map((item) => (
                <a key={item.key} href={item.href} className="mobile-header-menu__link" onClick={() => setOpen(false)}>
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
        </>
      ) : null}
    </div>
  );
}
