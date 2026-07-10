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

type LegalSidebarIconKind = "source" | "updated" | "external" | "pdf" | "download";

function LegalSidebarIcon({ kind }: { kind: LegalSidebarIconKind }) {
  const commonProps = {
    "aria-hidden": true,
    className: "resource-detail__sidebar-icon",
    fill: "none",
    viewBox: "0 0 24 24",
  } as const;

  if (kind === "source") {
    return (
      <svg {...commonProps}>
        <path d="M10.6 13.4a4.5 4.5 0 0 0 6.36.02l2.12-2.12a4.5 4.5 0 0 0-6.36-6.36L11.5 6.16" />
        <path d="M13.4 10.6a4.5 4.5 0 0 0-6.36-.02L4.92 12.7a4.5 4.5 0 0 0 6.36 6.36l1.22-1.22" />
      </svg>
    );
  }

  if (kind === "updated") {
    return (
      <svg {...commonProps}>
        <path d="M7 3v3M17 3v3M4 9h16" />
        <rect x="4" y="5" width="16" height="15" rx="2.5" />
        <path d="M8 13h3M8 16h5" />
      </svg>
    );
  }

  if (kind === "external") {
    return (
      <svg {...commonProps}>
        <path d="M14 5h5v5M19 5l-8 8" />
        <path d="M18 13v4a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4" />
      </svg>
    );
  }

  if (kind === "pdf") {
    return (
      <svg {...commonProps}>
        <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
        <path d="M14 3v5h5M9 13h6M9 17h4" />
      </svg>
    );
  }

  return (
    <svg {...commonProps}>
      <path d="M12 3v11M8 10l4 4 4-4" />
      <path d="M5 16v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3" />
    </svg>
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
                        <div className="resource-detail__meta-row resource-detail__sidebar-item">
                          <span className="resource-detail__sidebar-copy">
                            <strong>{copy.officialSourceLabel}</strong>
                            <span>{item.sourceName}</span>
                          </span>
                          <LegalSidebarIcon kind="source" />
                        </div>
                      ) : null}
                      {item.dateUpdated ? (
                        <div className="resource-detail__meta-row resource-detail__sidebar-item">
                          <span className="resource-detail__sidebar-copy">
                            <strong>{copy.updatedLabel}</strong>
                            <span>{formatDisplayDate(item.dateUpdated, lang)}</span>
                          </span>
                          <LegalSidebarIcon kind="updated" />
                        </div>
                      ) : null}
                      {item.officialSourceUrl ? (
                        <a
                          href={item.officialSourceUrl}
                          className="resource-detail__mini-link resource-detail__sidebar-item"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <span className="resource-detail__sidebar-copy">
                            <strong>{copy.openSourceLabel}</strong>
                            <span>{item.sourceName || item.officialSourceUrl}</span>
                          </span>
                          <LegalSidebarIcon kind="external" />
                        </a>
                      ) : null}
                      {pdfOpenUrl ? (
                        <a
                          href={pdfOpenUrl}
                          className="resource-detail__mini-link resource-detail__sidebar-item"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <span className="resource-detail__sidebar-copy">
                            <strong>{copy.openPdfLabel}</strong>
                            <span>{item.fileLabel || item.title}</span>
                          </span>
                          <LegalSidebarIcon kind="pdf" />
                        </a>
                      ) : null}
                      {pdfDownloadHref ? (
                        <a
                          href={pdfDownloadHref}
                          className="resource-detail__mini-link resource-detail__sidebar-item"
                          download={pdfDownloadFilename}
                        >
                          <span className="resource-detail__sidebar-copy">
                            <strong>{copy.downloadPdfLabel}</strong>
                            <span>{item.fileLabel || item.title}</span>
                          </span>
                          <LegalSidebarIcon kind="download" />
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
