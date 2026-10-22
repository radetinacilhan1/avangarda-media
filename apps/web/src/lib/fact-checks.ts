import { cache } from "react";

import { factCheckRatings, type FactCheckRating } from "@/lib/fact-check-copy";
import { languages, type Lang } from "@/lib/i18n";
import { strapiGet, unwrapStrapiCollection, unwrapStrapiSingle } from "@/lib/strapi";

type RecordValue = Record<string, unknown>;
export type FactCheck = {
  id: string | number;
  slug: string;
  title: string;
  claim: string;
  sourceUrl: string;
  claimant: string;
  claimDate: string;
  rating: FactCheckRating;
  summary: string;
  context: string;
  sources: { name: string; url: string; accessedAt: string }[];
  responsiblePerson: string;
  checkedAt: string;
  updatedAt: string;
  corrections: { date: string; note: string }[];
  availableLanguages: Lang[];
  canonicalLang: Lang;
};

const text = (value: unknown) => typeof value === "string" ? value.trim() : "";
const requiredFields = ["title", "claim", "summary", "context"] as const;

export function safeFactCheckUrl(value: unknown) {
  try {
    const url = new URL(text(value));
    return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password ? url.href : "";
  } catch { return ""; }
}

/** Real stored translations only: UI translations and Serbian fallback do not create hreflang entries. */
export function getFactCheckLanguages(record: RecordValue): Lang[] {
  return languages.map(({ code }) => code).filter((lang) => lang === "sr" || (
    requiredFields.every((field) => Boolean(text(record[`${field}_${lang}`]))) &&
    requiredFields.some((field) => text(record[`${field}_${lang}`]) !== text(record[field]))
  ));
}

export function normalizeFactCheck(record: RecordValue, lang: Lang): FactCheck | null {
  const slug = text(record.slug);
  const rating = record.rating as FactCheckRating;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(slug) || !factCheckRatings.includes(rating)) return null;
  if (requiredFields.some((field) => !text(record[field])) || !text(record.responsiblePerson) || !text(record.checkedAt)) return null;
  // Defense in depth when a response includes workflow fields. The CMS public
  // controller is the authority and already removes unpublished/unapproved rows.
  if (("publishedAt" in record && !record.publishedAt) || ("reviewStatus" in record && record.reviewStatus !== "approved")) return null;
  const availableLanguages = getFactCheckLanguages(record);
  const canonicalLang = availableLanguages.includes(lang) ? lang : "sr";
  const local = (field: string, item = record) => text(item[canonicalLang === "sr" ? field : `${field}_${canonicalLang}`]) || text(item[field]);
  const sources = Array.isArray(record.sources) ? record.sources.flatMap((value) => {
    if (!value || typeof value !== "object") return [];
    const source = value as RecordValue;
    const url = safeFactCheckUrl(source.url);
    return url && text(source.name) ? [{ name: text(source.name), url, accessedAt: text(source.accessedAt) }] : [];
  }) : [];
  if (!sources.length) return null;
  return {
    id: typeof record.id === "number" || typeof record.id === "string" ? record.id : slug,
    slug, rating, title: local("title"), claim: local("claim"), summary: local("summary"), context: local("context"),
    sourceUrl: safeFactCheckUrl(record.sourceUrl), claimant: text(record.claimant), claimDate: text(record.claimDate),
    sources, responsiblePerson: text(record.responsiblePerson), checkedAt: text(record.checkedAt), updatedAt: text(record.updatedAt),
    corrections: Array.isArray(record.corrections) ? record.corrections.flatMap((value) => {
      if (!value || typeof value !== "object") return [];
      const entry = value as RecordValue;
      return local("note", entry) ? [{ date: text(entry.date), note: local("note", entry) }] : [];
    }) : [],
    availableLanguages, canonicalLang,
  };
}

type CmsResponse = { data?: unknown; meta?: { pagination?: { pageCount?: number } } };

/** One paginated collection, never one CMS request per card. No fabricated fallback checks. */
export const fetchFactChecks = cache(async (lang: Lang) => {
  const checks: FactCheck[] = [];
  const seen = new Set<string>();
  for (let page = 1; page <= 100; page += 1) {
    const response = await strapiGet<CmsResponse>(`/api/fact-checks?sort[0]=checkedAt:desc&pagination[page]=${page}&pagination[pageSize]=50`).catch(() => null);
    if (!response) return { checks, available: false };
    const rows = unwrapStrapiCollection<RecordValue>(response);
    rows.forEach((row) => {
      const check = normalizeFactCheck(row, lang);
      if (check && !seen.has(check.slug)) { seen.add(check.slug); checks.push(check); }
    });
    const pageCount = response.meta?.pagination?.pageCount;
    if (typeof pageCount === "number" ? page >= pageCount : rows.length < 50) return { checks, available: true };
  }
  return { checks, available: false };
});

export const fetchFactCheck = cache(async (slug: string, lang: Lang) => {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(slug)) return null;
  const response = await strapiGet<CmsResponse>(`/api/fact-checks/${encodeURIComponent(slug)}`).catch(() => null);
  const record = response ? unwrapStrapiSingle<RecordValue>(response) : null;
  return record ? normalizeFactCheck(record, lang) : null;
});
