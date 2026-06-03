import type { Metadata } from "next";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getDictionary, resolveLang, withLang } from "@/lib/i18n";
import {
  fetchHumanRightsCatalog,
  fetchLegalResources,
  filterLegalResources,
  getFrameworkLabel,
  getHumanRightsCopy,
  getLegalCompassSeo,
  getLegalResourceTypeLabel,
  type LegalResourceFramework,
  type LegalResourceType,
} from "@/lib/human-rights";
import { buildPageTitle, buildSeoMetadata } from "@/lib/seo";

type SearchParamValue = string | string[] | undefined;

const resourceTypes: LegalResourceType[] = [
  "law",
  "guide",
  "template",
  "explainer",
  "international_document",
  "official_source",
  "other",
];

const resourceFrameworks: LegalResourceFramework[] = [
  "serbia",
  "regional",
  "international",
  "eu",
  "council_of_europe",
  "un",
  "other",
];

function readParam(value: SearchParamValue) {
  return Array.isArray(value) ? value[0] || "" : value || "";
}

function uniqueValues(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean))).sort((left, right) =>
    left.localeCompare(right, undefined, { sensitivity: "base" })
  );
}

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

  const q = readParam(searchParams.q);
  const type = readParam(searchParams.type);
  const area = readParam(searchParams.area);
  const framework = readParam(searchParams.framework);
  const right = readParam(searchParams.right);

  const [resources, rights] = await Promise.all([
    fetchLegalResources(lang),
    fetchHumanRightsCatalog(lang),
  ]);

  const filteredResources = filterLegalResources(resources, { q, type, area, framework, right });
  const legalAreas = uniqueValues(resources.map((resource) => resource.legalArea));
  const availableTypes = resourceTypes.filter((entry) => resources.some((resource) => resource.type === entry));
  const availableFrameworks = resourceFrameworks.filter((entry) =>
    resources.some((resource) => resource.countryOrFramework === entry)
  );
  const hasActiveFilters = Boolean(q || type || area || framework || right);

  return (
    <>
      <SiteHeader lang={lang} currentPath="/pravni-kompas" activeNav="archive" />

      <main className="site-main">
        <div className="page-shell page-shell--resource-hub">
          <section className="panel subpage-hero resource-hub__hero">
            <span className="eyebrow">{copy.legalCompassLabel}</span>
            <h1 className="subpage-hero__title">{copy.legalCompassLabel}</h1>
            <p className="resource-hub__hero-statement">{copy.legalCompassSectionTitle}</p>
            <p className="subpage-hero__copy">{copy.legalCompassSectionCopy}</p>
          </section>

          <section className="panel resource-hub__notice">
            <span className="eyebrow">{copy.disclaimerCompact}</span>
            <p>{copy.disclaimer}</p>
          </section>

          <section className="resource-hub__section">
            <div className="section-header">
              <div>
                <span className="eyebrow">{copy.legalCompassLabel}</span>
                <h2 className="section-title">{copy.searchResourcesLabel}</h2>
                <p className="section-copy">{copy.legalCompassSectionCopy}</p>
              </div>
            </div>

            <form action="/pravni-kompas" method="get" className="panel resource-hub__filter-panel">
              <input type="hidden" name="lang" value={lang} />

              <div className="resource-hub__filter-grid">
                <label className="resource-hub__field">
                  <span>{copy.searchResourcesLabel}</span>
                  <input
                    type="search"
                    name="q"
                    defaultValue={q}
                    placeholder={copy.searchResourcesPlaceholder}
                    className="resource-hub__input"
                  />
                </label>

                <label className="resource-hub__field">
                  <span>{copy.resourceTypeLabel}</span>
                  <select name="type" defaultValue={type} className="resource-hub__select">
                    <option value="">{copy.allTypesLabel}</option>
                    {availableTypes.map((entry) => (
                      <option key={entry} value={entry}>
                        {getLegalResourceTypeLabel(entry, lang)}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="resource-hub__field">
                  <span>{copy.legalAreaLabel}</span>
                  <select name="area" defaultValue={area} className="resource-hub__select">
                    <option value="">{copy.allAreasLabel}</option>
                    {legalAreas.map((entry) => (
                      <option key={entry} value={entry}>
                        {entry}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="resource-hub__field">
                  <span>{copy.frameworkLabel}</span>
                  <select name="framework" defaultValue={framework} className="resource-hub__select">
                    <option value="">{copy.allFrameworksLabel}</option>
                    {availableFrameworks.map((entry) => (
                      <option key={entry} value={entry}>
                        {getFrameworkLabel(entry, lang)}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="resource-hub__field">
                  <span>{copy.connectedRightsLabel}</span>
                  <select name="right" defaultValue={right} className="resource-hub__select">
                    <option value="">{copy.allRightsLabel}</option>
                    {rights.map((entry) => (
                      <option key={entry.slug} value={entry.slug}>
                        {entry.title}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="resource-hub__filter-actions">
                <button type="submit" className="button-secondary">
                  {copy.searchResourcesLabel}
                </button>
                {hasActiveFilters ? (
                  <a href={withLang("/pravni-kompas", lang)} className="button-secondary">
                    {copy.clearFiltersLabel}
                  </a>
                ) : null}
              </div>
            </form>

            {filteredResources.length ? (
              <div className="resource-hub__resource-grid">
                {filteredResources.map((resource) => (
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

                    {resource.relatedHumanRights.length ? (
                      <div className="topic-list">
                        {resource.relatedHumanRights.slice(0, 3).map((entry) => (
                          <a
                            key={entry.slug}
                            href={withLang(`/ljudska-prava/${entry.slug}`, lang)}
                            className="topic-pill"
                          >
                            {entry.title}
                          </a>
                        ))}
                      </div>
                    ) : null}

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
                <h3>{copy.noResultsTitle}</h3>
                <p>{copy.noResultsCopy}</p>
              </div>
            )}
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
