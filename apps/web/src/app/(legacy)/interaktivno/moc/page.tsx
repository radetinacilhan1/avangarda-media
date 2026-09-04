import type { Metadata } from "next";

import { PowerGame } from "@/components/power-game";
import styles from "@/components/power-game.module.css";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getDictionary, resolveLang, withLang } from "@/lib/i18n";
import { getInteractiveCopy } from "@/lib/interactive";
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
    pathname: "/interaktivno/moc",
    title: `${copy.gameTitle} | Avangarda`,
    description: copy.seoDescription,
  });
}

export default function PowerGamePage({
  searchParams,
}: {
  searchParams: Record<string, SearchParamValue>;
}) {
  const lang = resolveLang(searchParams.lang);
  const t = getDictionary(lang);
  const copy = getInteractiveCopy(lang);

  return (
    <>
      <SiteHeader lang={lang} currentPath="/interaktivno/moc" activeNav="news" />

      <main className="site-main">
        <div className="page-shell">
          <section className="panel subpage-hero">
            <span className="eyebrow">{copy.sectionLabel}</span>
            <h1 className="subpage-hero__title">{copy.gameTitle}</h1>
            <p className="subpage-hero__copy">{copy.gameSubtitle}</p>
            <div className="info-card__links">
              <a href={withLang("/interaktivno", lang)} className="button-secondary">
                {copy.backLabel}
              </a>
            </div>
          </section>

          {copy.languageNotice ? <p className={styles.languageNotice}>{copy.languageNotice}</p> : null}

          <PowerGame copy={copy} />

          <section id="sta-se-desilo" className={`section-block ${styles.contextSection}`}>
            <div className="section-header">
              <div>
                <span className="eyebrow">{copy.contextEyebrow}</span>
                <h2 className="section-title">{copy.contextTitle}</h2>
                <p className="section-copy">{copy.contextIntro}</p>
              </div>
            </div>

            <div className={styles.contextGrid}>
              {copy.contextCards.map((card, index) => (
                <article className={`panel info-card ${styles.contextCard}`} key={card.title}>
                  <span className="eyebrow">0{index + 1}</span>
                  <h3>{card.title}</h3>
                  <p>{card.copy}</p>
                </article>
              ))}
            </div>

            <p className={styles.inspiration}>{copy.inspiration}</p>
          </section>
        </div>
      </main>

      <SiteFooter lang={lang} t={t} />
    </>
  );
}
