"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";

import { ThemeSwitcher } from "@/components/theme-switcher";
import { getLanguageMeta, languages, resolveLang, withLang } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";

type MobileHeaderMenuItem = {
  key: string;
  href: string;
  label: string;
  children?: Array<{
    key: string;
    href: string;
    label: string;
  }>;
};

type MobileHeaderMenuProps = {
  lang: Lang;
  items: MobileHeaderMenuItem[];
  currentPath: string;
  activeLang: Lang;
  searchPlaceholder: string;
  searchLabel: string;
  searchQuery?: string;
  clock: ReactNode;
  socialLinks: ReactNode;
  languageSlot: ReactNode;
  themeSlot: ReactNode;
};

type OpenPanel = "menu" | "search" | null;

const copy: Record<
  Lang,
  {
    openMenu: string;
    closeMenu: string;
    openSearch: string;
    closeSearch: string;
    drawerTitle: string;
    toolsTitle: string;
    sectionsTitle: string;
    aboutTitle: string;
    languageTitle: string;
    networkTitle: string;
    appearanceTitle: string;
  }
> = {
  sr: {
    openMenu: "Otvori sekcije",
    closeMenu: "Zatvori sekcije",
    openSearch: "Otvori pretragu",
    closeSearch: "Zatvori pretragu",
    drawerTitle: "Meni",
    toolsTitle: "Alati",
    sectionsTitle: "Sekcije",
    aboutTitle: "O nama",
    languageTitle: "Jezik",
    networkTitle: "Mre\u017ea",
    appearanceTitle: "Tema",
  },
  en: {
    openMenu: "Open sections",
    closeMenu: "Close sections",
    openSearch: "Open search",
    closeSearch: "Close search",
    drawerTitle: "Menu",
    toolsTitle: "Tools",
    sectionsTitle: "Sections",
    aboutTitle: "About",
    languageTitle: "Language",
    networkTitle: "Network",
    appearanceTitle: "Theme",
  },
  tr: {
    openMenu: "B\u00f6l\u00fcmleri a\u00e7",
    closeMenu: "B\u00f6l\u00fcmleri kapat",
    openSearch: "Aramay\u0131 a\u00e7",
    closeSearch: "Aramay\u0131 kapat",
    drawerTitle: "Men\u00fc",
    toolsTitle: "Ara\u00e7lar",
    sectionsTitle: "B\u00f6l\u00fcmler",
    aboutTitle: "Hakk\u0131m\u0131zda",
    languageTitle: "Dil",
    networkTitle: "A\u011f",
    appearanceTitle: "Tema",
  },
  fr: {
    openMenu: "Ouvrir les sections",
    closeMenu: "Fermer les sections",
    openSearch: "Ouvrir la recherche",
    closeSearch: "Fermer la recherche",
    drawerTitle: "Menu",
    toolsTitle: "Outils",
    sectionsTitle: "Sections",
    aboutTitle: "\u00c0 propos",
    languageTitle: "Langue",
    networkTitle: "R\u00e9seau",
    appearanceTitle: "Th\u00e8me",
  },
  de: {
    openMenu: "Bereiche \u00f6ffnen",
    closeMenu: "Bereiche schlie\u00dfen",
    openSearch: "Suche \u00f6ffnen",
    closeSearch: "Suche schlie\u00dfen",
    drawerTitle: "Men\u00fc",
    toolsTitle: "Werkzeuge",
    sectionsTitle: "Bereiche",
    aboutTitle: "\u00dcber uns",
    languageTitle: "Sprache",
    networkTitle: "Netzwerk",
    appearanceTitle: "Thema",
  },
};

