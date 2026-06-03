import type { Metadata } from "next";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getDictionary, resolveLang, withLang } from "@/lib/i18n";
import {
  fetchHumanRightBySlug,
  getHumanRightsCopy,
  getHumanRightsSeo,
} from "@/lib/human-rights";
import { getRichTextHtml } from "@/lib/richtext";
import { buildPageTitle, buildSeoMetadata } from "@/lib/seo";
import { formatDisplayDate } from "@/lib/strapi";

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

type DetailPanelProps = {
  title: string;
  body: string;
  lang: ReturnType<typeof resolveLang>;
};

function DetailPanel({ title, body, lang }: DetailPanelProps) {
  if (!body.trim()) return null;

  return (
    <section className="panel resource-detail__section">
      <h2 className="resource-detail__section-title">{title}</h2>
      <div className="resource-hub__richtext" dangerouslySetInnerHTML={renderRichText(body, lang)} />
    </section>
  );
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: Record<string, SearchParamValue>;
}): Promise<Metadata> {
  const lang = resolveLang(searchParams.lang);
  const copy = getHumanRightsCopy(lang);
  const item = await fetchHumanRightBySlug(lang, params.slug);
  const seo = getHumanRightsSeo(lang);

  return buildSeoMetadata({
    lang,
    pathname: `/ljudska-prava/${params.slug}`,
    title: buildPageTitle(item?.title || copy.humanRightsLabel),
    description: item?.shortDescription || seo.description,
  });
}

export default async function HumanRightDetailPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: Record<string, SearchParamValue>;
}) {
  const lang = resolveLang(searchParams.lang);
  const t = getDictionary(lang);
  const copy = getHumanRightsCopy(lang);
  const item = await fetchHumanRightBySlug(lang, params.slug);

  return (
    <>
      <SiteHeader lang={lang} currentPath={`/ljudska-prava/${params.slug}`} activeNav="news" />

      <main className="site-main">
        <div className="page-shell page-shell--resource-hub">
          {item ? (
            <>
              <section className="panel subpage-hero resource-hub__hero">
                <span className="eyebrow">{copy.humanRightsLabel}</span>
                <h1 className="subpage-hero__title">{item.title}</h1>
                {item.shortDescription ? <p className="subpage-hero__copy">{item.shortDescription}</p> : null}
              </section>

              <div className="resource-detail">
                <div className="resource-detail__main">
                  <DetailPanel title={copy.whatItMeansLabel} body={item.whatItMeans || item.body} lang={lang} />
                  <DetailPanel title={copy.whyItMattersLabel} body={item.whyItMatters} lang={lang} />
                  <DetailPanel title={copy.everydayExamplesLabel} body={item.everydayExamples} lang={lang} />
                  <DetailPanel title={copy.legalBasisLabel} body={item.legalBasis} lang={lang} />
                  <DetailPanel title={copy.serbiaFrameworkLabel} body={item.serbiaFramework} lang={lang} />
                  <DetailPanel title={copy.internationalFrameworkLabel} body={item.internationalFramework} lang={lang} />
                </div>

                <aside className="resource-detail__sidebar">
                  {item.relatedLegalResources.length ? (
                    <section className="panel resource-detail__aside-card">
                      <h2 className="resource-detail__aside-title">{copy.relatedResourcesLabel}</h2>
                      <div className="resource-detail__stack">
                        {item.relatedLegalResources.map((resource) => (
                          <a key={resource.slug} href={withLang(`/pravni-kompas/${resource.slug}`, lang)} className="resource-detail__mini-link">
                            <strong>{resource.title}</strong>
                            {resource.shortDescription ? <span>{resource.shortDescription}</span> : null}
                          </a>
                        ))}
                      </div>
                    </section>
                  ) : null}

                  {item.relatedArticles.length ? (
                    <section className="panel resource-detail__aside-card">
                      <h2 className="resource-detail__aside-title">{copy.relatedArticlesLabel}</h2>
                      <div className="resource-detail__stack">
                        {item.relatedArticles.map((article) => (
                          <a key={article.slug} href={withLang(`/a/${article.slug}`, lang)} className="resource-detail__mini-link">
                            <strong>{article.title}</strong>
                            {article.publishedAt ? <span>{formatDisplayDate(article.publishedAt, lang)}</span> : null}
                          </a>
                        ))}
                      </div>
                    </section>
                  ) : null}

                  {item.relatedTopics.length ? (
                    <section className="panel resource-detail__aside-card">
                      <h2 className="resource-detail__aside-title">{copy.relatedTopicsLabel}</h2>
                      <div className="topic-list">
                        {item.relatedTopics.map((topic) => (
                          <a key={topic.slug} href={withLang(`/topic/${topic.slug}`, lang)} className="topic-pill">
                            {topic.name}
                          </a>
                        ))}
                      </div>
                    </section>
                  ) : null}

                  {item.relatedLocations.length ? (
                    <section className="panel resource-detail__aside-card">
                      <h2 className="resource-detail__aside-title">{copy.relatedLocationsLabel}</h2>
                      <div className="topic-list">
                        {item.relatedLocations.map((location) => (
                          <a key={location.slug} href={withLang(`/mapa?location=${location.slug}`, lang)} className="topic-pill">
                            {location.name}
                          </a>
                        ))}
                      </div>
                    </section>
                  ) : null}
                </aside>
              </div>
            </>
          ) : (
            <section className="panel empty-state resource-hub__empty">
              <h3>{copy.notFoundTitle}</h3>
              <p>{copy.notFoundCopy}</p>
            </section>
          )}
        </div>
      </main>

      <SiteFooter lang={lang} t={t} />
    </>
  );
}
