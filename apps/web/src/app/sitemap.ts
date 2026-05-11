import type { MetadataRoute } from "next";

import { buildLocalizedUrl } from "@/lib/seo";

const baseRoutes = [
  "/",
  "/section/front",
  "/section/analysis",
  "/section/interview",
  "/section/column",
  "/archive",
  "/o-nama",
  "/contact",
  "/editorial-principle",
  "/people/ilhan-radetinac",
  "/impresum",
] as const;

const alternates = (pathname: string) => ({
  languages: {
    sr: buildLocalizedUrl(pathname, "sr"),
    en: buildLocalizedUrl(pathname, "en"),
    tr: buildLocalizedUrl(pathname, "tr"),
    fr: buildLocalizedUrl(pathname, "fr"),
    de: buildLocalizedUrl(pathname, "de"),
  },
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
