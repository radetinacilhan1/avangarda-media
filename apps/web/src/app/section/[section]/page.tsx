import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SignalBlock } from "@/components/signal-block";
import { getAuthorLabel, localizeArticle } from "@/lib/content";
import { fetchPublishedArticles } from "@/lib/editorial";
import { getDictionary, getSectionLabel, resolveLang, withLang } from "@/lib/i18n";
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
          <section className="panel subpage-hero">
            <span className="eyebrow">{t.sectionLabel}</span>
            <h1 className="subpage-hero__title">{getSectionLabel(section, lang)}</h1>
            <p className="subpage-hero__copy">{t.sectionPageCopy}</p>
          </section>

          {section === "analysis" ? (
            <SignalBlock
              lang={lang}
              label={t.signalLabel}
              title={t.analysisSignalTitle}
              intro={t.analysisSignalCopy}
              signals={analysisSignals}
              ctaLabel={t.signalContextCta}
              variant="section"
            />
          ) : null}

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
              <h3>{t.sectionEmptyTitle}</h3>
              <p>{t.sectionEmptyCopy}</p>
            </div>
          )}
        </div>
      </main>

      <SiteFooter lang={lang} t={t} />
    </>
  );
}
