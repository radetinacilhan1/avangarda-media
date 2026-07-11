"use client";

import { useEffect, useId, useRef, useState } from "react";

import type { Lang } from "@/lib/i18n";
import {
  THEME_CHANGE_EVENT,
  THEME_STORAGE_KEY,
  isResolvedTheme,
  isThemePreference,
  themeCycle,
  themePreferences,
  type ResolvedTheme,
  type ThemePreference,
} from "@/lib/theme";

type ThemeSwitcherProps = {
  lang: Lang;
};

type ThemeLabels = {
  active: string;
  change: string;
  choose: string;
  menu: string;
  modes: Record<ThemePreference, string>;
};

const labels: Record<Lang, ThemeLabels> = {
  sr: { active: "Aktivna tema", change: "Promeni temu", choose: "Izaberi podrazumevanu temu", menu: "Izbor teme", modes: { system: "Sistem", dark: "Tamni režim", light: "Svetli režim", bordeaux: "Bordo režim" } },
  en: { active: "Active theme", change: "Change theme", choose: "Choose default theme", menu: "Theme options", modes: { system: "System", dark: "Dark mode", light: "Light mode", bordeaux: "Bordeaux mode" } },
  tr: { active: "Etkin tema", change: "Temayı değiştir", choose: "Varsayılan temayı seç", menu: "Tema seçenekleri", modes: { system: "Sistem", dark: "Koyu mod", light: "Açık mod", bordeaux: "Bordo mod" } },
  fr: { active: "Thème actif", change: "Changer de thème", choose: "Choisir le thème par défaut", menu: "Options du thème", modes: { system: "Système", dark: "Mode sombre", light: "Mode clair", bordeaux: "Mode bordeaux" } },
  de: { active: "Aktives Theme", change: "Theme wechseln", choose: "Standard-Theme wählen", menu: "Theme-Auswahl", modes: { system: "System", dark: "Dunkler Modus", light: "Heller Modus", bordeaux: "Bordeaux-Modus" } },
  es: { active: "Tema activo", change: "Cambiar tema", choose: "Elegir tema predeterminado", menu: "Opciones de tema", modes: { system: "Sistema", dark: "Modo oscuro", light: "Modo claro", bordeaux: "Modo burdeos" } },
  el: { active: "Ενεργό θέμα", change: "Αλλαγή θέματος", choose: "Επιλογή προεπιλεγμένου θέματος", menu: "Επιλογές θέματος", modes: { system: "Σύστημα", dark: "Σκούρα λειτουργία", light: "Φωτεινή λειτουργία", bordeaux: "Μπορντό λειτουργία" } },
  ar: { active: "المظهر النشط", change: "تغيير المظهر", choose: "اختيار المظهر الافتراضي", menu: "خيارات المظهر", modes: { system: "النظام", dark: "الوضع الداكن", light: "الوضع الفاتح", bordeaux: "الوضع العنابي" } },
};

function getSystemTheme(): ResolvedTheme {
  return typeof window.matchMedia === "function" && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getDocumentPreference(): ThemePreference {
  const preference = document.documentElement.dataset.themePreference;
  return isThemePreference(preference) ? preference : "system";
}

function applyThemePreference(preference: ThemePreference, persist = true) {
  const resolvedTheme = preference === "system" ? getSystemTheme() : preference;
  const root = document.documentElement;

  root.dataset.theme = resolvedTheme;
  root.dataset.themePreference = preference;
  root.style.colorScheme = resolvedTheme === "light" ? "light" : "dark";

  if (persist) {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, preference);
    } catch {
      // The active theme still works when browser storage is unavailable.
    }
  }

  window.dispatchEvent(new CustomEvent(THEME_CHANGE_EVENT, {
    detail: { preference, theme: resolvedTheme },
  }));
}

