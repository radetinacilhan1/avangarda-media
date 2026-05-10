"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";

import type { Lang } from "@/lib/i18n";

type MobileHeaderMenuItem = {
  key: string;
  href: string;
  label: string;
};

type MobileHeaderMenuProps = {
  lang: Lang;
  items: MobileHeaderMenuItem[];
  searchPlaceholder: string;
  searchLabel: string;
  searchQuery?: string;
  clock: ReactNode;
  socialLinks: ReactNode;
  languageSlot: ReactNode;
  themeSlot: ReactNode;
};

const copy: Record<Lang, { openMenu: string; closeMenu: string; openSearch: string; closeSearch: string }> = {
  sr: {
    openMenu: "Otvori sekcije",
    closeMenu: "Zatvori sekcije",
    openSearch: "Otvori pretragu",
    closeSearch: "Zatvori pretragu"
  },
  en: {
    openMenu: "Open sections",
    closeMenu: "Close sections",
    openSearch: "Open search",
    closeSearch: "Close search"
  },
  tr: {
    openMenu: "B\u00f6l\u00fcmleri a\u00e7",
    closeMenu: "B\u00f6l\u00fcmleri kapat",
    openSearch: "Aramay\u0131 a\u00e7",
    closeSearch: "Aramay\u0131 kapat"
  },
  fr: {
    openMenu: "Ouvrir les sections",
    closeMenu: "Fermer les sections",
    openSearch: "Ouvrir la recherche",
    closeSearch: "Fermer la recherche"
  },
  de: {
    openMenu: "Bereiche \u00f6ffnen",
    closeMenu: "Bereiche schlie\u00dfen",
    openSearch: "Suche \u00f6ffnen",
    closeSearch: "Suche schlie\u00dfen"
  }
};

type OpenPanel = "menu" | "search" | null;

export function MobileHeaderMenu({
  lang,
  items,
  searchPlaceholder,
  searchLabel,
  searchQuery = "",
  clock,
  socialLinks,
  languageSlot,
  themeSlot
}: MobileHeaderMenuProps) {
  const [openPanel, setOpenPanel] = useState<OpenPanel>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const labels = copy[lang];
  const menuId = useMemo(() => `mobile-header-menu-${lang}`, [lang]);
  const searchId = useMemo(() => `mobile-header-search-${lang}`, [lang]);

  useEffect(() => {
    if (!openPanel) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpenPanel(null);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenPanel(null);
      }
    };

    const mediaQuery = window.matchMedia("(min-width: 769px)");
    const handleViewportChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        setOpenPanel(null);
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
  }, [openPanel]);

  const menuOpen = openPanel === "menu";
  const searchOpen = openPanel === "search";

  return (
    <div className="mobile-header-controls" ref={containerRef}>
      <div className="site-header__topbar">
        <div className="site-header__utility">
          {clock}
          {socialLinks}
          {languageSlot}
          {themeSlot}

          <button
            type="button"
            className={`mobile-header-action${searchOpen ? " mobile-header-action--active" : ""}`}
            aria-expanded={searchOpen}
            aria-controls={searchId}
            aria-haspopup="dialog"
            aria-label={searchOpen ? labels.closeSearch : labels.openSearch}
            onClick={() => setOpenPanel((current) => (current === "search" ? null : "search"))}
          >
            <span className="mobile-header-action__screen-reader">{searchOpen ? labels.closeSearch : labels.openSearch}</span>
            <span className="mobile-header-action__glyph" aria-hidden="true">
              <svg viewBox="0 0 24 24" focusable="false">
                <path
                  d="M10.5 4.5a6 6 0 1 1 0 12a6 6 0 0 1 0-12Zm0 1.8a4.2 4.2 0 1 0 0 8.4a4.2 4.2 0 0 0 0-8.4Zm7.12 9.85 2.58 2.58a.9.9 0 0 1-1.27 1.27l-2.58-2.58a.9.9 0 1 1 1.27-1.27Z"
                  fill="currentColor"
                />
              </svg>
            </span>
          </button>

          <button
            type="button"
            className={`mobile-header-action${menuOpen ? " mobile-header-action--active" : ""}`}
            aria-expanded={menuOpen}
            aria-controls={menuId}
            aria-haspopup="menu"
            aria-label={menuOpen ? labels.closeMenu : labels.openMenu}
            onClick={() => setOpenPanel((current) => (current === "menu" ? null : "menu"))}
          >
            <span className="mobile-header-action__screen-reader">{menuOpen ? labels.closeMenu : labels.openMenu}</span>
            <span className="mobile-header-action__glyph" aria-hidden="true">
              <svg viewBox="0 0 24 24" focusable="false">
                <path d="M5 7.5h14M5 12h14M5 16.5h14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </span>
          </button>
        </div>
      </div>

      {openPanel ? (
        <div className="mobile-header-controls__panels">
          {searchOpen ? (
            <div className="mobile-header-panel mobile-header-panel--search" id={searchId} role="dialog" aria-label={searchLabel}>
              <form action="/search" method="get" autoComplete="off" className="mobile-header-search-panel">
                <input type="hidden" name="lang" value={lang} />
                <input
                  type="search"
                  name="q"
                  autoComplete="off"
                  spellCheck={false}
                  defaultValue={searchQuery}
                  className="header-search__field mobile-header-search-panel__field"
                  placeholder={searchPlaceholder}
                  aria-label={searchPlaceholder}
                />
                <button className="header-search__button mobile-header-search-panel__button" type="submit">
                  {searchLabel}
                </button>
              </form>
            </div>
          ) : null}

          {menuOpen ? (
            <nav className="mobile-header-panel mobile-header-panel--menu" id={menuId} aria-label={labels.openMenu} role="menu">
              <div className="mobile-header-menu-panel">
                {items.map((item) => (
                  <a key={item.key} href={item.href} className="mobile-header-menu-panel__link" role="menuitem" onClick={() => setOpenPanel(null)}>
                    {item.label}
                  </a>
                ))}
              </div>
            </nav>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
