import { IntroMotifs } from "@/components/intro-motifs";
import { LegalCatalogue } from "@/components/legal-catalogue";
import { buildLegalCatalogue, readLegalCatalogueState } from "@/lib/legal-catalogue";
import { getLegalCatalogueCopy, getLegalCatalogueLabels } from "@/lib/legal-catalogue-copy";
import type { Metadata } from "next";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getDictionary, resolveLang, withLang } from "@/lib/i18n";
import {
  fetchHumanRightsCatalog,
  fetchLegalResources,
  getHumanRightsCopy,
  getLegalCompassSeo,
} from "@/lib/human-rights";
import { buildPageTitle, buildSeoMetadata } from "@/lib/seo";

type SearchParamValue = string | string[] | undefined;

export function generateMetadata({
  searchParams,
}: {
  searchParams: Record<string, SearchParamValue>;
}): Metadata {
  const lang = resolveLang(searchParams.lang);
  const seo = getLegalCompassSeo(lang);

  return buildSeoMetadata({
    lang,
    pathname: "/pravni-kompas",
    title: buildPageTitle(seo.title.replace(" | Avangarda", "")),
    description: seo.description,
  });
}

export default async function LegalCompassPage({
  searchParams,
}: {
  searchParams: Record<string, SearchParamValue>;
}) {
  const lang = resolveLang(searchParams.lang);
  const t = getDictionary(lang);
  const copy = getHumanRightsCopy(lang);

  const [resources, rights] = await Promise.all([
    fetchLegalResources(lang),
    fetchHumanRightsCatalog(lang),
  ]);

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    const first = Array.isArray(value) ? value[0] : value;
    if (first) params.set(key, first);
  }
  const catalogue = buildLegalCatalogue(resources, lang, readLegalCatalogueState(params), getLegalCatalogueLabels(lang));
  const catalogueUiCopy = {
    searchResourcesLabel: copy.searchResourcesLabel, searchResourcesPlaceholder: copy.searchResourcesPlaceholder,
    resourceTypeLabel: copy.resourceTypeLabel, legalAreaLabel: copy.legalAreaLabel, frameworkLabel: copy.frameworkLabel,
    connectedRightsLabel: copy.connectedRightsLabel, allTypesLabel: copy.allTypesLabel, allAreasLabel: copy.allAreasLabel,
    allFrameworksLabel: copy.allFrameworksLabel, allRightsLabel: copy.allRightsLabel, clearFiltersLabel: copy.clearFiltersLabel,
    openResourceLabel: copy.openResourceLabel, noResultsTitle: copy.noResultsTitle, noResultsCopy: copy.noResultsCopy,
  };

  return (
    <>
      <SiteHeader lang={lang} currentPath="/pravni-kompas" activeNav="archive" />

      <main className="site-main">
        <div className="page-shell page-shell--resource-hub">
          <section className="panel subpage-hero resource-hub__hero legal-compass-intro has-intro-motifs">
            <IntroMotifs kind="legal" />
            <h1 className="subpage-hero__title">{copy.legalCompassLabel}</h1>
            <p className="subpage-hero__copy">{copy.legalCompassSectionCopy}</p>
          </section>

          <section className="panel resource-hub__notice">
            <span className="eyebrow">{copy.disclaimerCompact}</span>
            <p>{copy.disclaimer}</p>
          </section>

          <section className="resource-hub__section">
            <div className="section-header">
              <div>
                <h2 className="section-title">{copy.searchResourcesLabel}</h2>
              </div>
            </div>

            <LegalCatalogue lang={lang} initial={catalogue} copy={catalogueUiCopy} catalogueCopy={getLegalCatalogueCopy(lang)} />
          </section>

          <section className="resource-hub__section">
            <div className="section-header">
              <div>
                <span className="eyebrow">{copy.humanRightsLabel}</span>
                <h2 className="section-title">{copy.rightsCatalogTitle}</h2>
                <p className="section-copy">{copy.rightsCatalogCopy}</p>
              </div>
              <a href={withLang("/ljudska-prava", lang)} className="button-secondary">
                {copy.openSectionLabel}
              </a>
            </div>

            {rights.length ? (
              <div className="resource-hub__rights-grid">
                {rights.slice(0, 6).map((entry) => (
                  <a
                    key={entry.slug}
                    href={withLang(`/ljudska-prava/${entry.slug}`, lang)}
                    className="panel resource-hub__right-card"
                  >
                    <div>
                      <span className="resource-hub__card-kicker">{copy.humanRightsLabel}</span>
                      <h3 className="resource-hub__card-title">{entry.title}</h3>
                      {entry.shortDescription ? <p className="resource-hub__card-copy">{entry.shortDescription}</p> : null}
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
        </div>
      </main>

      <SiteFooter lang={lang} t={t} />
    </>
  );
}
