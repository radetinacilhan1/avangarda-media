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
    city: "Grad",
    deck: "Diskretan pregled AQI signala kroz vise gradova i drzava, bez preuzimanja fokusa sa naslovne.",
    loading: "Ucitavanje",
    source: "Open-Meteo",
    updated: "Azurirano",
    fallback: "Prikazano je poslednje dostupno ocitavanje.",
    noData: "Podaci trenutno nisu dostupni za ovaj grad.",
    good: "Dobar",
    moderate: "Umeren",
    bad: "Los",
    unknown: "Bez ocene"
  },
  en: {
    eyebrow: "Air",
    title: "Air quality",
    city: "City",
    deck: "A compact AQI signal across multiple cities and countries without competing with the homepage lead.",
    loading: "Loading",
    source: "Open-Meteo",
    updated: "Updated",
    fallback: "Showing the latest available reading.",
    noData: "Air quality data is not available for this city right now.",
    good: "Good",
    moderate: "Moderate",
    bad: "Poor",
    unknown: "Unknown"
  },
  tr: {
    eyebrow: "Hava",
    title: "Hava kalitesi",
    city: "Sehir",
    deck: "Ana sayfayla yarismadan birden fazla sehir ve ulke icin kisa AQI gorunumu.",
    loading: "Yukleniyor",
    source: "Open-Meteo",
    updated: "Guncellendi",
    fallback: "Son mevcut olcum gosteriliyor.",
    noData: "Bu sehir icin hava verisi su anda mevcut degil.",
    good: "Iyi",
    moderate: "Orta",
    bad: "Kotu",
    unknown: "Bilinmiyor"
  },
  fr: {
    eyebrow: "Air",
    title: "Qualite de l'air",
    city: "Ville",
    deck: "Un signal AQI compact pour plusieurs villes et pays sans casser le rythme editorial.",
    loading: "Chargement",
    source: "Open-Meteo",
    updated: "Mis a jour",
    fallback: "Affichage de la derniere mesure disponible.",
    noData: "Les donnees AQI ne sont pas disponibles pour cette ville.",
    good: "Bon",
    moderate: "Moyen",
    bad: "Mauvais",
    unknown: "Inconnu"
  },
  de: {
    eyebrow: "Luft",
    title: "Luftqualitat",
    city: "Stadt",
    deck: "Ein kompakter AQI-Blick uber mehrere Stadte und Lander ohne die Startseite zu uberladen.",
    loading: "Laedt",
    source: "Open-Meteo",
    updated: "Aktualisiert",
    fallback: "Letzte verfugbare Messung wird gezeigt.",
    noData: "Fur diese Stadt sind aktuell keine AQI-Daten verfugbar.",
    good: "Gut",
    moderate: "Mittel",
    bad: "Schlecht",
    unknown: "Unbekannt"
  }
};

function getLocale(lang: Lang) {
  return (
    lang === "en" ? "en-GB" :
    lang === "tr" ? "tr-TR" :
    lang === "fr" ? "fr-FR" :
    lang === "de" ? "de-DE" :
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
    `Prikupljamo poslednji AQI za ${city}.`
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
  const copy = AIR_QUALITY_COPY[lang];
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
