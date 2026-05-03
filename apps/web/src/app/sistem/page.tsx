import { StaticEditorialPage } from "@/components/static-editorial-page";
import { resolveLang } from "@/lib/i18n";
import { fetchShowcaseSectionBySlug, getShowcaseSectionPageCopy } from "@/lib/showcase-sections";

export default async function SistemPage({
  searchParams
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const lang = resolveLang(searchParams.lang);
  const section = await fetchShowcaseSectionBySlug("sistem", lang);
  const copy = getShowcaseSectionPageCopy("sistem", lang, section ?? undefined);

  return (
    <StaticEditorialPage
      lang={lang}
      currentPath="/sistem"
      copy={copy}
      heroLabel={section?.title}
      heroTitle={copy.title}
      heroIntro={copy.intro}
      relatedArticles={section?.relatedArticles}
    />
  );
}
