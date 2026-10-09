"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import type { Lang } from "@/lib/i18n";
import styles from "./desktop-navigation.module.css";

export type HeaderNavKey = "news" | "analysis" | "interview" | "column" | "archive" | "about";
export type HeaderNavItem = {
  key: HeaderNavKey;
  href: string;
  label: string;
  children?: Array<{ key: string; href: string; label: string }>;
};

const copy: Record<Lang, { navigation: string; open: string; close: string }> = {
  sr: { navigation: "Glavna navigacija", open: "Otvori meni", close: "Zatvori meni" },
  en: { navigation: "Main navigation", open: "Open menu", close: "Close menu" },
  tr: { navigation: "Ana gezinme", open: "Menüyü aç", close: "Menüyü kapat" },
  fr: { navigation: "Navigation principale", open: "Ouvrir le menu", close: "Fermer le menu" },
  de: { navigation: "Hauptnavigation", open: "Menü öffnen", close: "Menü schließen" },
  es: { navigation: "Navegación principal", open: "Abrir menú", close: "Cerrar menú" },
  el: { navigation: "Κύρια πλοήγηση", open: "Άνοιγμα μενού", close: "Κλείσιμο μενού" },
  ar: { navigation: "التنقل الرئيسي", open: "فتح القائمة", close: "إغلاق القائمة" },
};

function DestinationIcon({ itemKey }: { itemKey: string }) {
  const path = itemKey === "story-map"
    ? "m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2V5Zm6-2v16m6-14v16"
    : itemKey === "galleries"
      ? "M4 4h16v16H4V4Zm0 12 5-5 4 4 3-3 4 4M8 8h.01"
      : itemKey === "legal-compass" || itemKey === "human-rights"
        ? "M12 3 4 6v6c0 4 4 7 8 9 4-2 8-5 8-9V6l-8-3Zm-4 9 3 3 5-6"
        : itemKey === "interactive"
          ? "M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 0h6v6h-6v-6Z"
          : "M5 4h14v16H5V4Zm4 5h6m-6 4h6m-6 4h4";
  return <svg className={styles.destinationIcon} viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d={path} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export function DesktopNavigation({ items, activeNav, lang }: {
  items: HeaderNavItem[];
  activeNav: HeaderNavKey | null;
  lang: Lang;
}) {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const rootRef = useRef<HTMLElement>(null);
  const openingMethod = useRef<"hover" | "focus" | "click">("hover");
  const id = useId();
  const labels = copy[lang];

  useEffect(() => {
    if (!openKey) return;
    const closeOutside = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpenKey(null);
    };
    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, [openKey]);

  const focusChild = (key: string, last = false) => {
    requestAnimationFrame(() => {
      const group = rootRef.current?.querySelector<HTMLElement>(`[data-nav-key="${key}"]`);
      const links = group?.querySelectorAll<HTMLAnchorElement>("[data-nav-child]");
      links?.[last ? links.length - 1 : 0]?.focus();
    });
  };

  const handleKey = (event: KeyboardEvent<HTMLDivElement>, item: HeaderNavItem) => {
    if (!item.children?.length) return;
    const target = event.target as HTMLElement;
    if (event.key === "Escape" && openKey === item.key) {
      event.preventDefault();
      event.stopPropagation();
      setOpenKey(null);
      event.currentTarget.querySelector<HTMLButtonElement>("[data-nav-toggle]")?.focus();
      return;
    }
    const links = Array.from(event.currentTarget.querySelectorAll<HTMLAnchorElement>("[data-nav-child]"));
    const index = links.indexOf(target as HTMLAnchorElement);
    if (index >= 0 && ["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
      event.preventDefault();
      const next = event.key === "Home" ? 0 : event.key === "End" ? links.length - 1
        : (index + (event.key === "ArrowDown" ? 1 : -1) + links.length) % links.length;
      links[next]?.focus();
    } else if (index < 0 && ["ArrowDown", "ArrowUp"].includes(event.key)) {
      event.preventDefault();
      openingMethod.current = "focus";
      setOpenKey(item.key);
      focusChild(item.key, event.key === "ArrowUp");
    }
  };

  return (
    <nav className={`site-nav ${styles.navigation}`} ref={rootRef} aria-label={labels.navigation} data-desktop-nav data-lang={lang}>
      {items.map((item) => {
        const hasChildren = Boolean(item.children?.length);
        const expanded = openKey === item.key;
        const current = activeNav === item.key;
        return (
          <div key={item.key} className={styles.item} data-nav-key={item.key} data-current={current || undefined} data-open={expanded || undefined}
            onPointerEnter={(event) => {
              if (hasChildren && event.pointerType !== "touch") {
                if (openKey === item.key && openingMethod.current === "click") return;
                openingMethod.current = "hover";
                setOpenKey(item.key);
              }
            }}
            onPointerLeave={(event) => {
              const focusedChild = event.currentTarget.querySelector("[data-nav-child]:focus");
              if (openingMethod.current === "hover" && !focusedChild) setOpenKey((key) => key === item.key ? null : key);
            }}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpenKey((key) => key === item.key ? null : key);
            }}
            onKeyDown={(event) => handleKey(event, item)}>
            <div className={styles.row}>
              <a className={`site-nav__link ${styles.link}`} href={item.href} aria-current={current ? "page" : undefined}
                onFocus={(event) => {
                  if (hasChildren && event.currentTarget.matches(":focus-visible")) {
                    openingMethod.current = "focus";
                    setOpenKey(item.key);
                  }
                }}>
                <span>{item.label}</span>
                {hasChildren ? <svg className={styles.parentChevron} viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m7 9 5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg> : null}
              </a>
              {hasChildren ? <button type="button" className={styles.toggle} data-nav-toggle aria-expanded={expanded}
                aria-controls={`${id}-${item.key}`} aria-label={`${expanded ? labels.close : labels.open}: ${item.label}`}
                onClick={() => {
                  const closePinned = openKey === item.key && openingMethod.current === "click";
                  openingMethod.current = "click";
                  setOpenKey(closePinned ? null : item.key);
                }}>
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d={expanded ? "M6 12h12" : "M6 12h12M12 6v12"} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
              </button> : null}
            </div>
            {hasChildren ? <div className={styles.dropdown} id={`${id}-${item.key}`} role="group" aria-label={item.label}
              hidden={!expanded} data-nav-dropdown>
              <div className={styles.dropdownHeading}>{item.label}</div>
              {item.children!.map((child) => <a key={child.key} href={child.href} className={styles.child} data-nav-child onClick={() => setOpenKey(null)}>
                <DestinationIcon itemKey={child.key} /><span>{child.label}</span>
              </a>)}
            </div> : null}
          </div>
        );
      })}
    </nav>
  );
}
