import type { MetadataRoute } from "next";

import { fetchTeamMembers } from "@/lib/about";
import { fetchPublishedArticles } from "@/lib/editorial";
import { languages } from "@/lib/i18n";
import { buildLocalizedUrl, buildXDefaultUrl } from "@/lib/seo";
import { strapiGet, unwrapStrapiCollection } from "@/lib/strapi";

const baseRoutes = [
  "/",
  "/section/front",
  "/section/analysis",
  "/section/interview",
  "/section/column",
  "/archive",
  "/galerije",
  "/mapa",
  "/ljudska-prava",
  "/pravni-kompas",
  "/interaktivno",
  "/interaktivno/moc",
  "/interaktivno/rogozna",
  "/interaktivno/cekaonica",
  "/dokumentarci",
  "/o-nama",
  "/contact",
  "/editorial-principle",
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
  const [publishedArticles, teamMembers, humanRightsResponse, legalResourcesResponse, galleriesResponse] = await Promise.all([
    fetchPublishedArticles("sr", 240),
    fetchTeamMembers("sr"),
    strapiGet<{ data?: unknown }>("/api/human-rights?pagination[pageSize]=200&fields[0]=slug"),
    strapiGet<{ data?: unknown }>("/api/legal-resources?pagination[pageSize]=200&fields[0]=slug"),
    strapiGet<{ data?: unknown }>("/api/galleries?pagination[pageSize]=200&fields[0]=slug&filters[publishedAt][$notNull]=true"),
  ]);
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
  const humanRightRoutes = unwrapStrapiCollection<{ slug?: string }>(humanRightsResponse)
    .map((entry) => entry.slug?.trim())
    .filter((slug): slug is string => Boolean(slug))
    .map((slug) => `/ljudska-prava/${slug}`);
  const legalResourceRoutes = unwrapStrapiCollection<{ slug?: string }>(legalResourcesResponse)
    .map((entry) => entry.slug?.trim())
    .filter((slug): slug is string => Boolean(slug))
    .map((slug) => `/pravni-kompas/${slug}`);
  const galleryRoutes = unwrapStrapiCollection<{ slug?: string }>(galleriesResponse)
    .map((entry) => entry.slug?.trim())
    .filter((slug): slug is string => Boolean(slug))
    .map((slug) => `/galerije/${slug}`);
  const peopleRoutes = teamMembers
    .map((member) => member.slug?.trim())
    .filter((slug): slug is string => Boolean(slug))
    .map((slug) => `/people/${slug}`);
  const routes = Array.from(
    new Set([
      ...baseRoutes,
      ...articleRoutes,
      ...authorRoutes,
      ...topicRoutes,
      ...peopleRoutes,
      ...humanRightRoutes,
      ...legalResourceRoutes,
      ...galleryRoutes,
    ])
  );

  return routes.map((pathname) => ({
    url: buildLocalizedUrl(pathname, "sr"),
    lastModified,
    changeFrequency: pathname === "/" ? "daily" : "weekly",
    priority: pathname === "/" ? 1 : pathname.startsWith("/a/") ? 0.7 : 0.8,
    alternates: alternates(pathname),
  }));
}
