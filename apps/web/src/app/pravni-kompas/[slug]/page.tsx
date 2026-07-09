import type { Metadata } from "next";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getDictionary, resolveLang, withLang } from "@/lib/i18n";
import {
  fetchLegalResourceBySlug,
  getFrameworkLabel,
  getHumanRightsCopy,
  getLegalCompassSeo,
  getLegalResourceTypeLabel,
  type LegalResourceItem,
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

function slugifyPdfFilename(value: string) {
  const normalized = value
    .replace(/\.pdf$/i, "")
    .replace(/[đĐ]/g, "d")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${normalized || "pravni-resurs"}.pdf`;
}

function buildPdfDownloadFilename(item: Pick<LegalResourceItem, "slug" | "fileLabel" | "title">) {
  return slugifyPdfFilename(item.slug || item.fileLabel || item.title);
}

function buildPdfDownloadHref(item: Pick<LegalResourceItem, "pdfUrl" | "downloadableUrl" | "slug" | "fileLabel" | "title">) {
  const url = item.downloadableUrl || item.pdfUrl;
  if (!url) return "";

  const params = new URLSearchParams({
    url,
    filename: buildPdfDownloadFilename(item),
  });

  return `/api/legal-resource-download?${params.toString()}`;
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
  const item = await fetchLegalResourceBySlug(lang, params.slug);
  const seo = getLegalCompassSeo(lang);

  return buildSeoMetadata({
    lang,
    pathname: `/pravni-kompas/${params.slug}`,
    title: buildPageTitle(item?.title || copy.legalCompassLabel),
    description: item?.shortDescription || seo.description,
  });
}

export default async function LegalResourceDetailPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: Record<string, SearchParamValue>;
}) {
  const lang = resolveLang(searchParams.lang);
  const t = getDictionary(lang);
  const copy = getHumanRightsCopy(lang);
  const item = await fetchLegalResourceBySlug(lang, params.slug);
  const pdfOpenUrl = item?.pdfUrl || item?.downloadableUrl || "";
  const pdfDownloadFilename = item ? buildPdfDownloadFilename(item) : "";
  const pdfDownloadHref = item ? buildPdfDownloadHref(item) : "";

  return (
    <>
      <SiteHeader lang={lang} currentPath={`/pravni-kompas/${params.slug}`} activeNav="archive" />

      <main className="site-main">
        <div className="page-shell page-shell--resource-hub">
          {item ? (
            <>
              <section className="panel subpage-hero resource-hub__hero">
                <span className="eyebrow">{copy.legalCompassLabel}</span>
                <h1 className="subpage-hero__title">{item.title}</h1>
                <div className="resource-hub__hero-pills">
                  <span className="topic-pill">{getLegalResourceTypeLabel(item.type, lang)}</span>
                  <span className="topic-pill">{getFrameworkLabel(item.countryOrFramework, lang)}</span>
                  {item.legalArea ? <span className="topic-pill">{item.legalArea}</span> : null}
                </div>
                {item.shortDescription ? <p className="subpage-hero__copy">{item.shortDescription}</p> : null}
              </section>

              <section className="panel resource-hub__notice">
                <span className="eyebrow">{copy.disclaimerCompact}</span>
                <p>{copy.disclaimer}</p>
              </section>

              <div className="resource-detail">
                <div className="resource-detail__main">
                  <DetailPanel
                    title={item.legalArea || getLegalResourceTypeLabel(item.type, lang)}
                    body={item.body || item.whatIsThisFor}
                    lang={lang}
                  />
                  {item.body && item.whatIsThisFor && item.whatIsThisFor !== item.body ? (
                    <DetailPanel title={copy.whatIsThisForLabel} body={item.whatIsThisFor} lang={lang} />
                  ) : null}
                  <DetailPanel title={copy.whoCanUseItLabel} body={item.whoCanUseIt} lang={lang} />
                  <DetailPanel title={copy.whenToUseItLabel} body={item.whenToUseIt} lang={lang} />
                </div>

                <aside className="resource-detail__sidebar">
                  <section className="panel resource-detail__aside-card">
                    <h2 className="resource-detail__aside-title">{copy.legalCompassLabel}</h2>
                    <div className="resource-detail__stack">
                      {item.sourceName ? (
                        <div className="resource-detail__meta-row">
                          <strong>{copy.officialSourceLabel}</strong>
                          <span>{item.sourceName}</span>
                        </div>
                      ) : null}
                      {item.dateUpdated ? (
                        <div className="resource-detail__meta-row">
                          <strong>{copy.updatedLabel}</strong>
                          <span>{formatDisplayDate(item.dateUpdated, lang)}</span>
                        </div>
                      ) : null}
                      {item.officialSourceUrl ? (
                        <a
                          href={item.officialSourceUrl}
                          className="resource-detail__mini-link"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <strong>{copy.openSourceLabel}</strong>
                          <span>{item.sourceName || item.officialSourceUrl}</span>
                        </a>
                      ) : null}
                      {pdfOpenUrl ? (
                        <a href={pdfOpenUrl} className="resource-detail__mini-link" target="_blank" rel="noopener noreferrer">
                          <strong>{copy.openPdfLabel}</strong>
                          <span>{item.fileLabel || item.title}</span>
                        </a>
                      ) : null}
                      {pdfDownloadHref ? (
                        <a
                          href={pdfDownloadHref}
                          className="resource-detail__mini-link"
                          download={pdfDownloadFilename}
                        >
                          <strong>{copy.downloadPdfLabel}</strong>
                          <span>{item.fileLabel || item.title}</span>
                        </a>
                      ) : null}
                    </div>
                  </section>

                  {item.relatedHumanRights.length ? (
                    <section className="panel resource-detail__aside-card">
                      <h2 className="resource-detail__aside-title">{copy.connectedRightsLabel}</h2>
                      <div className="resource-detail__stack">
                        {item.relatedHumanRights.map((right) => (
                          <a key={right.slug} href={withLang(`/ljudska-prava/${right.slug}`, lang)} className="resource-detail__mini-link">
                            <strong>{right.title}</strong>
                            {right.shortDescription ? <span>{right.shortDescription}</span> : null}
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
