import type { MetadataRoute } from "next";

import { languages } from "@/lib/i18n";
import { buildLocalizedUrl } from "@/lib/seo";

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
] as const;

const alternates = (pathname: string) => ({
  languages: Object.fromEntries(
    languages.map((language) => [language.code, buildLocalizedUrl(pathname, language.code)])
  ),
});

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return baseRoutes.map((pathname) => ({
    url: buildLocalizedUrl(pathname, "sr"),
    lastModified,
    changeFrequency: pathname === "/" ? "daily" : "weekly",
    priority: pathname === "/" ? 1 : 0.8,
    alternates: alternates(pathname),
  }));
}
