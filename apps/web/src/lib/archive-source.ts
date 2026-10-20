import { localizeArticle } from "@/lib/content";
import type { PublishedArticle } from "@/lib/editorial";
import type { Lang } from "@/lib/i18n";
import { normalizeSectionRecord } from "@/lib/sections";
import { strapiGet, unwrapStrapiCollection } from "@/lib/strapi";

type ArchiveResponse = { data?: unknown; meta?: { pagination?: { total?: number } } };

/** The archive has its own projection. Article pages and homepage queries stay unchanged. */
export function archiveSourceQuery(lang: Lang, start: number, includeContent = false) {
  const params = new URLSearchParams();
  const fields = ["title", "subtitle", "focus", "slug", "section", "style", "year", "publishedAt"];
  if (includeContent) fields.push("content");
  if (lang !== "sr") for (const field of ["title", "subtitle", "focus", ...(includeContent ? ["content"] : [])]) fields.push(`${field}_${lang}`);
  fields.forEach((field, index) => params.set(`fields[${index}]`, field));
  for (const relation of ["authors", "topics", "locations"]) {
    const names = ["name", "slug", ...(lang !== "sr" && relation !== "authors" ? [`name_${lang}`] : [])];
    names.forEach((field, index) => params.set(`populate[${relation}][fields][${index}]`, field));
  }
  ["url", "formats"].forEach((field, index) => params.set(`populate[cover][fields][${index}]`, field));
  params.set("filters[publishedAt][$notNull]", "true");
  params.set("sort[0]", "id:asc");
  // The public controller calls entityService.findMany and ignores REST's
  // nested pagination. Advance by actual received rows, including CMS caps.
  params.set("start", String(start));
  // Rich text is read only for explicit searches and cached in small batches,
  // never as one aggregate that can exceed Next's 2 MB cache-entry limit.
  params.set("limit", includeContent ? "10" : "100");
  return `/api/articles?${params}`;
}

export async function fetchArchiveArticles(lang: Lang, includeContent = false): Promise<PublishedArticle[]> {
  const rows: PublishedArticle[] = [];
  const seen = new Set<string>();
  let start = 0;
  let expectedTotal: number | undefined;
  for (;;) {
    const response = await strapiGet<ArchiveResponse>(archiveSourceQuery(lang, start, includeContent));
    if (!response || !Array.isArray(response.data)) throw new Error("Archive catalogue is temporarily unavailable");
    const batch = unwrapStrapiCollection<PublishedArticle>(response);
    const total = response.meta?.pagination?.total;
    if (typeof total === "number" && Number.isFinite(total)) {
      if (expectedTotal !== undefined && total !== expectedTotal) throw new Error("Archive changed while being read");
      expectedTotal = total;
    }
    if (!batch.length) {
      if (expectedTotal !== undefined && rows.length !== expectedTotal) throw new Error("Archive catalogue is incomplete");
      break;
    }
    for (const item of batch) {
      const id = String(item.id);
      if (!id || id === "undefined" || seen.has(id)) throw new Error("Archive pagination repeated a record");
      seen.add(id);
      rows.push(item);
    }
    start += batch.length;
    // Require an explicit empty tail rather than treating a short capped batch
    // as the end. A failure never turns into a silently truncated catalogue.
  }
  return rows.map((item) => normalizeSectionRecord(localizeArticle(item, lang))).filter((item) => Boolean(item.slug && item.title));
}