function ThemeIcon({ theme }: { theme: ResolvedTheme }) {
  if (theme === "dark") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M14.7 3.4a1 1 0 0 1 .6 1.7A7.5 7.5 0 1 0 19 18.8a1 1 0 0 1 1.1 1.6 9.5 9.5 0 1 1-5.4-17Z" fill="currentColor" />
      </svg>
    );
  }

  if (theme === "light") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="3.8" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="M12 3.5v2M12 18.5v2M3.5 12h2M18.5 12h2M6 6l1.4 1.4M16.6 16.6 18 18M18 6l-1.4 1.4M7.4 16.6 6 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m12 3 7 9-7 9-7-9Z" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="m12 7 3.8 5-3.8 5-3.8-5Z" fill="currentColor" opacity=".42" />
    </svg>
  );
}

export function ThemeSwitcher({ lang }: ThemeSwitcherProps) {
  const [theme, setTheme] = useState<ResolvedTheme>("dark");
  const [preference, setPreference] = useState<ThemePreference>("system");
  const [menuOpen, setMenuOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();
  const copy = labels[lang];

  useEffect(() => {
    const syncFromDocument = () => {
      const currentTheme = document.documentElement.dataset.theme;
      setTheme(isResolvedTheme(currentTheme) ? currentTheme : getSystemTheme());
      setPreference(getDocumentPreference());
    };
    const mediaQuery = typeof window.matchMedia === "function" ? window.matchMedia("(prefers-color-scheme: dark)") : null;
    const handleSystemChange = () => {
      if (getDocumentPreference() === "system") {
        applyThemePreference("system", false);
      }
    };
    const handleStorage = (event: StorageEvent) => {
      if (event.key === THEME_STORAGE_KEY) {
        applyThemePreference(isThemePreference(event.newValue) ? event.newValue : "system", false);
      }
    };

    syncFromDocument();
    window.addEventListener(THEME_CHANGE_EVENT, syncFromDocument);
    window.addEventListener("storage", handleStorage);
    mediaQuery?.addEventListener("change", handleSystemChange);

    return () => {
      window.removeEventListener(THEME_CHANGE_EVENT, syncFromDocument);
      window.removeEventListener("storage", handleStorage);
      mediaQuery?.removeEventListener("change", handleSystemChange);
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [menuOpen]);

  function handleCycle() {
    const currentIndex = themeCycle.indexOf(theme);
    const nextTheme = themeCycle[(currentIndex + 1) % themeCycle.length];
    applyThemePreference(nextTheme);
  }

  function handlePreference(nextPreference: ThemePreference) {
    applyThemePreference(nextPreference);
    setMenuOpen(false);
    menuTriggerRef.current?.focus();
  }

  return (
    <div
      className="theme-control"
      ref={rootRef}
      onKeyDown={(event) => {
        if (event.key === "Escape" && menuOpen) {
          setMenuOpen(false);
          menuTriggerRef.current?.focus();
        }
      }}
    >
      <button
        type="button"
        className="theme-toggle"
        onClick={handleCycle}
        aria-label={`${copy.active}: ${copy.modes[theme]}. ${copy.change}`}
        title={copy.modes[theme]}
      >
        <span className={`theme-toggle__icon theme-toggle__icon--${theme}`}>
          <ThemeIcon theme={theme} />
        </span>
      </button>

      <button
        type="button"
        className="theme-preference-toggle"
        ref={menuTriggerRef}
        aria-label={copy.choose}
        title={copy.choose}
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        aria-controls={menuId}
        onClick={() => setMenuOpen((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setMenuOpen(true);
          }
        }}
      >
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <path d="m4 6 4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {menuOpen ? (
        <div className="theme-preference-menu" id={menuId} role="menu" aria-label={copy.menu}>
          {themePreferences.map((option) => (
            <button
              key={option}
              type="button"
              className="theme-preference-menu__option"
              role="menuitemradio"
              aria-checked={preference === option}
              onClick={() => handlePreference(option)}
            >
              <span className={`theme-preference-menu__swatch theme-preference-menu__swatch--${option}`} aria-hidden="true" />
              <span>{copy.modes[option]}</span>
              <span className="theme-preference-menu__check" aria-hidden="true">
                {preference === option ? (
                  <svg viewBox="0 0 16 16"><path d="m3 8.2 3.1 3.1L13 4.7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                ) : null}
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
