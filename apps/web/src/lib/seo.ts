import type { Metadata } from "next";

import { languages, type Lang } from "@/lib/i18n";
import { normalizeSerbianLatin } from "@/lib/serbian-latin";

export const SITE_URL = "https://avangarda.media";
export const SITE_NAME = "Avangarda";
export const SITE_TITLE = "Avangarda | Human Rights";
export const SITE_OG_IMAGE = "/assets/og/people-fallback-v2.jpg?share=site-v3";
export const INTERACTIVE_OG_IMAGE = "/assets/og/interaktivno.png";
export const HUMAN_RIGHTS_OG_IMAGE = "/assets/og/ljudska-prava-pravni-kompas.png";
export const COLLABORATION_OG_IMAGE = "/assets/og/saradnja-price-tragovi-pitanja.png";
export const HOME_URL = `${SITE_URL}/`;

const DEFAULT_OG_IMAGE_WIDTH = 1200;
const DEFAULT_OG_IMAGE_HEIGHT = 630;
const DEFAULT_OG_IMAGE_TYPE = "image/jpeg";
const EDITORIAL_OG_IMAGE_WIDTH = 1731;
const EDITORIAL_OG_IMAGE_HEIGHT = 909;

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
  const description = descriptionByLang[lang] || descriptionByLang.sr;
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
  const includeLangParam = options.includeLangParam ?? true;
  const [pathWithQuery, hash = ""] = normalizedPath.split("#");
  const [rawPathname, query = ""] = pathWithQuery.split("?");
  const localizedPathname = includeLangParam
    ? rawPathname === "/" ? `/${lang}` : `/${lang}${rawPathname}`
    : rawPathname;
  const params = new URLSearchParams(query);
  params.delete("lang");
  const url = new URL(localizedPathname, SITE_URL);
  params.forEach((value, key) => url.searchParams.append(key, value));
  if (hash) url.hash = hash;

  return url.toString();
}

export function buildXDefaultUrl(pathname: string) {
  return buildLocalizedUrl(pathname, "sr", { includeLangParam: false });
}

export function getShareImageForPathname(pathname: string) {
  if (pathname === "/interaktivno" || pathname.startsWith("/interaktivno/")) {
    return INTERACTIVE_OG_IMAGE;
  }

  if (
    pathname === "/ljudska-prava" ||
    pathname.startsWith("/ljudska-prava/") ||
    pathname === "/pravni-kompas" ||
    pathname.startsWith("/pravni-kompas/")
  ) {
    return HUMAN_RIGHTS_OG_IMAGE;
  }

  if (["/contribute", "/saradnja", "/podrzi"].includes(pathname)) {
    return COLLABORATION_OG_IMAGE;
  }

  return SITE_OG_IMAGE;
}

export function buildSeoMetadata({
  lang,
  pathname = "/",
  title = SITE_TITLE,
  description = getSeoDescription(lang),
  image,
  imageDetails
}: {
  lang: Lang;
  pathname?: string;
  title?: string;
  description?: string;
  image?: string;
  imageDetails?: {
    width: number;
    height: number;
    type: string;
    alt: string;
  };
}): Metadata {
  const canonical = buildLocalizedUrl(pathname, lang);
  const resolvedImage = image || getShareImageForPathname(pathname);
  const imageUrl = resolvedImage.startsWith("http://") || resolvedImage.startsWith("https://")
    ? resolvedImage
    : new URL(resolvedImage, SITE_URL).toString();
  const isDefaultOgImage = resolvedImage.startsWith(SITE_OG_IMAGE.split("?")[0]);
  const isEditorialOgImage = resolvedImage.startsWith("/assets/og/");
  const normalizedDescription = description.trim();
  const safeDescription = normalizedDescription && !/^[\s\-–—_.]+$/u.test(normalizedDescription)
    ? normalizedDescription
    : getSeoDescription(lang);
  const resolvedImageWidth = imageDetails?.width ?? (isDefaultOgImage ? DEFAULT_OG_IMAGE_WIDTH : isEditorialOgImage ? EDITORIAL_OG_IMAGE_WIDTH : 1024);
  const resolvedImageHeight = imageDetails?.height ?? (isDefaultOgImage ? DEFAULT_OG_IMAGE_HEIGHT : isEditorialOgImage ? EDITORIAL_OG_IMAGE_HEIGHT : 1024);
  const resolvedImageType = imageDetails?.type ?? (isDefaultOgImage ? DEFAULT_OG_IMAGE_TYPE : undefined);

  return {
    metadataBase: new URL(SITE_URL),
    title,
    description: safeDescription,
    alternates: {
      canonical,
      languages: Object.fromEntries([
        ...languages.map((language) => [language.code, buildLocalizedUrl(pathname, language.code)]),
        ["x-default", buildXDefaultUrl(pathname)],
      ]),
    },
    openGraph: {
      title,
      description: safeDescription,
      url: canonical,
      type: "website",
      siteName: SITE_NAME,
      locale: openGraphLocaleByLang[lang],
      images: [
        {
          url: imageUrl,
          secureUrl: imageUrl,
          width: resolvedImageWidth,
          height: resolvedImageHeight,
          type: resolvedImageType,
          alt: imageDetails?.alt ?? "Avangarda"
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: safeDescription,
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
