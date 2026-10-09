"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";

import { LanguageIcon, getLanguageDisplayCode } from "@/components/language-icon";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { getLanguageMeta, languages, resolveLang, withLangPrefix } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";
import styles from "./mobile-header-menu.module.css";

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
  activeNav?: string | null;
  searchPlaceholder: string;
  searchLabel: string;
  searchQuery?: string;
  clock: ReactNode;
  socialLinks: ReactNode;
  languageSlot: ReactNode;
  themeSlot: ReactNode;
};

type OpenPanel = "menu" | null;
const copy: Record<
  Lang,
  {
    openMenu: string;
    closeMenu: string;
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
    drawerTitle: "Men\u00fc",
    toolsTitle: "Werkzeuge",
    sectionsTitle: "Bereiche",
    aboutTitle: "\u00dcber uns",
    languageTitle: "Sprache",
    networkTitle: "Netzwerk",
    appearanceTitle: "Thema",
  },
  es: {
    openMenu: "Abrir secciones",
    closeMenu: "Cerrar secciones",
    drawerTitle: "Menú",
    toolsTitle: "Herramientas",
    sectionsTitle: "Secciones",
    aboutTitle: "Sobre nosotros",
    languageTitle: "Idioma",
    networkTitle: "Red",
    appearanceTitle: "Tema",
  },
  el: {
    openMenu: "Άνοιγμα ενοτήτων",
    closeMenu: "Κλείσιμο ενοτήτων",
    drawerTitle: "Μενού",
    toolsTitle: "Εργαλεία",
    sectionsTitle: "Ενότητες",
    aboutTitle: "Σχετικά",
    languageTitle: "Γλώσσα",
    networkTitle: "Δίκτυο",
    appearanceTitle: "Θέμα",
  },
  ar: {
    openMenu: "فتح الأقسام",
    closeMenu: "إغلاق الأقسام",
    drawerTitle: "القائمة",
    toolsTitle: "الأدوات",
    sectionsTitle: "الأقسام",
    aboutTitle: "من نحن",
    languageTitle: "اللغة",
    networkTitle: "الشبكة",
    appearanceTitle: "المظهر",
  },
};

