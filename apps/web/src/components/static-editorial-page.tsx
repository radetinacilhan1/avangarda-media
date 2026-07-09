import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getAuthorLabel } from "@/lib/content";
import { normalizeSerbianLatinDeep } from "@/lib/serbian-latin";
import { formatDisplayDate } from "@/lib/strapi";
import type { Lang } from "@/lib/i18n";
import { getDictionary, getSectionLabel, withLang } from "@/lib/i18n";

type StaticEditorialPageCopy = {
  label: string;
  title: string;
  intro: string;
  relatedHeading?: string;
  blocks: Array<{
    eyebrow?: string;
    title: string;
    copy: string | string[];
    links?: Array<{
      label: string;
      href: string;
    }>;
  }>;
};

type StaticEditorialPageArticle = {
  id: number;
  title: string;
  subtitle?: string;
  slug: string;
  section?: string;
  publishedAt?: string;
  authors?: unknown;
};

type StaticEditorialPageProps = {
  lang: Lang;
  currentPath: string;
  copy: StaticEditorialPageCopy;
  heroLabel?: string;
  heroTitle?: string;
  heroIntro?: string;
  relatedArticles?: StaticEditorialPageArticle[];
};

export function StaticEditorialPage({
  lang,
  currentPath,
  copy,
  heroLabel,
  heroTitle,
  heroIntro,
  relatedArticles = []
}: StaticEditorialPageProps) {
  const t = getDictionary(lang);
  const normalizedCopy = lang === "sr" ? normalizeSerbianLatinDeep(copy) : copy;
  const headlineLabel = heroLabel || normalizedCopy.label;
  const headlineTitle = heroTitle || normalizedCopy.title;
  const headlineIntro = heroIntro || normalizedCopy.intro;
  const aboutNavActive =
    currentPath === "/about" ||
    currentPath === "/o-nama" ||
    currentPath === "/editorial-principle" ||
    currentPath === "/contact" ||
    currentPath === "/impresum" ||
    currentPath.startsWith("/people/");

  return (
    <>
      <SiteHeader lang={lang} currentPath={currentPath} activeNav={aboutNavActive ? "about" : null} />

      <main className="site-main">
        <div className="page-shell">
          <section className="panel subpage-hero">
            <span className="eyebrow">{headlineLabel}</span>
            <h1 className="subpage-hero__title">{headlineTitle}</h1>
            <p className="subpage-hero__copy">{headlineIntro}</p>
          </section>

          <section className="page-grid">
            {normalizedCopy.blocks.map((block) => (
              <article key={block.title} className="panel info-card">
                {block.eyebrow ? <span className="eyebrow">{block.eyebrow}</span> : null}
                <h3>{block.title}</h3>
                {Array.isArray(block.copy) ? (
                  block.copy.map((paragraph) => <p key={paragraph}>{paragraph}</p>)
                ) : (
                  <p>{block.copy}</p>
                )}
                {block.links?.length ? (
                  <div className="info-card__links">
                    {block.links.map((link) => (
                      <a key={`${block.title}-${link.href}`} href={link.href} className="button-secondary">
                        {link.label}
                      </a>
                    ))}
                  </div>
                ) : null}
              </article>
            ))}
          </section>

          {relatedArticles.length ? (
            <section className="section-block">
              <div className="section-header">
                <div>
                  <span className="eyebrow">{headlineLabel}</span>
                  <h2 className="section-title">{normalizedCopy.relatedHeading || t.latestTitle}</h2>
                </div>
              </div>

              <div className="page-grid">
                {relatedArticles.map((article) => (
                  <a key={article.id} href={withLang(`/a/${article.slug}`, lang)} className="panel article-card">
                    <div className="article-card__meta">
                      {article.section ? <span>{getSectionLabel(article.section, lang)}</span> : null}
                      {article.publishedAt ? <span>{formatDisplayDate(article.publishedAt, lang)}</span> : null}
                      {getAuthorLabel(article.authors) ? <span>{getAuthorLabel(article.authors)}</span> : null}
                    </div>
                    <h3 className="article-card__title">{article.title}</h3>
                    {article.subtitle ? <p className="article-card__subtitle">{article.subtitle}</p> : null}
                    <span className="button-secondary">{t.readStory}</span>
                  </a>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </main>

      <SiteFooter lang={lang} t={t} />
    </>
  );
}
