import { IntroMotifs } from "@/components/intro-motifs";
import { readerPageCopy } from "@/lib/reader-page-copy";
import type { Metadata } from "next";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SignalBlock } from "@/components/signal-block";
import { getAuthorLabel, localizeArticle } from "@/lib/content";
import { fetchPublishedArticles } from "@/lib/editorial";
import { getDictionary, getSectionLabel, resolveLang, withLang } from "@/lib/i18n";
import { buildPageTitle, buildSeoMetadata, getSeoDescription } from "@/lib/seo";
import { getHeaderSectionNavKey, getSectionHref, isPrimarySectionSlug, normalizeSectionSlug } from "@/lib/sections";
import { fetchAnalysisSignals } from "@/lib/signals";
import { redirect } from "next/navigation";
import { formatDisplayDate } from "@/lib/strapi";

type Article = {
  id: number;
  title: string;
  subtitle?: string;
  title_en?: string;
  title_tr?: string;
  title_fr?: string;
  title_de?: string;
  subtitle_en?: string;
  subtitle_tr?: string;
  subtitle_fr?: string;
  subtitle_de?: string;
  slug: string;
  section: string;
  publishedAt: string;
  authors?: unknown;
};

export function generateMetadata({
  params,
  searchParams
}: {
  params: { section: string };
  searchParams: Record<string, string | string[] | undefined>;
}): Metadata {
  const lang = resolveLang(searchParams.lang);
  const section = normalizeSectionSlug(params.section);

  return buildSeoMetadata({
    lang,
    pathname: getSectionHref(section),
    title: buildPageTitle(getSectionLabel(section, lang)),
    description: getSeoDescription(lang)
  });
}

export default async function SectionPage({
  params,
  searchParams
}: {
  params: { section: string };
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const lang = resolveLang(searchParams.lang);
  const t = getDictionary(lang);
  const requestedSection = params.section;
  const section = normalizeSectionSlug(requestedSection);

  if (requestedSection !== section && isPrimarySectionSlug(section)) {
    redirect(withLang(getSectionHref(section), lang));
  }

  const [publishedArticles, analysisSignals] = await Promise.all([
    fetchPublishedArticles(lang, 240),
    section === "analysis" ? fetchAnalysisSignals(lang, 4) : Promise.resolve([])
  ]);

  const articles = publishedArticles
    .filter((article) => normalizeSectionSlug(article.section) === section)
    .map((article) => localizeArticle(article as Article, lang));

  return (
    <>
      <SiteHeader
        lang={lang}
        currentPath={getSectionHref(section)}
        activeNav={getHeaderSectionNavKey(section)}
        eyebrow={t.sectionLabel}
      />

      <main className="site-main">
        <div className="page-shell">
          <section className={`panel subpage-hero reader-page-intro ${["analysis", "interview", "column"].includes(section) ? "has-intro-motifs" : ""}`}>
            {section === "analysis" || section === "interview" || section === "column" ? <IntroMotifs kind={section} /> : null}
            <h1 className="subpage-hero__title">{getSectionLabel(section, lang)}</h1>
          </section>

          {articles.length ? (
            <div className="page-grid">
              {articles.map((article) => (
                <a key={article.id} href={withLang(`/a/${article.slug}`, lang)} className="panel article-card">
                  <div>
                    <div className="article-card__meta">
                      <span>{formatDisplayDate(article.publishedAt, lang)}</span>
                      <span>{getSectionLabel(article.section, lang)}</span>
                      {getAuthorLabel(article.authors) ? <span>{getAuthorLabel(article.authors)}</span> : null}
                    </div>
                    <h3 className="article-card__title">{article.title}</h3>
                    {article.subtitle ? <p className="article-card__subtitle">{article.subtitle}</p> : null}
                  </div>
                  <span className="button-secondary">{t.readStory}</span>
                </a>
              ))}
            </div>
          ) : (
            <div className="panel empty-state">

              <p>{readerPageCopy[lang].empty}</p>
              <a className="button-secondary" href={withLang("/archive", lang)}>{readerPageCopy[lang].archive}</a>
            </div>
          )}

          {section === "analysis" ? (
            <SignalBlock
              lang={lang}
              label={t.signalLabel}
              title={t.analysisSignalTitle}
              signals={analysisSignals}
              ctaLabel={t.signalContextCta}
              variant="section"
            />
          ) : null}
        </div>
      </main>

      <SiteFooter lang={lang} t={t} />
    </>
  );
}
