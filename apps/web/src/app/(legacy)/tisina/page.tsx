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
  const section = await fetchShowcaseSectionBySlug("tisina", lang);
  const copy = getShowcaseSectionPageCopy("tisina", lang, section ?? undefined);

  return buildSeoMetadata({
    lang,
    pathname: "/tisina",
    title: buildPageTitle(section?.title || copy.label),
    description: section?.description || copy.intro
  });
}

export default async function TisinaPage({
  searchParams
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const lang = resolveLang(searchParams.lang);
  const section = await fetchShowcaseSectionBySlug("tisina", lang);
  const copy = getShowcaseSectionPageCopy("tisina", lang, section ?? undefined);

  return (
    <StaticEditorialPage
      lang={lang}
      currentPath="/tisina"
      copy={copy}
      heroLabel={section?.title}
      heroTitle={copy.title}
      heroIntro={copy.intro}
      relatedArticles={section?.relatedArticles}
    />
  );
}