export function MobileHeaderMenu({
  lang,
  items,
  currentPath,
  activeLang,
  searchPlaceholder,
  searchLabel,
  searchQuery = "",
  clock,
  socialLinks,
  languageSlot,
  themeSlot,
}: MobileHeaderMenuProps) {
  const [openPanel, setOpenPanel] = useState<OpenPanel>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const labels = copy[lang];
  const menuId = useMemo(() => `mobile-header-menu-${lang}`, [lang]);
  const searchId = useMemo(() => `mobile-header-search-${lang}`, [lang]);
  const activeLanguage = getLanguageMeta(resolveLang(activeLang));
  const primaryMenuItems = items.filter((item) => !item.children?.length);
  const groupedMenuItems = items.filter((item) => item.children?.length);
  const drawerLanguages = languages.filter(
    (language) => ["sr", "en", "tr"].includes(language.code) || language.code === activeLang
  );
  const menuOpen = openPanel === "menu";
  const searchOpen = openPanel === "search";

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
            <span className="mobile-header-action__screen-reader">
              {searchOpen ? labels.closeSearch : labels.openSearch}
            </span>
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
            aria-haspopup="dialog"
            aria-label={menuOpen ? labels.closeMenu : labels.openMenu}
            onClick={() => setOpenPanel((current) => (current === "menu" ? null : "menu"))}
          >
            <span className="mobile-header-action__screen-reader">
              {menuOpen ? labels.closeMenu : labels.openMenu}
            </span>
            <span className="mobile-header-action__glyph" aria-hidden="true">
              <svg viewBox="0 0 24 24" focusable="false">
                <path
                  d="M5 7.5h14M5 12h14M5 16.5h14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
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
            <nav className="mobile-header-panel mobile-header-panel--menu" id={menuId} aria-label={labels.openMenu} role="dialog">
                <div className="mobile-header-drawer">
                  <div className="mobile-header-drawer__head">
                    <div className="mobile-header-drawer__title-block">
                      <span className="mobile-header-drawer__title">{labels.drawerTitle}</span>
                      <span className="mobile-header-drawer__active-language">
                        {activeLanguage.code.toUpperCase()}
                      </span>
                    </div>

                    <button
                      type="button"
                      className="mobile-header-drawer__close"
                      aria-label={labels.closeMenu}
                      onClick={() => setOpenPanel(null)}
                    >
                      <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
                        <path
                          d="M7 7l10 10M17 7 7 17"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.9"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>
                  </div>

                  <div className="mobile-header-drawer__meta">
                    <div className="mobile-header-drawer__clock">{clock}</div>
                    <div className="mobile-header-drawer__theme">
                      <span className="mobile-header-drawer__section-title">{labels.appearanceTitle}</span>
                      <ThemeSwitcher lang={lang} />
                    </div>
                  </div>

                  <section className="mobile-header-drawer__section" aria-label={labels.toolsTitle}>
                    <div className="mobile-header-drawer__section-title">{labels.toolsTitle}</div>

                    <form action="/search" method="get" autoComplete="off" className="mobile-header-drawer__search">
                      <input type="hidden" name="lang" value={lang} />
                      <input
                        type="search"
                        name="q"
                        autoComplete="off"
                        spellCheck={false}
                        defaultValue={searchQuery}
                        className="header-search__field mobile-header-drawer__search-field"
                        placeholder={searchPlaceholder}
                        aria-label={searchPlaceholder}
                      />
                      <button className="header-search__button mobile-header-drawer__search-button" type="submit">
                        {searchLabel}
                      </button>
                    </form>
                  </section>

                  <section className="mobile-header-drawer__section" aria-label={labels.sectionsTitle}>
                    <div className="mobile-header-drawer__section-title">{labels.sectionsTitle}</div>
                    <div className="mobile-header-menu-panel__grid mobile-header-menu-panel__grid--primary">
                      {primaryMenuItems.map((item) => (
                        <a
                          key={item.key}
                          href={item.href}
                          className="mobile-header-menu-panel__link"
                          onClick={() => setOpenPanel(null)}
                        >
                          {item.label}
                        </a>
                      ))}
                    </div>
                  </section>

                  {groupedMenuItems.map((item) => (
                    <section key={item.key} className="mobile-header-drawer__section" aria-label={item.label}>
                      <div className="mobile-header-drawer__section-title">{labels.aboutTitle}</div>
                      <a
                        href={item.href}
                        className="mobile-header-menu-panel__group-link"
                        onClick={() => setOpenPanel(null)}
                      >
                        {item.label}
                      </a>

                      <div className="mobile-header-menu-panel__subgrid">
                        {item.children?.map((child) => (
                          <a
                            key={child.key}
                            href={child.href}
                            className="mobile-header-menu-panel__sublink"
                            onClick={() => setOpenPanel(null)}
                          >
                            {child.label}
                          </a>
                        ))}
                      </div>
                    </section>
                  ))}

                  <section className="mobile-header-drawer__section" aria-label={labels.languageTitle}>
                    <div className="mobile-header-drawer__section-title">{labels.languageTitle}</div>
                    <div className="mobile-header-language-panel">
                      {drawerLanguages.map((language) => (
                        <a
                          key={language.code}
                          href={withLang(currentPath, language.code)}
                          className={
                            language.code === activeLang
                              ? "mobile-header-language-panel__option mobile-header-language-panel__option--active"
                              : "mobile-header-language-panel__option"
                          }
                          onClick={() => setOpenPanel(null)}
                        >
                          <span className="mobile-header-language-panel__flag" aria-hidden="true">
                            {language.flag}
                          </span>
                          <span className="mobile-header-language-panel__code">
                            {language.code.toUpperCase()}
                          </span>
                        </a>
                      ))}
                    </div>
                  </section>

                  <section className="mobile-header-drawer__section" aria-label={labels.networkTitle}>
                    <div className="mobile-header-drawer__section-title">{labels.networkTitle}</div>
                    <div className="mobile-header-drawer__social">{socialLinks}</div>
                  </section>
                </div>
              </nav>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
