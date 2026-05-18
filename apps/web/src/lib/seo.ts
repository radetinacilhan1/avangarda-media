import type { Metadata } from "next";

import { languages, type Lang } from "@/lib/i18n";
import { normalizeSerbianLatin } from "@/lib/serbian-latin";

export const SITE_URL = "https://avangarda.media";
export const SITE_NAME = "Avangarda";
export const SITE_TITLE = "Avangarda | Human Rights";
export const SITE_OG_IMAGE = "/avangarda-logo.png";
export const HOME_URL = `${SITE_URL}/`;

const descriptionByLang: Record<Lang, string> = {
  sr: "Avangarda je nezavisna medijska platforma za ljudska prava, društvo, demokratiju, ekologiju, sećanje, rad, manjine i politički život Balkana i sveta.",
  en: "Avangarda is a raw and real human rights media platform focused on society, democracy, environment, memory, labour, minorities and political life in the Balkans and beyond.",
  tr: "Avangarda, toplum, demokrasi, ekoloji, hafiza, emek, azinliklar ve Balkanlar ile dunyanin siyasi yasamina odaklanan ham ve gercek bir insan haklari medya platformudur.",
  fr: "Avangarda est une plateforme mediatique brute et reelle consacree aux droits humains, a la societe, a la democratie, a l'ecologie, a la memoire, au travail, aux minorites et a la vie politique des Balkans et d'ailleurs.",
  de: "Avangarda ist eine rohe und reale Menschenrechts-Medienplattform mit Fokus auf Gesellschaft, Demokratie, Umwelt, Erinnerung, Arbeit, Minderheiten sowie politisches Leben auf dem Balkan und darueber hinaus.",
  es: "Avangarda es una plataforma mediática de derechos humanos, directa y real, centrada en sociedad, democracia, medio ambiente, memoria, trabajo, minorías y vida política en los Balcanes y más allá.",
  el: "Η Avangarda είναι μια πλατφόρμα ανθρωπίνων δικαιωμάτων, άμεση και ουσιαστική, με έμφαση στην κοινωνία, τη δημοκρατία, το περιβάλλον, τη μνήμη, την εργασία, τις μειονότητες και την πολιτική ζωή στα Βαλκάνια και πέρα από αυτά.",
  ar: "أفانغاردا منصة إعلامية جريئة وواقعية لحقوق الإنسان تركز على المجتمع والديمقراطية والبيئة والذاكرة والعمل والأقليات والحياة السياسية في البلقان وما بعدها."
};

const openGraphLocaleByLang: Record<Lang, string> = {
  sr: "sr_RS",
  en: "en_GB",
  tr: "tr_TR",
  fr: "fr_FR",
  de: "de_DE",
  es: "es_ES",
  el: "el_GR",
  ar: "ar_SA"
};

export function getSeoDescription(lang: Lang) {
  const description = descriptionByLang[lang] || descriptionByLang.en;
  return lang === "sr" ? normalizeSerbianLatin(description) : description;
}

export function buildPageTitle(title: string) {
  const trimmedTitle = title.trim();
  return trimmedTitle ? `${trimmedTitle} | ${SITE_TITLE}` : SITE_TITLE;
}

type LocalizedUrlOptions = {
  includeLangParam?: boolean;
};

export function buildLocalizedUrl(pathname: string, lang: Lang, options: LocalizedUrlOptions = {}) {
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const isHomepage = normalizedPath === "/";
  const url = isHomepage ? new URL(SITE_URL) : new URL(normalizedPath, SITE_URL);
  const includeLangParam = options.includeLangParam ?? true;

  if (includeLangParam) {
    url.searchParams.set("lang", lang);
  }

  return url.toString();
}

export function buildXDefaultUrl(pathname: string) {
  return buildLocalizedUrl(pathname, "sr", { includeLangParam: false });
}

export function buildSeoMetadata({
  lang,
  pathname = "/",
  title = SITE_TITLE,
  description = getSeoDescription(lang),
  image = SITE_OG_IMAGE
}: {
  lang: Lang;
  pathname?: string;
  title?: string;
  description?: string;
  image?: string;
}): Metadata {
  const canonical = buildLocalizedUrl(pathname, lang);
  const imageUrl = image.startsWith("http://") || image.startsWith("https://")
    ? image
    : new URL(image, SITE_URL).toString();

  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
      siteName: SITE_NAME,
      locale: openGraphLocaleByLang[lang],
      images: [
        {
          url: imageUrl,
          width: 1024,
          height: 1024,
          alt: "Avangarda"
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl]
    }
  };
}

export function buildSiteStructuredData(lang: Lang) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        alternateName: ["Avangarda Media", "avangarda.media"],
        url: HOME_URL,
        logo: {
          "@type": "ImageObject",
          url: `${SITE_URL}/avangarda-logo.png`,
          width: 1024,
          height: 1024
        },
        sameAs: [
          "https://www.instagram.com/avangarda.raw/",
          "https://x.com/avangarda_rs",
          "https://www.youtube.com/@Avangarda-s3i",
          "https://www.tiktok.com/@avangarda.rs?lang=en",
          "https://www.linkedin.com/company/avangarda-human-rights"
        ]
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: HOME_URL,
        name: SITE_NAME,
        alternateName: ["Avangarda Media", "avangarda.media"],
        description: descriptionByLang[lang],
        publisher: {
          "@id": `${SITE_URL}/#organization`
        },
        inLanguage: languages.map((language) => language.code)
      }
    ]
  };
}

export const siteStructuredData = buildSiteStructuredData("sr");
