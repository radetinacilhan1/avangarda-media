import { getArticleLanguages } from "@/lib/article-languages";
import type { MetadataRoute } from "next";
import { canonicalAuthorSlug } from "@/lib/author-aliases";

import { languages } from "@/lib/i18n";
import { buildLocalizedUrl, buildXDefaultUrl } from "@/lib/seo";
import { strapiGet, unwrapStrapiCollection } from "@/lib/strapi";

export const revalidate = 300;
export const dynamic = "force-static";

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
  "/interaktivno/algoritam",
  "/interaktivno/neutralni-covek",
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

const alternates = (pathname: string, codes = languages.map(({ code }) => code)) => ({
  languages: Object.fromEntries(
    [
      ...codes.map((code) => [code, buildLocalizedUrl(pathname, code)]),
      ["x-default", buildXDefaultUrl(pathname)]
    ]
  ),
});

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  const translationFields = ["title", "content", ...languages.filter(({code}) => code !== "sr").flatMap(({code}) => [`title_${code}`, `content_${code}`])].map((field, i) => `fields[${i + 1}]=${field}`).join("&");
  const [articlesResponse, membersResponse, humanRightsResponse, legalResourcesResponse, galleriesResponse] = await Promise.all([
    strapiGet<{ data?: unknown }>(`/api/articles?filters[publishedAt][$notNull]=true&fields[0]=slug&${translationFields}&populate[authors][fields][0]=slug&populate[topics][fields][0]=slug&sort=publishedAt:desc&pagination[pageSize]=240`),
    strapiGet<{ data?: unknown }>("/api/team-members?filters[isActive][$eq]=true&fields[0]=slug&pagination[pageSize]=200"),
    strapiGet<{ data?: unknown }>("/api/human-rights?pagination[pageSize]=200&fields[0]=slug"),
    strapiGet<{ data?: unknown }>("/api/legal-resources?pagination[pageSize]=200&fields[0]=slug"),
    strapiGet<{ data?: unknown }>("/api/galleries?pagination[pageSize]=200&fields[0]=slug&filters[publishedAt][$notNull]=true"),
  ]);
  const publishedArticles = unwrapStrapiCollection<{ slug?: string; authors?: unknown; topics?: unknown }>(articlesResponse);
  const teamMembers = unwrapStrapiCollection<{ slug?: string }>(membersResponse);
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
          .map((slug) => `/author/${canonicalAuthorSlug(slug)}`)
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

  const articleLanguages = new Map(publishedArticles.map(article => [`/a/${article.slug}`, getArticleLanguages(article)]));
  return routes.flatMap((pathname) => {
    const codes = articleLanguages.get(pathname) || (pathname === "/" ? languages.map(({code}) => code) : ["sr" as const]);
    const advertised = articleLanguages.get(pathname);
    return codes.map(code => ({
    url: buildLocalizedUrl(pathname, code),
    lastModified,
    changeFrequency: pathname === "/" ? "daily" : "weekly",
    priority: pathname === "/" ? 1 : pathname.startsWith("/a/") ? 0.7 : 0.8,
    alternates: alternates(pathname, advertised),
    }));
  });
}
