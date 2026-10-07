import { localizeArticle } from "@/lib/content";
import type { PublishedArticle } from "@/lib/editorial";
import type { Lang } from "@/lib/i18n";
import { normalizeSectionRecord } from "@/lib/sections";
import { strapiGet, unwrapStrapiCollection } from "@/lib/strapi";

/** The map needs relation identities and coordinates, never full story bodies or photographs. */
export async function fetchStoryMapArticles(lang: Lang): Promise<PublishedArticle[]> {
  const params = new URLSearchParams();
  const localized = (fields: string[]) => lang === "sr" ? fields : fields.flatMap((field) => [field, `${field}_${lang}`]);
  const select = (prefix: string, fields: string[]) => fields.forEach((field, index) => params.set(`${prefix}[${index}]`, field));
  select("fields", ["slug", "section", "publishedAt", ...localized(["title"])]);
  select("populate[authors][fields]", ["name", "slug", "mapColor", "mapEffect"]);
  select("populate[topics][fields]", ["slug", ...localized(["name"])]);
  select("populate[locations][fields]", ["slug", "country", "region", "latitude", "longitude", "active", ...localized(["name"])]);
  params.set("filters[publishedAt][$notNull]", "true");
  params.set("sort[0]", "publishedAt:desc");
  params.set("sort[1]", "id:asc");
  params.set("pagination[pageSize]", "100");
  const records: PublishedArticle[] = [];
  for (let page = 1; ; page += 1) {
    params.set("pagination[page]", String(page));
    const response = await strapiGet<{ data?: unknown; meta?: { pagination?: { pageCount?: number } } }>(`/api/articles?${params}`);
    const current = unwrapStrapiCollection<PublishedArticle>(response);
    records.push(...current);
    // Existing publicFind returns a complete collection with meta: {}; standard REST paginates.
    if (!response.meta?.pagination || !current.length || current.length < 100 || page >= (response.meta.pagination.pageCount ?? Infinity)) break;
  }
  return records.map((record) => normalizeSectionRecord(localizeArticle(record, lang)))
    .filter((record) => Boolean(record.slug && record.title && record.publishedAt));
}
