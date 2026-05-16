"use client";

import type { CSSProperties } from "react";
import { useEffect, useId, useState } from "react";

import {
  airQualityCountryGroups,
  getAirQualityCity,
  getAirQualityCityLabel,
  getAirQualityCountryLabel,
  type AirQualityCityId,
  type AirQualitySnapshot,
  type AirQualityStatus
} from "@/lib/air-quality";
import type { Lang } from "@/lib/i18n";
import { normalizeSerbianLatin, normalizeSerbianLatinDeep } from "@/lib/serbian-latin";

type AirQualityCardProps = {
  lang: Lang;
  defaultCityId?: AirQualityCityId;
  variant?: "sidebar" | "feature";
};

const AIR_QUALITY_COPY: Record<
  Lang,
  {
    eyebrow: string;
    title: string;
    city: string;
    deck: string;
    loading: string;
    source: string;
    updated: string;
    fallback: string;
    noData: string;
    good: string;
    moderate: string;
    bad: string;
    unknown: string;
  }
> = {
  sr: {
    eyebrow: "Atmosfera",
    title: "Kvalitet vazduha",
    city: "Lokacija",
    deck: "Pregled AQI signala kroz gradove i prostore koji oblikuju svakodnevni zivot.",
    loading: "Ucitavanje",
    source: "Open-Meteo",
    updated: "Azurirano",
    fallback: "Prikazano je poslednje dostupno ocitavanje.",
    noData: "Podaci trenutno nisu dostupni za ovu lokaciju.",
    good: "Dobar",
    moderate: "Umeren",
    bad: "Los",
    unknown: "Bez ocene"
  },
  en: {
    eyebrow: "Air",
    title: "Air quality",
    city: "Location",
    deck: "AQI signals across cities and places that shape everyday life.",
    loading: "Loading",
    source: "Open-Meteo",
    updated: "Updated",
    fallback: "Showing the latest available reading.",
    noData: "Air quality data is not available for this location right now.",
    good: "Good",
    moderate: "Moderate",
    bad: "Poor",
    unknown: "Unknown"
  },
  tr: {
    eyebrow: "Hava",
    title: "Hava kalitesi",
    city: "Konum",
    deck: "Gundelik hayati sekillendiren sehir ve mekanlar boyunca AQI sinyalleri.",
    loading: "Yukleniyor",
    source: "Open-Meteo",
    updated: "Guncellendi",
    fallback: "Son mevcut olcum gosteriliyor.",
    noData: "Bu konum icin hava verisi su anda mevcut degil.",
    good: "Iyi",
    moderate: "Orta",
    bad: "Kotu",
    unknown: "Bilinmiyor"
  },
  fr: {
    eyebrow: "Air",
    title: "Qualite de l'air",
    city: "Lieu",
    deck: "Un regard AQI a travers des villes et des lieux qui structurent la vie quotidienne.",
    loading: "Chargement",
    source: "Open-Meteo",
    updated: "Mis a jour",
    fallback: "Affichage de la derniere mesure disponible.",
    noData: "Les donnees AQI ne sont pas disponibles pour ce lieu pour le moment.",
    good: "Bon",
    moderate: "Moyen",
    bad: "Mauvais",
    unknown: "Inconnu"
  },
  de: {
    eyebrow: "Luft",
    title: "Luftqualitat",
    city: "Ort",
    deck: "AQI-Signale aus Stadten und Raeumen, die den Alltag pragen.",
    loading: "Laedt",
    source: "Open-Meteo",
    updated: "Aktualisiert",
    fallback: "Letzte verfugbare Messung wird gezeigt.",
    noData: "Fur diesen Ort sind aktuell keine AQI-Daten verfugbar.",
    good: "Gut",
    moderate: "Mittel",
    bad: "Schlecht",
    unknown: "Unbekannt"
  },
  es: {
    eyebrow: "Atmosfera",
    title: "Calidad del aire",
    city: "Ubicación",
    deck: "Señales AQI a través de ciudades y espacios que moldean la vida cotidiana.",
    loading: "Cargando",
    source: "Open-Meteo",
    updated: "Actualizado",
    fallback: "Se muestra la última medición disponible.",
    noData: "Los datos de calidad del aire no están disponibles para esta ubicación en este momento.",
    good: "Buena",
    moderate: "Moderada",
    bad: "Mala",
    unknown: "Sin dato"
  },
  el: {
    eyebrow: "Ατμόσφαιρα",
    title: "Ποιότητα αέρα",
    city: "Τοποθεσία",
    deck: "Σήματα AQI από πόλεις και χώρους που διαμορφώνουν την καθημερινή ζωή.",
    loading: "Φόρτωση",
    source: "Open-Meteo",
    updated: "Ενημερώθηκε",
    fallback: "Εμφανίζεται η τελευταία διαθέσιμη μέτρηση.",
    noData: "Δεν υπάρχουν διαθέσιμα δεδομένα ποιότητας αέρα για αυτή την τοποθεσία αυτή τη στιγμή.",
    good: "Καλή",
    moderate: "Μέτρια",
    bad: "Κακή",
    unknown: "Άγνωστο"
  },
  ar: {
    eyebrow: "الغلاف الجوي",
    title: "جودة الهواء",
    city: "الموقع",
    deck: "إشارات AQI عبر المدن والأماكن التي تشكّل الحياة اليومية.",
    loading: "جارٍ التحميل",
    source: "Open-Meteo",
    updated: "آخر تحديث",
    fallback: "يتم عرض آخر قراءة متاحة.",
    noData: "بيانات جودة الهواء غير متاحة لهذه المنطقة حالياً.",
    good: "جيدة",
    moderate: "متوسطة",
    bad: "سيئة",
    unknown: "غير معروف"
  }
};

