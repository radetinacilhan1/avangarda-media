import type { Lang } from "@/lib/i18n";
import { normalizeSerbianLatin } from "@/lib/serbian-latin";
import { unwrapStrapiCollection } from "@/lib/strapi";
import { resolveExistingStoryLocationHref } from "@/lib/story-map";

type LocationRecord = { id?: number; slug?: string; name?: string; active?: boolean; latitude?: number; longitude?: number; [key: string]: unknown };

export function articleLocations(value: unknown, lang: Lang) {
  const seen = new Set<string>();
  return unwrapStrapiCollection<LocationRecord>(value).flatMap(location => {
    const translated = lang === "sr" ? location.name : location[`name_${lang}`];
    const name = typeof translated === "string" && translated.trim() ? translated.trim() : location.name?.trim();
    const key = String(location.id || location.slug || name || "");
    if (!name || seen.has(key)) return [];
    seen.add(key);
    return [{ key, name: lang === "sr" ? normalizeSerbianLatin(name) : name,
      href: resolveExistingStoryLocationHref(location, lang) }];
  });
}

const readingCopy: Record<Lang, (minutes: string) => string> = {
  sr: value => `${value} min čitanja`, en: value => `${value} min read`, tr: value => `${value} dk okuma`,
  fr: value => `${value} min de lecture`, de: value => `${value} Min. Lesezeit`, es: value => `${value} min de lectura`,
  el: value => `${value} λεπτά ανάγνωσης`, ar: value => `${value} دقائق للقراءة`,
};

export function articleReadingTime(value: unknown, lang: Lang) {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0 || !Number.isInteger(value)) return "";
  return readingCopy[lang](new Intl.NumberFormat(lang === "sr" ? "sr-Latn" : lang).format(value));
}
