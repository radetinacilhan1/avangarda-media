import type { Lang } from "@/lib/i18n";

type RankedArticle = { id: number; publishedAt?: string; viewCount?: number };

/** Public views remain the sole ranking metric; date and ID break ties. */
export function rankMostReadArticles<T extends RankedArticle>(articles: T[], limit = 5): T[] {
  const unique = new Map<number, T>();
  for (const article of articles) if (article.publishedAt && !unique.has(article.id)) unique.set(article.id, article);
  const views = (value?: number) => typeof value === "number" && Number.isFinite(value) ? Math.max(0, value) : 0;
  const date = (value?: string) => Date.parse(value || "") || 0;
  return [...unique.values()].sort((a, b) => views(b.viewCount) - views(a.viewCount)
    || date(b.publishedAt) - date(a.publishedAt) || b.id - a.id).slice(0, limit);
}

export function mostReadQuery(lang: Lang) {
  const fields = ["slug", "title", "publishedAt", "viewCount", ...(lang === "sr" ? [] : [`title_${lang}`])];
  return "/api/articles?filters[publishedAt][$notNull]=true&" + fields.map((field, i) => `fields[${i}]=${field}`).join("&")
    + "&populate[cover][fields][0]=url&populate[cover][fields][1]=formats"
    + "&sort[0]=viewCount:desc&sort[1]=publishedAt:desc&sort[2]=id:desc&limit=5&pagination[pageSize]=5";
}
