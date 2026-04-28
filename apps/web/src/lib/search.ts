import { MeiliSearch } from "meilisearch";
import { fetchPublishedArticles, filterPublishedArticles } from "@/lib/editorial";
import { getAuthorNames, localizeSearchHit } from "@/lib/content";
import type { Lang } from "@/lib/i18n";

export type SearchHit = {
  id: string;
  type: string;
  title: string;
  subtitle?: string;
  content?: string;
  slug: string;
  section?: string;
  publishedAt?: string;
  authors?: string[];
  title_en?: string;
  subtitle_en?: string;
  content_en?: string;
  title_tr?: string;
  subtitle_tr?: string;
  content_tr?: string;
  title_fr?: string;
  subtitle_fr?: string;
  content_fr?: string;
  title_de?: string;
  subtitle_de?: string;
  content_de?: string;
};

type SearchArgs = {
  q?: string;
  section?: string;
  year?: string;
  lang: Lang;
};

export async function searchContent({ q = "", section = "", year = "", lang }: SearchArgs) {
  const query = q.trim();
  const directArticles = await fetchPublishedArticles(lang, 120);

  if (!query && !section && !year) {
    const hits = directArticles.slice(0, 24).map((article) => ({
      id: `article_${article.id}`,
      type: "article",
      title: article.title,
      subtitle: article.subtitle,
      content: article.content,
      slug: article.slug,
      section: article.section,
      publishedAt: article.publishedAt,
      authors: getAuthorNames(article.authors)
    }));

    return { hits, total: directArticles.length };
  }

  try {
    const meili = new MeiliSearch({
      host: process.env.MEILI_HOST_INTERNAL || "http://meili:7700",
      apiKey: process.env.MEILI_MASTER_KEY
    });

    const filters = [];
    if (section) filters.push(`section = "${section}"`);
    if (year && !Number.isNaN(Number(year))) filters.push(`year = ${Number(year)}`);

    const result = await meili.index("content").search<SearchHit>(query || "", {
      limit: 24,
      filter: filters.length ? filters.join(" AND ") : undefined
    });

    if (result.hits.length) {
      return {
        hits: result.hits.map((hit) => localizeSearchHit(hit, lang)),
        total: result.estimatedTotalHits ?? result.hits.length
      };
    }
  } catch {
    // Fall through to direct Strapi-backed search so the UI still works even if Meili is unavailable.
  }

  const filtered = filterPublishedArticles(directArticles, { q, section, year });
  return {
    hits: filtered.slice(0, 24).map((article) => ({
      id: `article_${article.id}`,
      type: "article",
      title: article.title,
      subtitle: article.subtitle,
      content: article.content,
      slug: article.slug,
      section: article.section,
      publishedAt: article.publishedAt,
      authors: getAuthorNames(article.authors)
    })),
    total: filtered.length
  };
}
