import type { Metadata } from "next";

import { DistributionStudio } from "@/components/distribution-studio";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import {
  buildDistributionDrafts,
  getDistributionPanelCopy,
  type DistributionArticle,
} from "@/lib/distribution";
import { fetchPublishedArticlesWithSource, type PublishedArticle } from "@/lib/editorial";
import { getAuthorNames } from "@/lib/content";
import { getDictionary, resolveLang, type Lang } from "@/lib/i18n";
import { buildPageTitle, buildSeoMetadata } from "@/lib/seo";
import { getStrapiMediaUrl, unwrapStrapiCollection } from "@/lib/strapi";

type SearchParamValue = string | string[] | undefined;

function readParam(value: SearchParamValue) {
  return Array.isArray(value) ? value[0] || "" : value || "";
}

function toDistributionArticle(article: PublishedArticle): DistributionArticle {
  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    subtitle: article.subtitle,
    content: article.content,
    section: article.section,
    publishedAt: article.publishedAt,
    focus: article.focus,
    style: article.style,
    signalText: article.signalText,
    distributionNote: article.distributionNote,
    authors: getAuthorNames(article.authors),
    topics: unwrapStrapiCollection<{ name?: string }>(article.topics)
      .map((topic) => topic.name?.trim() || "")
      .filter(Boolean),
    coverImageUrl: article.cover?.url
      ? getStrapiMediaUrl(article.cover.formats?.medium?.url || article.cover.formats?.small?.url || article.cover.url)
      : "",
  };
}

export function generateMetadata({
  searchParams,
}: {
  searchParams: Record<string, SearchParamValue>;
}): Metadata {
  const lang = resolveLang(searchParams.lang);

  return {
    ...buildSeoMetadata({
      lang,
      pathname: "/odjek",
      title: buildPageTitle(lang === "sr" ? "Odjek" : "Echo"),
      description:
        lang === "sr"
          ? "Interni urednicki panel za pripremu distribucije Avangardinih tekstova."
          : "Internal editorial panel for preparing Avangarda distribution copy.",
    }),
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function DistributionPage({
  searchParams,
}: {
  searchParams: Record<string, SearchParamValue>;
}) {
  const lang = resolveLang(searchParams.lang);
  const t = getDictionary(lang);
  const copy = getDistributionPanelCopy(lang);
  const selectedSlug = readParam(searchParams.slug);

  const { articles: articlesSource, source } = await fetchPublishedArticlesWithSource(lang, 120);
  const articles = articlesSource.filter((article) => Boolean(article.slug && article.title));
  const selectedArticleRecord =
    articles.find((article) => article.slug === selectedSlug) ||
    articles[0] ||
    null;
  const selectedArticle = selectedArticleRecord ? toDistributionArticle(selectedArticleRecord) : null;
  const initialDrafts = selectedArticle ? buildDistributionDrafts(selectedArticle, lang) : [];

  const articleList = articles.map((article) => ({
    id: article.id,
    slug: article.slug,
    title: article.title,
    subtitle: article.subtitle,
    publishedAt: article.publishedAt,
    section: article.section,
    authors: getAuthorNames(article.authors),
    topics: unwrapStrapiCollection<{ name?: string }>(article.topics)
      .map((topic) => topic.name?.trim() || "")
      .filter(Boolean),
  }));

  return (
    <>
      <SiteHeader lang={lang} currentPath="/odjek" activeNav={null} />

      <main className="site-main">
        <div className="page-shell page-shell--story-map">
          <DistributionStudio
            lang={lang}
            source={source}
            copy={copy}
            articles={articleList}
            selectedArticle={selectedArticle}
            initialDrafts={initialDrafts}
          />
        </div>
      </main>

      <SiteFooter lang={lang} t={t} />
    </>
  );
}
