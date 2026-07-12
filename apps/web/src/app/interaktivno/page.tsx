import type { Metadata } from "next";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import styles from "@/components/power-game.module.css";
import { getInteractiveCopy } from "@/lib/interactive";
import { getDictionary, resolveLang, withLang } from "@/lib/i18n";
import { buildSeoMetadata } from "@/lib/seo";

type SearchParamValue = string | string[] | undefined;

export function generateMetadata({
  searchParams,
}: {
  searchParams: Record<string, SearchParamValue>;
}): Metadata {
  const lang = resolveLang(searchParams.lang);
  const copy = getInteractiveCopy(lang);

  return buildSeoMetadata({
    lang,
    pathname: "/interaktivno",
    title: `${copy.sectionLabel} | Avangarda`,
    description: copy.listingSeoDescription,
  });
}

export default function InteractiveListingPage({
  searchParams,
}: {
  searchParams: Record<string, SearchParamValue>;
}) {
  const lang = resolveLang(searchParams.lang);
  const t = getDictionary(lang);
  const copy = getInteractiveCopy(lang);
  const levelLabels = copy.levels.map((level) => level.title);

  return (
    <>
      <SiteHeader lang={lang} currentPath="/interaktivno" activeNav="news" />

      <main className="site-main">
        <div className="page-shell">
          <section className={`panel subpage-hero ${styles.listingHero}`}>
            <span className="eyebrow">{copy.sectionLabel}</span>
            <h1 className="subpage-hero__title">{copy.listingTitle}</h1>
            <p className="subpage-hero__copy">{copy.listingIntro}</p>
          </section>

          {copy.languageNotice ? <p className={styles.languageNotice}>{copy.languageNotice}</p> : null}

          <section className="section-block">
            <div className="section-header">
              <div>
                <span className="eyebrow">{copy.sectionLabel}</span>
                <h2 className="section-title">{copy.firstFormatLabel}</h2>
              </div>
            </div>

            <a
              href={withLang("/interaktivno/moc", lang)}
              className={`panel ${styles.listingCard}`}
              aria-label={`${copy.openLabel}: ${copy.gameTitle}`}
            >
              <div className={styles.listingCardBody}>
                <span className="eyebrow">{copy.typeLabel}</span>
                <h2>{copy.gameTitle}</h2>
                <p>{copy.gameSubtitle}</p>
                <div className={styles.listingMeta}>
                  <span>{copy.typeLabel}</span>
                  <span>{copy.durationLabel}: {copy.durationValue}</span>
                </div>
                <span className={styles.listingCta}>{copy.openLabel}</span>
              </div>

              <div className={styles.listingVisual} aria-hidden="true">
                {levelLabels.map((label, index) => (
                  <span key={label}>{String(index + 1).padStart(2, "0")} {label}</span>
                ))}
              </div>
            </a>
          </section>
        </div>
      </main>

      <SiteFooter lang={lang} t={t} />
    </>
  );
}