export function MobileHeaderMenu({
  lang,
  items,
  currentPath,
  activeLang,
  activeNav = null,
  searchPlaceholder,
  searchLabel,
  searchQuery = "",
  clock,
  socialLinks,
  languageSlot,
  themeSlot,
}: MobileHeaderMenuProps) {
  const [openPanel, setOpenPanel] = useState<OpenPanel>(null);
  const [openGroupKey, setOpenGroupKey] = useState<string | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const languagePathRef = useRef(currentPath);
  const labels = copy[lang];
  const menuId = useMemo(() => `mobile-header-menu-${lang}`, [lang]);
  const activeLanguage = getLanguageMeta(resolveLang(activeLang));
  const menuOpen = openPanel === "menu";

  const normalizePath = (value: string) => value.split(/[?#]/)[0].replace(/^\/(sr|en|tr|fr|de|es|el|ar)(?=\/|$)/, "") || "/";
  const matchesCurrentPath = (href: string) => {
    const path = normalizePath(currentPath);
    const hrefPath = normalizePath(href);
    return path === hrefPath || (hrefPath !== "/" && path.startsWith(`${hrefPath}/`));
  };

  useEffect(() => {
    if (!menuOpen) {
      setOpenGroupKey(null);
      return;
    }
    const activeGroup = items.find((item) => item.children?.some((child) => matchesCurrentPath(child.href)));
    setOpenGroupKey(activeGroup?.key ?? null);
    // The drawer is portalled outside the header's backdrop-filter containing
    // block. Lock the page at its exact scroll position, including on iOS.
    const body = document.body;
    const savedScroll = { x: window.scrollX, y: window.scrollY };
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : triggerRef.current;
    const properties = ["position", "top", "left", "right", "width", "overflow", "paddingInlineEnd"] as const;
    const savedStyles = Object.fromEntries(properties.map((property) => [property, body.style[property]]));
    const previousMenuFlag = body.dataset.mobileMenuOpen;
    const scrollbarWidth = Math.max(0, window.innerWidth - document.documentElement.clientWidth);
    const previousPadding = parseFloat(getComputedStyle(body).paddingInlineEnd) || 0;
    body.style.position = "fixed";
    body.style.top = `${-savedScroll.y}px`;
    body.style.left = `${-savedScroll.x}px`;
    body.style.right = "0";
    body.style.width = "100%";
    body.style.overflow = "hidden";
    if (scrollbarWidth) body.style.paddingInlineEnd = `${previousPadding + scrollbarWidth}px`;
    body.dataset.mobileMenuOpen = "true";

    const background = Array.from(body.children).filter((element) => element instanceof HTMLElement && element !== overlayRef.current) as HTMLElement[];
    const savedInert = background.map((element) => ({ element, inert: element.inert }));
    background.forEach((element) => { element.inert = true; });
    closeRef.current?.focus({ preventScroll: true });

    const syncViewport = () => {
      const viewport = window.visualViewport;
      if (overlayRef.current) {
        overlayRef.current.style.height = `${viewport?.height ?? window.innerHeight}px`;
        overlayRef.current.style.top = `${viewport?.offsetTop ?? 0}px`;
      }
    };
    syncViewport();
    window.visualViewport?.addEventListener("resize", syncViewport);
    window.visualViewport?.addEventListener("scroll", syncViewport);
    window.addEventListener("resize", syncViewport);

    const handleKeyDown = (event: KeyboardEvent) => {
      const panel = panelRef.current;
      if (!panel || event.defaultPrevented) return;
      if (event.key === "Escape") {
        // The theme control handles Escape in its own open preference menu.
        const themeMenu = panel.querySelector(".theme-preference-menu");
        if (themeMenu && (event.target as HTMLElement)?.closest(".theme-control")) return;
        event.preventDefault();
        setOpenPanel(null);
      } else if (event.key === "Tab") {
        const focusable = Array.from(panel.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), [tabindex="0"]'))
          .filter((element) => element.getClientRects().length > 0 && !element.closest("[hidden]"));
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!first) { event.preventDefault(); return; }
        if (event.shiftKey && (document.activeElement === first || !panel.contains(document.activeElement))) {
          event.preventDefault(); last.focus();
        } else if (!event.shiftKey && (document.activeElement === last || !panel.contains(document.activeElement))) {
          event.preventDefault(); first.focus();
        }
      }
    };
    const mediaQuery = window.matchMedia("(min-width: 769px)");
    const handleViewportChange = (event: MediaQueryListEvent) => { if (event.matches) setOpenPanel(null); };
    document.addEventListener("keydown", handleKeyDown);
    mediaQuery.addEventListener("change", handleViewportChange);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      mediaQuery.removeEventListener("change", handleViewportChange);
      window.visualViewport?.removeEventListener("resize", syncViewport);
      window.visualViewport?.removeEventListener("scroll", syncViewport);
      window.removeEventListener("resize", syncViewport);
      savedInert.forEach(({ element, inert }) => { element.inert = inert; });
      properties.forEach((property) => { body.style[property] = savedStyles[property]; });
      if (previousMenuFlag === undefined) delete body.dataset.mobileMenuOpen;
      else body.dataset.mobileMenuOpen = previousMenuFlag;
      const previousScrollBehavior = document.documentElement.style.scrollBehavior;
      document.documentElement.style.scrollBehavior = "auto";
      window.scrollTo(savedScroll.x, savedScroll.y);
      document.documentElement.style.scrollBehavior = previousScrollBehavior;
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
    // Navigation props remain stable throughout an open drawer. Avoid relocking
    // the page and resetting focus when a child accordion changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menuOpen]);

  const closeMenu = () => setOpenPanel(null);

  return (
    <div className={`mobile-header-controls ${styles.controls}`}>
      <div className="site-header__topbar">
        <div className="site-header__utility">
          {clock}
          {languageSlot}
          {themeSlot}
          <button type="button" ref={triggerRef}
            className={`mobile-header-action mobile-header-action--menu ${styles.trigger}`}
            aria-expanded={menuOpen} aria-controls={menuId} aria-haspopup="dialog"
            aria-label={menuOpen ? labels.closeMenu : labels.openMenu}
            onClick={() => {
              if (menuOpen) {
                setOpenPanel(null);
                return;
              }
              // Header props can contain only the server pathname. Capture
              // the browser URL so search queries and fragments survive a
              // language change, without altering the existing route helper.
              const location = window.location;
              languagePathRef.current = location?.pathname
                ? `${location.pathname}${location.search || ""}${location.hash || ""}`
                : currentPath;
              setOpenPanel("menu");
            }}>
            <span className="mobile-header-action__screen-reader">{menuOpen ? labels.closeMenu : labels.openMenu}</span>
            <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true"><path d="M5 7.5h14M5 12h14M5 16.5h14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
          </button>
        </div>
      </div>
      {menuOpen ? createPortal(
        <div className={styles.overlay} ref={overlayRef} data-mobile-menu-overlay
          onPointerDown={(event) => { if (event.target === event.currentTarget) closeMenu(); }}>
          <nav className={styles.panel} id={menuId} ref={panelRef} role="dialog" aria-modal="true"
            aria-labelledby={`${menuId}-title`} data-mobile-menu dir={lang === "ar" ? "rtl" : "ltr"}>
            <div className={styles.head}>
              <a className={styles.brand} href={withLangPrefix("/", lang)} onClick={closeMenu}>
                <span>Avangarda</span><small id={`${menuId}-title`}>{labels.drawerTitle}</small>
              </a>
              <span className={styles.activeLanguage}>{getLanguageDisplayCode(activeLanguage.code)}</span>
              <button className={styles.close} type="button" ref={closeRef} onClick={closeMenu} aria-label={labels.closeMenu}>
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m6 6 12 12M18 6 6 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
              </button>
            </div>
            <div className={styles.content}>
              <form action="/search" method="get" autoComplete="off" className={styles.search}>
                <input type="hidden" name="lang" value={lang} />
                <input type="search" name="q" autoComplete="off" spellCheck={false} defaultValue={searchQuery}
                  className={styles.searchField} placeholder={searchPlaceholder} aria-label={searchPlaceholder} />
                <button className={styles.searchButton} type="submit">{searchLabel}</button>
              </form>
              <section className={styles.destinations} aria-label={labels.sectionsTitle}>
                <h2 className={styles.sectionTitle}>{labels.sectionsTitle}</h2>
                {items.map((item) => {
                  const expanded = openGroupKey === item.key;
                  const current = activeNav === item.key || matchesCurrentPath(item.href) || Boolean(item.children?.some((child) => matchesCurrentPath(child.href)));
                  const children = item.children?.filter((child) => child.href !== item.href);
                  return <div className={styles.destination} key={item.key} data-current={current || undefined}>
                    <div className={styles.destinationRow}>
                      <a className={styles.destinationLink} href={item.href} aria-current={matchesCurrentPath(item.href) ? "page" : undefined} onClick={closeMenu}>{item.label}</a>
                      {children?.length ? <button className={styles.groupToggle} type="button" aria-expanded={expanded}
                        aria-controls={`${menuId}-${item.key}`} aria-label={item.label}
                        onClick={() => setOpenGroupKey((currentGroup) => currentGroup === item.key ? null : item.key)}>
                        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m7 9 5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </button> : null}
                    </div>
                    {expanded && children?.length ? <div className={styles.group} id={`${menuId}-${item.key}`} role="group" aria-label={item.label}>
                      {children.map((child) => <a className={styles.child} href={child.href} key={child.key}
                        aria-current={!child.href.includes("#") && matchesCurrentPath(child.href) ? "page" : undefined} onClick={closeMenu}>
                        <span className={styles.childMarker} aria-hidden="true" />{child.label}
                      </a>)}
                    </div> : null}
                  </div>;
                })}
              </section>
              <section className={styles.preferences} aria-label={labels.appearanceTitle}>
                <div className={styles.appearance}>
                  <h2 className={styles.sectionTitle}>{labels.appearanceTitle}</h2>
                  <ThemeSwitcher lang={lang} />
                </div>
                <div className={styles.clock}>{clock}</div>
              </section>
              <section className={styles.languagesSection} aria-label={labels.languageTitle}>
                <h2 className={styles.sectionTitle}>{labels.languageTitle}</h2>
                <div className={styles.languages}>
                  {languages.map((language) => <a key={language.code} href={withLangPrefix(languagePathRef.current, language.code)}
                    className={styles.language} aria-label={language.label} title={language.label}
                    aria-current={language.code === activeLanguage.code ? "true" : undefined} onClick={closeMenu}>
                    <LanguageIcon code={language.code} className={styles.flag} />
                    <span>{getLanguageDisplayCode(language.code)}</span>
                  </a>)}
                </div>
              </section>
              <section className={styles.network} aria-label={labels.networkTitle}>
                <h2 className={styles.sectionTitle}>{labels.networkTitle}</h2>
                {socialLinks}
              </section>
            </div>
          </nav>
        </div>, document.body
      ) : null}
    </div>
  );
}
