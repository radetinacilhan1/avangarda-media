import type { Metadata } from "next";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getDictionary, resolveLang, withLang } from "@/lib/i18n";
import {
  fetchHumanRightsCatalog,
  fetchHumanRightsPage,
  fetchLegalResources,
  getFrameworkLabel,
  getHumanRightsCopy,
  getHumanRightsSeo,
  getLegalResourceTypeLabel,
} from "@/lib/human-rights";
import { getRichTextHtml } from "@/lib/richtext";
import { buildPageTitle, buildSeoMetadata } from "@/lib/seo";

type SearchParamValue = string | string[] | undefined;

function renderRichText(value: string, lang: ReturnType<typeof resolveLang>) {
  return {
    __html: getRichTextHtml(value, {
      lang,
      imageCredits: [],
      bodyImages: [],
    }),
  };
}

export function generateMetadata({
  searchParams,
}: {
  searchParams: Record<string, SearchParamValue>;
}): Metadata {
  const lang = resolveLang(searchParams.lang);
  const seo = getHumanRightsSeo(lang);

  return buildSeoMetadata({
    lang,
    pathname: "/ljudska-prava",
    title: buildPageTitle(seo.title.replace(" | Avangarda", "")),
    description: seo.description,
  });
}

export default async function HumanRightsPage({
  searchParams,
}: {
  searchParams: Record<string, SearchParamValue>;
}) {
  const lang = resolveLang(searchParams.lang);
  const t = getDictionary(lang);
  const copy = getHumanRightsCopy(lang);

  const [pageData, rights, legalResources] = await Promise.all([
    fetchHumanRightsPage(lang),
    fetchHumanRightsCatalog(lang),
    fetchLegalResources(lang),
  ]);

  const featuredResources = (legalResources.filter((entry) => entry.isFeatured).length
    ? legalResources.filter((entry) => entry.isFeatured)
    : legalResources
  ).slice(0, 3);

  return (
    <>
      <SiteHeader lang={lang} currentPath="/ljudska-prava" activeNav="news" />

      <main className="site-main">
        <div className="page-shell page-shell--resource-hub">
          <section className="panel subpage-hero resource-hub__hero">
            <span className="eyebrow">{copy.humanRightsLabel}</span>
            <h1 className="subpage-hero__title">{pageData.title}</h1>
            <p className="resource-hub__hero-statement">{pageData.heroText || copy.heroTitle}</p>
            <p className="subpage-hero__copy">{pageData.introText || copy.introText}</p>
          </section>

          <section className="resource-hub__story-grid">
            <article id="sta-su-ljudska-prava" className="panel resource-hub__text-panel">
              <span className="eyebrow">{copy.humanRightsLabel}</span>
              <h2 className="resource-hub__section-title">{copy.introSectionLabel}</h2>
              {pageData.body ? (
                <div
                  className="resource-hub__richtext"
                  dangerouslySetInnerHTML={renderRichText(pageData.body, lang)}
                />
              ) : (
                <p className="resource-hub__body-copy">{copy.fallbackExplain}</p>
              )}
            </article>

            <article id="prava-u-svakodnevnom-zivotu" className="panel resource-hub__text-panel">
              <span className="eyebrow">{copy.humanRightsLabel}</span>
              <h2 className="resource-hub__section-title">{copy.everydaySectionLabel}</h2>
              <p className="resource-hub__body-copy">{copy.fallbackEverydayLife}</p>
            </article>
          </section>

          <section className="resource-hub__section">
            <div className="section-header">
              <div>
                <span className="eyebrow">{copy.humanRightsLabel}</span>
                <h2 className="section-title">{copy.openSectionLabel}</h2>
              </div>
            </div>

            <div className="resource-hub__card-grid">
              {pageData.cards.map((card) => (
                <a key={`${card.key || card.title}-${card.href}`} href={card.href} className="panel resource-hub__link-card">
                  <div>
                    <span className="resource-hub__card-kicker">{copy.humanRightsLabel}</span>
                    <h3 className="resource-hub__card-title">{card.title}</h3>
                    <p className="resource-hub__card-copy">{card.description}</p>
                  </div>
                  <span className="button-secondary">{card.linkLabel || copy.openSectionLabel}</span>
                </a>
              ))}
            </div>
          </section>

          <section id="katalog-prava" className="resource-hub__section">
            <div className="section-header">
              <div>
                <span className="eyebrow">{copy.rightsCatalogLabel}</span>
                <h2 className="section-title">{copy.rightsCatalogTitle}</h2>
                <p className="section-copy">{copy.rightsCatalogCopy}</p>
              </div>
            </div>

            {rights.length ? (
              <div className="resource-hub__rights-grid">
                {rights.map((right) => (
                  <a key={right.slug} href={withLang(`/ljudska-prava/${right.slug}`, lang)} className="panel resource-hub__right-card">
                    <div>
                      <span className="resource-hub__card-kicker">{right.isFeatured ? copy.humanRightsLabel : copy.openRightLabel}</span>
                      <h3 className="resource-hub__card-title">{right.title}</h3>
                      {right.shortDescription ? <p className="resource-hub__card-copy">{right.shortDescription}</p> : null}
                    </div>
                    <span className="button-secondary">{copy.openRightLabel}</span>
                  </a>
                ))}
              </div>
            ) : (
              <div className="panel empty-state resource-hub__empty">
                <h3>{copy.noRightsTitle}</h3>
                <p>{copy.noRightsCopy}</p>
              </div>
            )}
          </section>

          <section id="pravni-kompas" className="resource-hub__section">
            <div className="section-header">
              <div>
                <span className="eyebrow">{copy.legalCompassLabel}</span>
                <h2 className="section-title">{copy.legalCompassSectionTitle}</h2>
                <p className="section-copy">{copy.legalCompassSectionCopy}</p>
              </div>
              <a href={withLang("/pravni-kompas", lang)} className="button-secondary">
                {copy.browseResourcesLabel}
              </a>
            </div>

            {featuredResources.length ? (
              <div className="resource-hub__resource-grid">
                {featuredResources.map((resource) => (
                  <article key={resource.slug} className="panel resource-hub__resource-card">
                    <div className="resource-hub__resource-meta">
                      <span className="topic-pill">{getLegalResourceTypeLabel(resource.type, lang)}</span>
                      <span className="topic-pill">{getFrameworkLabel(resource.countryOrFramework, lang)}</span>
                    </div>
                    <h3 className="resource-hub__card-title">{resource.title}</h3>
                    {resource.legalArea ? (
                      <p className="resource-hub__resource-area">
                        <strong>{copy.legalAreaLabel}:</strong> {resource.legalArea}
                      </p>
                    ) : null}
                    {resource.shortDescription ? <p className="resource-hub__card-copy">{resource.shortDescription}</p> : null}
                    <div className="resource-hub__resource-actions">
                      <a href={withLang(`/pravni-kompas/${resource.slug}`, lang)} className="button-secondary">
                        {copy.openResourceLabel}
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="panel empty-state resource-hub__empty">
                <h3>{copy.noResourcesTitle}</h3>
                <p>{copy.noResourcesCopy}</p>
              </div>
            )}
          </section>
        </div>
      </main>

      <SiteFooter lang={lang} t={t} />
    </>
  );
}
