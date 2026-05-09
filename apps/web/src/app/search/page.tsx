import type { Metadata } from "next";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getAuthorLabel } from "@/lib/content";
import { getDictionary, getSectionLabel, resolveLang, withLang } from "@/lib/i18n";
import { buildPageTitle, buildSeoMetadata } from "@/lib/seo";
import { normalizeSectionSlug } from "@/lib/sections";
import { SearchHit, searchContent } from "@/lib/search";
import { formatDisplayDate } from "@/lib/strapi";

export function generateMetadata({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}): Metadata {
  const lang = resolveLang(searchParams.lang);
  const t = getDictionary(lang);

  return buildSeoMetadata({
    lang,
    pathname: "/search",
    title: buildPageTitle(t.searchTitlePage),
    description: t.searchCopyPage,
  });
}

export default async function SearchPage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const lang = resolveLang(searchParams.lang);
  const t = getDictionary(lang);
  const q = typeof searchParams.q === "string" ? searchParams.q : "";
  const section = normalizeSectionSlug(typeof searchParams.section === "string" ? searchParams.section : "");
  const year = typeof searchParams.year === "string" ? searchParams.year : "";
  const data = (q || section || year) ? await searchContent({ q, section, year, lang }) : { hits: [] as SearchHit[], total: 0 };

  return (
    <>
      <SiteHeader lang={lang} currentPath="/search" searchQuery={q} />

      <main className="site-main">
        <div className="page-shell">
          <section className="panel subpage-hero">
            <span className="eyebrow">{t.searchLabel}</span>
            <h1 className="subpage-hero__title">{t.searchTitlePage}</h1>
            <p className="subpage-hero__copy">{t.searchCopyPage}</p>
          </section>

          <section className="panel info-card">
            <form action="/search" method="get" className="search-form">
              <input type="hidden" name="lang" value={lang} />
              <input className="field" name="q" defaultValue={q} placeholder={t.searchPlaceholder} />
              <select className="select" name="section" defaultValue={section}>
                <option value="">{t.allSections}</option>
                <option value="front">{t.sectionNews}</option>
                <option value="analysis">{t.sectionAnalysis}</option>
                <option value="interview">{t.sectionInterview}</option>
                <option value="column">{t.sectionColumn}</option>
              </select>
              <input className="field" name="year" defaultValue={year} placeholder={t.searchYear} />
              <button className="button-ghost" type="submit">{t.searchButton}</button>
            </form>
          </section>

          <section className="section-block">
            <div className="section-header">
              <div>
                <span className="eyebrow">{t.searchResults}</span>
                <h2 className="section-title">{data.total ? `${data.total} ${t.searchResults.toLowerCase()}` : q || section || year ? t.searchNone : t.searchStart}</h2>
              </div>
              <p className="section-kicker">{q || section || year ? t.searchHelperActive : t.searchHelperIdle}</p>
            </div>

            {data.hits.length ? (
              <div className="page-grid">
                {data.hits.map((hit) => (
                  <a key={hit.id} href={hit.type === "article" ? withLang(`/a/${hit.slug}`, lang) : withLang("/", lang)} className="panel article-card">
                    <div>
                      <div className="article-card__meta">
                        <span>{getSectionLabel(hit.section ?? "", lang) || hit.type}</span>
                        {hit.publishedAt ? <span>{formatDisplayDate(hit.publishedAt, lang)}</span> : null}
                        {getAuthorLabel(hit.authors) ? <span>{getAuthorLabel(hit.authors)}</span> : null}
                      </div>
                      <h3 className="article-card__title">{hit.title}</h3>
                      {hit.subtitle ? <p className="article-card__subtitle">{hit.subtitle}</p> : null}
                    </div>
                    <span className="button-secondary">{t.openItem}</span>
                  </a>
                ))}
              </div>
            ) : (
              <div className="panel empty-state">
                <h3>{t.searchNoHitsTitle}</h3>
                <p>{t.searchNoHitsCopy}</p>
              </div>
            )}
          </section>
        </div>
      </main>

      <SiteFooter lang={lang} t={t} />
    </>
  );
}
