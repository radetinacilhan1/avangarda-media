import { languages, type Lang } from "@/lib/i18n";

const text = (value: unknown) => typeof value === "string" ? value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() : "";

/** Advertise only explicitly stored title/body translations, never UI-only fallback. */
export function getArticleLanguages(article: object): Lang[] {
  const record = article as Record<string, unknown>;
  return languages.map(({ code }) => code).filter(lang => lang === "sr" || (
    Boolean(text(record[`title_${lang}`]) && text(record[`content_${lang}`])) &&
    text(record[`content_${lang}`]) !== text(record.content)
  ));
}

export function getArticleCanonicalLanguage(article: object, lang: Lang): Lang {
  if (lang === "sr") return lang;
  const record = article as Record<string, unknown>;
  // A partially translated article stays independent. Consolidate only a true fallback.
  const differs = ["title", "subtitle", "content"].some(field => {
    const translated = text(record[`${field}_${lang}`]);
    return translated && translated !== text(record[field]);
  });
  return differs ? lang : "sr";
}
