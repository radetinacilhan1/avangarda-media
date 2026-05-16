"use client";

import { useEffect, useState } from "react";

import type { Lang } from "@/lib/i18n";

const TIME_ZONE = "Europe/Belgrade";

function getLocale(lang: Lang) {
  switch (lang) {
    case "es":
      return "es-ES";
    case "el":
      return "el-GR";
    case "ar":
      return "ar";
    case "tr":
      return "tr-TR";
    case "fr":
      return "fr-FR";
    case "de":
      return "de-DE";
    case "en":
      return "en-GB";
    case "sr":
    default:
      return "sr-RS";
  }
}

function formatClock(lang: Lang) {
  return new Intl.DateTimeFormat(getLocale(lang), {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: TIME_ZONE
  }).format(new Date());
}

export function HeaderClock({ lang }: { lang: Lang }) {
  const [time, setTime] = useState(() => formatClock(lang));
  const label =
    lang === "es" ? "Hora actual" :
    lang === "el" ? "Τρέχουσα ώρα" :
    lang === "ar" ? "الوقت الحالي" :
    lang === "en" ? "Current time" :
    lang === "tr" ? "Guncel saat" :
    lang === "fr" ? "Heure actuelle" :
    lang === "de" ? "Aktuelle Uhrzeit" :
    "Trenutno vreme";

  useEffect(() => {
    const updateClock = () => setTime(formatClock(lang));

    updateClock();
    const interval = window.setInterval(updateClock, 15000);
    return () => window.clearInterval(interval);
  }, [lang]);

  return (
    <div className="header-clock" aria-label={label} title={label}>
      <span className="header-clock__value" suppressHydrationWarning>
        {time}
      </span>
    </div>
  );
}
