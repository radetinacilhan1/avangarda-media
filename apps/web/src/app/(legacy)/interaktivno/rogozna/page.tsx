import type { Metadata } from "next";

import { RogoznaGame } from "@/components/rogozna-game";
import styles from "@/components/rogozna-game.module.css";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getDictionary, resolveLang, withLang } from "@/lib/i18n";
import { getRogoznaCopy } from "@/lib/rogozna-interactive";
import { buildSeoMetadata } from "@/lib/seo";

type SearchParamValue = string | string[] | undefined;

export function generateMetadata({
  searchParams,
}: {
  searchParams: Record<string, SearchParamValue>;
}): Metadata {
  const lang = resolveLang(searchParams.lang);
  const copy = getRogoznaCopy(lang);

  return buildSeoMetadata({
    lang,
    pathname: "/interaktivno/rogozna",
    title: `${copy.gameTitle} | Avangarda`,
    description: copy.seoDescription,
  });
}

export default function RogoznaGamePage({
  searchParams,
}: {
  searchParams: Record<string, SearchParamValue>;
}) {
  const lang = resolveLang(searchParams.lang);
  const t = getDictionary(lang);
  const copy = getRogoznaCopy(lang);

  return (
    <>
      <SiteHeader lang={lang} currentPath="/interaktivno/rogozna" activeNav="news" />

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

          <RogoznaGame copy={copy} />

          <section id="sta-se-desilo-rogozna" className={`section-block ${styles.contextSection}`}>
            <div className="section-header">
              <div>
                <span className="eyebrow">{copy.contextEyebrow}</span>
                <h2 className="section-title">{copy.contextTitle}</h2>
                <p className="section-copy" dir={copy.languageNotice ? "ltr" : undefined} lang={copy.languageNotice ? "en" : undefined}>{copy.contextIntro}</p>
              </div>
            </div>

            <div className={styles.contextGrid}>
              {copy.contextCards.map((card, index) => (
                <article className={`panel info-card ${styles.contextCard}`} key={card.title}>
                  <span className="eyebrow">0{index + 1}</span>
                  <h3 dir={copy.languageNotice ? "ltr" : undefined} lang={copy.languageNotice ? "en" : undefined}>{card.title}</h3>
                  <p dir={copy.languageNotice ? "ltr" : undefined} lang={copy.languageNotice ? "en" : undefined}>{card.copy}</p>
                </article>
              ))}
            </div>

            <p className={styles.inspiration} dir={copy.languageNotice ? "ltr" : undefined} lang={copy.languageNotice ? "en" : undefined}>{copy.inspiration}</p>
          </section>
        </div>
      </main>

      <SiteFooter lang={lang} t={t} />
    </>
  );
}
