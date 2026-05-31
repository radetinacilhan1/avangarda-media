import type { Metadata } from "next";

import { StoryMapExplorer } from "@/components/story-map-explorer";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { fetchDocumentaryArchive } from "@/lib/documentaries";
import { fetchPublishedArticles } from "@/lib/editorial";
import { getDictionary, resolveLang } from "@/lib/i18n";
import { buildPageTitle, buildSeoMetadata } from "@/lib/seo";
import {
  buildStoryMapData,
  getStoryMapCopy,
  getStoryMapSeo,
} from "@/lib/story-map";

type SearchParamValue = string | string[] | undefined;

function readParam(value: SearchParamValue) {
  return Array.isArray(value) ? value[0] || "" : value || "";
}

export function generateMetadata({
  searchParams,
}: {
  searchParams: Record<string, SearchParamValue>;
}): Metadata {
  const lang = resolveLang(searchParams.lang);
  const seo = getStoryMapSeo(lang);

  return buildSeoMetadata({
    lang,
    pathname: "/mapa",
    title: buildPageTitle(seo.title.replace(" | Avangarda", "")),
    description: seo.description,
  });
}

export default async function StoryMapPage({
  searchParams,
}: {
  searchParams: Record<string, SearchParamValue>;
}) {
  const lang = resolveLang(searchParams.lang);
  const t = getDictionary(lang);
  const copy = getStoryMapCopy(lang);
  const initialQuery = readParam(searchParams.q);
  const initialSection = readParam(searchParams.section);
  const initialTopic = readParam(searchParams.topic);
  const initialLocation = readParam(searchParams.location);
  const initialContentType = readParam(searchParams.type);

  const [articlesResult, documentariesResult] = await Promise.allSettled([
    fetchPublishedArticles(lang, 240),
    fetchDocumentaryArchive(lang),
  ]);
  const articles = articlesResult.status === "fulfilled" ? articlesResult.value : [];
  const documentaries = documentariesResult.status === "fulfilled" ? documentariesResult.value : [];
  const storyMapData = (() => {
    try {
      return buildStoryMapData({ articles, documentaries, lang });
    } catch {
      return buildStoryMapData({ articles: [], documentaries: [], lang });
    }
  })();

  return (
    <>
      <SiteHeader lang={lang} currentPath="/mapa" activeNav="archive" />

      <main className="site-main">
        <div className="page-shell">
          <section className="panel subpage-hero story-map-hero">
            <span className="eyebrow">{copy.label}</span>
            <h1 className="subpage-hero__title">{copy.title}</h1>
            <p className="subpage-hero__copy">{copy.intro}</p>
          </section>

          <StoryMapExplorer
            lang={lang}
            copy={copy}
            data={storyMapData}
            initialQuery={initialQuery}
            initialSection={initialSection}
            initialTopic={initialTopic}
            initialLocation={initialLocation}
            initialContentType={initialContentType}
          />
        </div>
      </main>

      <SiteFooter lang={lang} t={t} />
    </>
  );
}
