import type { Metadata } from "next";

import { DocumentaryFeatureCard } from "@/components/documentary-feature-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { fetchDocumentaryArchive, getDocumentaryUiCopy } from "@/lib/documentaries";
import { getDictionary, resolveLang } from "@/lib/i18n";
import { buildPageTitle, buildSeoMetadata } from "@/lib/seo";
import { formatDisplayDate } from "@/lib/strapi";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}): Promise<Metadata> {
  const lang = resolveLang(searchParams.lang);
  const copy = getDocumentaryUiCopy(lang);

  return buildSeoMetadata({
    lang,
    pathname: "/dokumentarci",
    title: buildPageTitle(copy.pageTitle),
    description: copy.pageIntro,
  });
}

export default async function DocumentaryArchivePage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const lang = resolveLang(searchParams.lang);
  const t = getDictionary(lang);
  const copy = getDocumentaryUiCopy(lang);
  const documentaries = await fetchDocumentaryArchive(lang, true);
  const featuredDocumentary = documentaries[0] ?? null;
  const archiveItems = documentaries.slice(1);

  return (
    <>
      <SiteHeader lang={lang} currentPath="/dokumentarci" />

      <main className="site-main">
        <div className="page-shell">
          <section className="panel subpage-hero documentary-page-hero">
            <span className="eyebrow">{copy.label}</span>
            <h1 className="subpage-hero__title">{copy.pageTitle}</h1>
            <p className="subpage-hero__copy">{copy.pageIntro}</p>
          </section>

          {featuredDocumentary ? (
            <section className="section-block">
              <div className="section-header">
                <div>
                  <span className="eyebrow">{copy.label}</span>
                  <h2 className="section-title">{copy.headline}</h2>
                </div>
              </div>

              <DocumentaryFeatureCard
                lang={lang}
                documentary={featuredDocumentary}
                copy={copy}
                variant="page"
              />
            </section>
          ) : null}

          {archiveItems.length ? (
            <section className="section-block">
              <div className="section-header">
                <div>
                  <span className="eyebrow">{copy.label}</span>
                  <h2 className="section-title">{copy.watchAllLabel}</h2>
                </div>
              </div>

              <div className="documentary-archive-grid">
                {archiveItems.map((documentary) => (
                  <article key={documentary.id} className="panel documentary-archive-card">
                    {documentary.thumbnailUrl ? (
                      <div className="documentary-archive-card__media">
                        <img
                          className="documentary-archive-card__image"
                          src={documentary.thumbnailUrl}
                          alt={documentary.title}
                        />
                      </div>
                    ) : (
                      <div className="documentary-archive-card__media documentary-archive-card__media--empty">
                        <span>{copy.unavailableLabel}</span>
                      </div>
                    )}

                    <div className="documentary-archive-card__body">
                      <span className="eyebrow">{copy.label}</span>
                      <h3>{documentary.title}</h3>
                      <p>{documentary.description}</p>

                      <div className="documentary-archive-card__meta">
                        {documentary.date ? <span>{copy.dateLabel}: {formatDisplayDate(documentary.date, lang)}</span> : null}
                        {documentary.location ? <span>{copy.locationLabel}: {documentary.location}</span> : null}
                        {documentary.duration ? <span>{copy.durationLabel}: {documentary.duration}</span> : null}
                      </div>

                      {documentary.externalUrl ? (
                        <a
                          className="button-secondary documentary-archive-card__cta"
                          href={documentary.externalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {copy.watchLabel}
                        </a>
                      ) : null}
                    </div>
                  </article>
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