function getLocale(lang: Lang) {
  return (
    lang === "en" ? "en-GB" :
    lang === "tr" ? "tr-TR" :
    lang === "fr" ? "fr-FR" :
    lang === "de" ? "de-DE" :
    lang === "es" ? "es-ES" :
    lang === "el" ? "el-GR" :
    lang === "ar" ? "ar" :
    "sr-Latn-RS"
  );
}

function formatAqiValue(value: number | null, lang: Lang) {
  if (value === null) return "--";

  return new Intl.NumberFormat(getLocale(lang), {
    maximumFractionDigits: 0
  }).format(value);
}

function formatParticleValue(value: number | null, lang: Lang) {
  if (value === null) return "--";

  return new Intl.NumberFormat(getLocale(lang), {
    maximumFractionDigits: 1
  }).format(value);
}

function formatMeasuredAt(value: string | null, lang: Lang) {
  if (!value) return "";

  try {
    return new Intl.DateTimeFormat(getLocale(lang), {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function getStatusLabel(status: AirQualityStatus, lang: Lang) {
  const copy = AIR_QUALITY_COPY[lang];

  return (
    status === "good" ? copy.good :
    status === "moderate" ? copy.moderate :
    status === "bad" ? copy.bad :
    copy.unknown
  );
}

function buildLoadingCopy(lang: Lang, city: string) {
  return (
    lang === "en" ? `Fetching the latest AQI for ${city}.` :
    lang === "tr" ? `${city} icin son AQI getiriliyor.` :
    lang === "fr" ? `Recuperation du dernier AQI pour ${city}.` :
    lang === "de" ? `Letzter AQI fur ${city} wird geladen.` :
    lang === "es" ? `Recuperando el ultimo AQI para ${city}.` :
    lang === "el" ? `Γίνεται λήψη του τελευταίου AQI για ${city}.` :
    lang === "ar" ? `جارٍ جلب آخر قراءة AQI لـ ${city}.` :
    normalizeSerbianLatin(`Prikupljamo poslednji AQI za ${city}.`)
  );
}

function buildParticleCopy(snapshot: AirQualitySnapshot, lang: Lang) {
  return `PM2.5 ${formatParticleValue(snapshot.pm2_5, lang)} | PM10 ${formatParticleValue(snapshot.pm10, lang)}`;
}

export function AirQualityCard({
  lang,
  defaultCityId = "belgrade",
  variant = "sidebar"
}: AirQualityCardProps) {
  const copy = lang === "sr" ? normalizeSerbianLatinDeep(AIR_QUALITY_COPY[lang]) : AIR_QUALITY_COPY[lang];
  const selectId = useId();
  const [selectedCityId, setSelectedCityId] = useState<AirQualityCityId>(defaultCityId);
  const [snapshot, setSnapshot] = useState<AirQualitySnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [requestFailed, setRequestFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setIsLoading(true);
    setRequestFailed(false);

    fetch(`/api/air-quality?city=${selectedCityId}&lang=${lang}`, {
      signal: controller.signal,
      cache: "no-store"
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch air quality");
        }

        return response.json() as Promise<AirQualitySnapshot>;
      })
      .then((data) => {
        if (!active) return;
        setSnapshot(data);
      })
      .catch((error) => {
        if (!active || (error as { name?: string })?.name === "AbortError") return;
        setRequestFailed(true);
      })
      .finally(() => {
        if (!active) return;
        setIsLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [lang, selectedCityId]);

  const activeSnapshot = snapshot?.cityId === selectedCityId ? snapshot : null;
  const selectedCity = getAirQualityCity(selectedCityId);
  const selectedCityLabel = getAirQualityCityLabel(selectedCity, lang);
  const isPendingCity = isLoading && !activeSnapshot;
  const isAvailable = Boolean(activeSnapshot?.available);
  const progress = activeSnapshot?.aqi !== null && activeSnapshot?.aqi !== undefined
    ? Math.max(0, Math.min(100, activeSnapshot.aqi))
    : 0;
  const scaleStyle = {
    "--air-quality-progress": `${progress}%`
  } as CSSProperties;

  const statusLabel = isPendingCity
    ? copy.loading
    : getStatusLabel(activeSnapshot?.status || "unknown", lang);

  const detailCopy = isPendingCity
    ? buildLoadingCopy(lang, selectedCityLabel)
    : isAvailable && activeSnapshot
      ? buildParticleCopy(activeSnapshot, lang)
      : copy.noData;

  const metaCopy = isPendingCity
    ? `${copy.city}: ${selectedCityLabel}`
    : isAvailable && activeSnapshot
      ? activeSnapshot.fallbackUsed
        ? copy.fallback
        : activeSnapshot.measuredAt
          ? `${copy.updated} ${formatMeasuredAt(activeSnapshot.measuredAt, lang)}`
          : copy.source
      : requestFailed
        ? copy.noData
        : `${copy.city}: ${selectedCityLabel}`;

  return (
    <section
      className={
        variant === "feature"
          ? "panel homepage-sidebar__panel homepage-sidebar__panel--air-quality air-quality-card air-quality-card--feature"
          : "panel homepage-sidebar__panel homepage-sidebar__panel--air-quality air-quality-card"
      }
    >
      <div className="homepage-sidebar__heading homepage-sidebar__air-quality-heading">
        <div>
          <span className="eyebrow">{copy.eyebrow}</span>
          <h3 className="homepage-sidebar__air-quality-title">{copy.title}</h3>
          {variant === "feature" ? (
            <p className="homepage-sidebar__air-quality-intro">{copy.deck}</p>
          ) : null}
        </div>

        <label className="homepage-sidebar__air-quality-field" htmlFor={selectId}>
          <span className="homepage-sidebar__air-quality-label">{copy.city}</span>
          <select
            id={selectId}
            className="homepage-sidebar__air-quality-select"
            value={selectedCityId}
            onChange={(event) => setSelectedCityId(event.target.value)}
          >
            {airQualityCountryGroups.map((country) => (
              <optgroup
                key={country.id}
                label={getAirQualityCountryLabel(country, lang)}
              >
                {country.cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {getAirQualityCityLabel(city, lang)}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>
      </div>

      <div className="homepage-sidebar__air-quality-body" aria-live="polite">
        <div className="homepage-sidebar__air-quality-meter">
          <div className="homepage-sidebar__air-quality-score">
            <span className="homepage-sidebar__air-quality-value">
              {isPendingCity ? "..." : formatAqiValue(activeSnapshot?.aqi ?? null, lang)}
            </span>
            <span className="homepage-sidebar__air-quality-unit">AQI</span>
          </div>

          <div className="homepage-sidebar__air-quality-summary">
            <span
              className={
                isPendingCity
                  ? "homepage-sidebar__air-quality-status homepage-sidebar__air-quality-status--unknown"
                  : `homepage-sidebar__air-quality-status homepage-sidebar__air-quality-status--${activeSnapshot?.status || "unknown"}`
              }
            >
              {statusLabel}
            </span>
            <p>{detailCopy}</p>
          </div>
        </div>

        <div
          className={
            isAvailable
              ? "homepage-sidebar__air-quality-scale"
              : "homepage-sidebar__air-quality-scale homepage-sidebar__air-quality-scale--inactive"
          }
          style={scaleStyle}
          aria-hidden="true"
        >
          <span className="homepage-sidebar__air-quality-scale-segment homepage-sidebar__air-quality-scale-segment--good" />
          <span className="homepage-sidebar__air-quality-scale-segment homepage-sidebar__air-quality-scale-segment--moderate" />
          <span className="homepage-sidebar__air-quality-scale-segment homepage-sidebar__air-quality-scale-segment--bad" />
        </div>

        <div className="homepage-sidebar__air-quality-meta">
          <span className="homepage-sidebar__air-quality-note">{metaCopy}</span>
          <span className="homepage-sidebar__air-quality-source">{copy.source}</span>
        </div>
      </div>
    </section>
  );
}
