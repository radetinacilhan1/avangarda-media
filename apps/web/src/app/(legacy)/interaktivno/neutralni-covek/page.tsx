import type { Metadata } from "next";

import { NeutralManGame } from "@/components/neutral-man-game";
import styles from "@/components/neutral-man-game.module.css";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getDictionary, resolveLang, withLang } from "@/lib/i18n";
import { getNeutralManCopy } from "@/lib/neutral-man-interactive-copy";
import { buildSeoMetadata } from "@/lib/seo";

type SearchParamValue = string | string[] | undefined;

export function generateMetadata({
  searchParams,
}: {
  searchParams: Record<string, SearchParamValue>;
}): Metadata {
  const lang = resolveLang(searchParams.lang);
  const copy = getNeutralManCopy(lang);

  return buildSeoMetadata({
    lang,
    pathname: "/interaktivno/neutralni-covek",
    title: `${copy.gameTitle} | Avangarda`,
    description: copy.seoDescription,
  });
}

export default function NeutralManGamePage({
  searchParams,
}: {
  searchParams: Record<string, SearchParamValue>;
}) {
  const lang = resolveLang(searchParams.lang);
  const t = getDictionary(lang);
  const copy = getNeutralManCopy(lang);

  return (
    <>
      <SiteHeader lang={lang} currentPath="/interaktivno/neutralni-covek" activeNav="news" />

      <main className="site-main">
        <div className="page-shell">
          <section className="panel subpage-hero">
            <span className="eyebrow">{copy.sectionLabel}</span>
            <h1 className={`subpage-hero__title ${styles.pageHeroTitle}`}>{copy.gameTitle}</h1>
            <p className="subpage-hero__copy">{copy.gameSubtitle}</p>
            <div className="info-card__links">
              <a href={withLang("/interaktivno", lang)} className="button-secondary">
                {copy.backLabel}
              </a>
            </div>
          </section>

          <NeutralManGame copy={copy} lang={lang} />

          <section id="sta-se-desilo-neutralni-covek" className={`section-block ${styles.contextSection}`}>
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
                  <p>{card.body}</p>
                </article>
              ))}
            </div>

            <p className={styles.disclaimer}>{copy.disclaimer}</p>
          </section>
        </div>
      </main>

      <SiteFooter lang={lang} t={t} />
    </>
  );
}
