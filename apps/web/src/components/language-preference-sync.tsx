"use client";

import { useEffect } from "react";

import {
  LANGUAGE_COOKIE_NAME,
  LANGUAGE_STORAGE_KEY,
  getLanguageDirection,
  type Lang,
} from "@/lib/i18n";

export function LanguagePreferenceSync({ lang }: { lang: Lang }) {
  useEffect(() => {
    const root = document.documentElement;
    root.lang = lang;
    root.dir = getLanguageDirection(lang);

    document.cookie = `${LANGUAGE_COOKIE_NAME}=${lang}; path=/; max-age=31536000; SameSite=Lax`;

    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    } catch {
      // Ignore storage failures in restricted environments.
    }
  }, [lang]);

  return null;
}
