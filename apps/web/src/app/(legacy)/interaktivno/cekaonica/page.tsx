import type { Metadata } from "next";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { WaitingRoomGame } from "@/components/waiting-room-game";
import styles from "@/components/waiting-room-game.module.css";
import { getDictionary, resolveLang, withLang } from "@/lib/i18n";
import { buildSeoMetadata } from "@/lib/seo";
import { getWaitingRoomCopy } from "@/lib/waiting-room-interactive";

type SearchParamValue = string | string[] | undefined;

export function generateMetadata({
  searchParams,
}: {
  searchParams: Record<string, SearchParamValue>;
}): Metadata {
  const lang = resolveLang(searchParams.lang);
  const copy = getWaitingRoomCopy(lang);

  return buildSeoMetadata({
    lang,
    pathname: "/interaktivno/cekaonica",
    title: `${copy.gameTitle} | Avangarda`,
    description: copy.seoDescription,
  });
}

export default function WaitingRoomGamePage({
  searchParams,
}: {
  searchParams: Record<string, SearchParamValue>;
}) {
  const lang = resolveLang(searchParams.lang);
  const t = getDictionary(lang);
  const copy = getWaitingRoomCopy(lang);

  return (
    <>
      <SiteHeader lang={lang} currentPath="/interaktivno/cekaonica" activeNav="news" />

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

          <WaitingRoomGame copy={copy} />

          <section id="sta-se-desilo-cekaonica" className={`section-block ${styles.contextSection}`}>
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

            <p className={styles.disclaimer}>{copy.disclaimer}</p>
          </section>
        </div>
      </main>

      <SiteFooter lang={lang} t={t} />
    </>
  );
}
