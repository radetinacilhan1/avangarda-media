import { strapiGet, unwrapStrapiCollection } from "@/lib/strapi";

type PublishedArticleRecord = Record<string, unknown> & { id: number; publishedAt: string };
type ArticleResponse = {
  data: unknown[];
  meta?: { pagination?: { page: number; pageCount: number } };
};

// All translations share a record and a cache entry. Only card fields are fetched;
// article bodies have no role in the count or the six-card portfolio preview.
const fields = ["slug", "section", "publishedAt", "title", "subtitle",
  ...["en", "tr", "fr", "de", "es", "el", "ar"].flatMap((lang) => [`title_${lang}`, `subtitle_${lang}`])];

export function buildPortfolioArticlesQuery(profileId: number, page = 1) {
  if (!Number.isSafeInteger(profileId) || profileId <= 0) throw new Error("Invalid canonical portfolio identity");
  const query = new URLSearchParams();
  query.set("filters[authors][publicProfile][id][$eq]", String(profileId));
  query.set("filters[publishedAt][$notNull]", "true");
  query.set("publicationState", "live");
  query.set("sort[0]", "publishedAt:desc");
  query.set("sort[1]", "id:desc");
  query.set("pagination[page]", String(page));
  query.set("pagination[pageSize]", "100");
  fields.forEach((field, index) => query.set(`fields[${index}]`, field));
  query.set("populate[authors][fields][0]", "name");
  query.set("populate[authors][fields][1]", "slug");
  return `/api/articles?${query.toString()}`;
}

export async function fetchPortfolioAuthoredArticles(profileId: number): Promise<PublishedArticleRecord[]> {
  const articles = new Map<number, PublishedArticleRecord>();
  let pageCount = 1;
  for (let page = 1; page <= pageCount; page += 1) {
    const response = await strapiGet<ArticleResponse>(buildPortfolioArticlesQuery(profileId, page));
    if (!response || !Array.isArray(response.data)) {
      // Propagate failure so ISR keeps the last successful page instead of publishing a false zero.
      throw new Error(`Portfolio articles unavailable for profile ${profileId}`);
    }
    const pagination = response.meta?.pagination;
    if (pagination) {
      if (!Number.isSafeInteger(pagination.pageCount) || pagination.pageCount < 0 || pagination.page !== page) {
        throw new Error(`Incomplete portfolio pagination for profile ${profileId}`);
      }
      pageCount = pagination.pageCount;
    }
    // The CMS publicFind endpoint returns the complete result with meta: {}.
    const records = unwrapStrapiCollection<Record<string, unknown>>(response.data);
    if (records.length !== response.data.length) throw new Error(`Malformed portfolio catalogue for profile ${profileId}`);
    for (const article of records) {
      if (article.publishedAt === null) continue;
      if (!Number.isSafeInteger(article.id) || Number(article.id) <= 0 || typeof article.publishedAt !== "string" || !Number.isFinite(Date.parse(article.publishedAt))) {
        throw new Error(`Invalid published portfolio article for profile ${profileId}`);
      }
      articles.set(Number(article.id), article as PublishedArticleRecord);
    }
  }
  return Array.from(articles.values());
}
