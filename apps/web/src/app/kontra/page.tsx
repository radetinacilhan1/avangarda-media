import type { Metadata } from "next";

import { StaticEditorialPage } from "@/components/static-editorial-page";
import { resolveLang } from "@/lib/i18n";
import { buildPageTitle, buildSeoMetadata } from "@/lib/seo";
import { fetchShowcaseSectionBySlug, getShowcaseSectionPageCopy } from "@/lib/showcase-sections";

export async function generateMetadata({
  searchParams
}: {
  searchParams: Record<string, string | string[] | undefined>;
}): Promise<Metadata> {
  const lang = resolveLang(searchParams.lang);
  const section = await fetchShowcaseSectionBySlug("kontra", lang);
  const copy = getShowcaseSectionPageCopy("kontra", lang, section ?? undefined);

  return buildSeoMetadata({
    lang,
    pathname: "/kontra",
    title: buildPageTitle(section?.title || copy.label),
    description: section?.description || copy.intro
  });
}

export default async function KontraPage({
  searchParams
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const lang = resolveLang(searchParams.lang);
  const section = await fetchShowcaseSectionBySlug("kontra", lang);
  const copy = getShowcaseSectionPageCopy("kontra", lang, section ?? undefined);

  return (
    <StaticEditorialPage
      lang={lang}
      currentPath="/kontra"
      copy={copy}
      heroLabel={section?.title}
      heroTitle={copy.title}
      heroIntro={copy.intro}
      relatedArticles={section?.relatedArticles}
    />
  );
}
