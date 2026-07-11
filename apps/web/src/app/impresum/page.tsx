import type { Metadata } from "next";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { fetchImpressumPageCopy } from "@/lib/impressum";
import { getDictionary, resolveLang } from "@/lib/i18n";
import { buildPageTitle, buildSeoMetadata } from "@/lib/seo";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}): Promise<Metadata> {
  const lang = resolveLang(searchParams.lang);
  const pageCopy = await fetchImpressumPageCopy(lang);

  return buildSeoMetadata({
    lang,
    pathname: "/impresum",
    title: buildPageTitle(pageCopy.label),
    description: pageCopy.intro,
  });
}

export default async function ImpressumPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const lang = resolveLang(searchParams.lang);
  const t = getDictionary(lang);
  const pageCopy = await fetchImpressumPageCopy(lang);

  return (
    <>
      <SiteHeader lang={lang} currentPath="/impresum" activeNav="about" />

      <main className="site-main impressum-page">
        <div className="page-shell">
          <section className="panel subpage-hero">
            <span className="eyebrow">{pageCopy.label}</span>
            <h1 className="subpage-hero__title">{pageCopy.title}</h1>
            <p className="subpage-hero__copy">{pageCopy.intro}</p>
          </section>

          <section className="panel info-card impressum-sheet">
            <span className="eyebrow">{pageCopy.detailsLabel}</span>
            <h2 className="impressum-sheet__title">{pageCopy.detailsTitle}</h2>
            <p className="impressum-sheet__lead">{pageCopy.summary}</p>

            <dl className="impressum-meta" aria-label={pageCopy.detailsTitle}>
              {pageCopy.details.map((entry) => (
                <div key={entry.label} className="impressum-meta__row">
                  <dt className="impressum-meta__label">{entry.label}</dt>
                  <dd className="impressum-meta__value">
                    {entry.links?.length ? (
                      entry.links.map((link, index) => (
                        <span key={link.href}>
                          {index > 0 ? " / " : ""}
                          <a href={link.href}>{link.label}</a>
                        </span>
                      ))
                    ) : entry.href ? (
                      <a href={entry.href}>{entry.value}</a>
                    ) : (
                      entry.value
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="page-grid">
            <article className="panel info-card">
              <span className="eyebrow">{pageCopy.noteLabel}</span>
              <h3>{pageCopy.noteTitle}</h3>
              <p>{pageCopy.noteCopy}</p>
            </article>

            <article className="panel info-card">
              <span className="eyebrow">{pageCopy.rightsLabel}</span>
              <h3>{pageCopy.rightsTitle}</h3>
              <p>{pageCopy.rightsCopy}</p>
            </article>

            <article className="panel info-card">
              <span className="eyebrow">{pageCopy.responsibilityLabel}</span>
              <h3>{pageCopy.responsibilityTitle}</h3>
              <p>{pageCopy.responsibilityCopy}</p>
            </article>
          </section>
        </div>
      </main>

      <SiteFooter lang={lang} t={t} />
    </>
  );
}
