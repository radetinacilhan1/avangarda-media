import type { MetadataRoute } from "next";

import { fetchPublishedArticles } from "@/lib/editorial";
import { languages } from "@/lib/i18n";
import { buildLocalizedUrl, buildXDefaultUrl } from "@/lib/seo";
import { unwrapStrapiCollection } from "@/lib/strapi";

const baseRoutes = [
  "/",
  "/section/front",
  "/section/analysis",
  "/section/interview",
  "/section/column",
  "/archive",
  "/dokumentarci",
  "/o-nama",
  "/contact",
  "/editorial-principle",
  "/people/ilhan-radetinac",
  "/impresum",
  "/topics",
  "/sistem",
  "/teren",
  "/tisina",
  "/kontra"
] as const;

const alternates = (pathname: string) => ({
  languages: Object.fromEntries(
    [
      ...languages.map((language) => [language.code, buildLocalizedUrl(pathname, language.code)]),
      ["x-default", buildXDefaultUrl(pathname)]
    ]
  ),
});

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  const publishedArticles = await fetchPublishedArticles("sr", 240);
  const articleRoutes = publishedArticles
    .map((article) => article.slug?.trim())
    .filter((slug): slug is string => Boolean(slug))
    .map((slug) => `/a/${slug}`);
  const authorRoutes = Array.from(
    new Set(
      publishedArticles.flatMap((article) =>
        unwrapStrapiCollection<{ slug?: string }>(article.authors)
          .map((author) => author.slug?.trim())
          .filter((slug): slug is string => Boolean(slug))
          .map((slug) => `/author/${slug}`)
      )
    )
  );
  const topicRoutes = Array.from(
    new Set(
      publishedArticles.flatMap((article) =>
        unwrapStrapiCollection<{ slug?: string }>(article.topics)
          .map((topic) => topic.slug?.trim())
          .filter((slug): slug is string => Boolean(slug))
          .map((slug) => `/topic/${slug}`)
      )
    )
  );
  const routes = Array.from(new Set([...baseRoutes, ...articleRoutes, ...authorRoutes, ...topicRoutes]));

  return routes.map((pathname) => ({
    url: buildLocalizedUrl(pathname, "sr"),
    lastModified,
    changeFrequency: pathname === "/" ? "daily" : "weekly",
    priority: pathname === "/" ? 1 : pathname.startsWith("/a/") ? 0.7 : 0.8,
    alternates: alternates(pathname),
  }));
}
