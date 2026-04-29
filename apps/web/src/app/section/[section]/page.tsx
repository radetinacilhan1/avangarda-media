import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getAuthorLabel, localizeArticle } from "@/lib/content";
import { fetchPublishedArticles } from "@/lib/editorial";
import { getDictionary, getSectionLabel, resolveLang, withLang } from "@/lib/i18n";
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
  const section = params.section;
  const articles = (await fetchPublishedArticles(lang, 240))
    .filter((article) => article.section === section)
    .map((article) => localizeArticle(article as Article, lang));

  return (
    <>
      <SiteHeader
        lang={lang}
        currentPath={`/section/${params.section}`}
        activeNav={
          section === "news" || section === "analysis" || section === "interview" || section === "column"
            ? section
            : null
        }
        eyebrow={t.sectionLabel}
      />

      <main className="site-main">
        <div className="page-shell">
          <section className="panel subpage-hero">
            <span className="eyebrow">{t.sectionLabel}</span>
            <h1 className="subpage-hero__title">{getSectionLabel(section, lang)}</h1>
            <p className="subpage-hero__copy">{t.sectionPageCopy}</p>
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
