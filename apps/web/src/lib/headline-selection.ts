import type { Lang } from "@/lib/i18n";
import { localizeArticle } from "@/lib/content";
import { normalizeSectionRecord } from "@/lib/sections";
import { unwrapStrapiCollection } from "@/lib/strapi";

export type HeadlineConfiguration = {
  headlineSelection?: { initialized?: boolean; revision?: number; articleIds?: number[] };
  headlineArticles?: unknown;
};

/** null means the CMS still uses the legacy order during a rolling deployment.
 * An initialized empty selection is deliberate and must remain empty. */
export function selectedHeadlineArticles<T extends { id: number; title: string; slug: string; publishedAt: string; section: string }>(
  configuration: HeadlineConfiguration | null, lang: Lang
): T[] | null {
  if (configuration?.headlineSelection?.initialized !== true) return null;
  const articles = unwrapStrapiCollection<T>(configuration.headlineArticles);
  const available = new Map(articles.filter(article => Number.isSafeInteger(article.id)
    && article.title?.trim() && article.slug?.trim() && article.publishedAt
    && Number.isFinite(Date.parse(article.publishedAt))).map(article => [article.id, article]));
  const ids = [...new Set(configuration.headlineSelection.articleIds || [])]
    .filter(id => Number.isSafeInteger(id) && id > 0).slice(0, 5);
  return ids.flatMap(id => {
    const article = available.get(id);
    return article ? [localizeArticle(normalizeSectionRecord(article), lang) as T] : [];
  });
}
