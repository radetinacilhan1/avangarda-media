"use client";

import { useEffect, useState } from "react";

import type { Lang } from "@/lib/i18n";

type ThemeMode = "dark" | "light";

type ThemeSwitcherProps = {
  lang: Lang;
};

const labels: Record<Lang, { toggle: string; dark: string; light: string }> = {
  sr: { toggle: "Promeni temu", dark: "Tamna tema", light: "Svetla tema" },
  en: { toggle: "Change theme", dark: "Dark theme", light: "Light theme" },
  tr: { toggle: "Temayi degistir", dark: "Koyu tema", light: "Acik tema" },
  fr: { toggle: "Changer le theme", dark: "Theme sombre", light: "Theme clair" },
  de: { toggle: "Thema wechseln", dark: "Dunkles Thema", light: "Helles Thema" },
  es: { toggle: "Cambiar tema", dark: "Tema oscuro", light: "Tema claro" },
  el: { toggle: "Αλλαγή θέματος", dark: "Σκούρο θέμα", light: "Ανοιχτό θέμα" },
  ar: { toggle: "تغيير النمط", dark: "الوضع الداكن", light: "الوضع الفاتح" }
};

const STORAGE_KEY = "avangarda-theme";

function applyTheme(theme: ThemeMode) {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.style.colorScheme = theme === "light" ? "light" : "dark";
  window.localStorage.setItem(STORAGE_KEY, theme);
}

export function ThemeSwitcher({ lang }: ThemeSwitcherProps) {
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const copy = labels[lang];

  useEffect(() => {
    const current = document.documentElement.dataset.theme;
    if (current === "light" || current === "dark") {
      setTheme(current);
    }
  }, []);

  function handleToggle() {
    const nextTheme: ThemeMode = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    applyTheme(nextTheme);
  }

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={handleToggle}
      aria-label={`${copy.toggle}: ${theme === "dark" ? copy.light : copy.dark}`}
      title={theme === "dark" ? copy.light : copy.dark}
    >
      <span className={theme === "dark" ? "theme-toggle__icon theme-toggle__icon--moon" : "theme-toggle__icon theme-toggle__icon--sun"}>
        {theme === "dark" ? (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M14.7 3.4a1 1 0 0 1 .6 1.7A7.5 7.5 0 1 0 19 18.8a1 1 0 0 1 1.1 1.6 9.5 9.5 0 1 1-5.4-17Z"
              fill="currentColor"
            />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M12 4.5a1 1 0 0 1 1 1V7a1 1 0 1 1-2 0V5.5a1 1 0 0 1 1-1Zm0 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Zm7.5-5.5a1 1 0 0 1 1 1 1 1 0 0 1-1 1H18a1 1 0 1 1 0-2h1.5Zm-13.5 0a1 1 0 1 1 0 2H4.5a1 1 0 1 1 0-2H6Zm9.55 5.95a1 1 0 0 1 1.4 0l1.05 1.06a1 1 0 1 1-1.4 1.4l-1.06-1.05a1 1 0 0 1 0-1.41Zm-9.1 0a1 1 0 0 1 0 1.41L5.4 19.42a1 1 0 0 1-1.4-1.4l1.05-1.06a1 1 0 0 1 1.4 0Zm10.15-10.15a1 1 0 0 1 0 1.4l-1.06 1.06a1 1 0 1 1-1.4-1.41l1.05-1.05a1 1 0 0 1 1.41 0Zm-9.1 0 1.05 1.05A1 1 0 0 1 7.1 9.21L6.04 8.15a1 1 0 1 1 1.41-1.4ZM12 17a1 1 0 0 1 1 1v1.5a1 1 0 1 1-2 0V18a1 1 0 0 1 1-1Z"
              fill="currentColor"
            />
          </svg>
        )}
      </span>
    </button>
  );
}
