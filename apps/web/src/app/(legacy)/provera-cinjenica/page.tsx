import type { Metadata } from "next";

import { FactCheckSubmissionForm } from "@/components/fact-check-submission-form";
import styles from "@/components/fact-check.module.css";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { factCheckRatings, getFactCheckCopy } from "@/lib/fact-check-copy";
import { fetchFactChecks } from "@/lib/fact-checks";
import { resolveLang, withLang } from "@/lib/i18n";
import { buildPageTitle, buildSeoMetadata } from "@/lib/seo";
import { formatDisplayDate } from "@/lib/strapi";

type Props = { searchParams?: { lang?: string | string[] } };

export function generateMetadata({ searchParams }: Props): Metadata {
  const lang = resolveLang(searchParams?.lang);
  const copy = getFactCheckCopy(lang);
  return buildSeoMetadata({ lang, pathname: "/provera-cinjenica", title: buildPageTitle(copy.title), description: copy.intro });
}

export default async function FactCheckListPage({ searchParams }: Props) {
  const lang = resolveLang(searchParams?.lang);
  const copy = getFactCheckCopy(lang);
  const { checks, available } = await fetchFactChecks(lang);
  return <>
    <SiteHeader lang={lang} currentPath="/provera-cinjenica" activeNav="news" />
    <main className={styles.page}>
      <section className={styles.hero} aria-labelledby="fact-check-title">
        <span className={styles.eyebrow}>Avangarda</span>
        <h1 id="fact-check-title" className={styles.title}>{copy.title}</h1>
        <p className={styles.lead}>{copy.intro}</p>
        <div className={styles.actions}><a href="#submit-claim" className={styles.primary}>{copy.submitTitle}</a><a href="#method" className={styles.link}>{copy.methodTitle}</a></div>
      </section>
      <section className={styles.panel} id="method" aria-labelledby="fact-method-title">
        <h2 id="fact-method-title">{copy.methodTitle}</h2>
        <p>{copy.method}</p>
        <h3>{copy.ratingsTitle}</h3>
        <ul className={styles.ratings}>{factCheckRatings.map((rating) => <li key={rating}><span className={styles.rating} data-rating={rating}>{copy.ratings[rating]}</span></li>)}</ul>
      </section>
      {!available ? <p role="status" className={styles.panel}>{copy.unavailable}</p> : !checks.length ? <p className={styles.panel}>{copy.empty}</p> : null}
      {checks.length > 0 ? <div className={styles.grid}>{checks.map((check) => <article className={styles.card} key={check.id}>
        <span className={styles.rating} data-rating={check.rating}>{copy.ratings[check.rating]}</span>
        <h2 lang={check.canonicalLang} dir={check.canonicalLang === "ar" ? "rtl" : "ltr"}>{check.title}</h2>
        <p lang={check.canonicalLang} dir={check.canonicalLang === "ar" ? "rtl" : "ltr"}>{check.summary}</p>
        <p className={styles.muted}>{copy.checked}: <time dateTime={check.checkedAt}>{formatDisplayDate(check.checkedAt, lang)}</time></p>
        <a className={styles.link} href={withLang(`/provera-cinjenica/${check.slug}`, lang)}>{copy.open}<span className={styles.srOnly}>: {check.title}</span></a>
      </article>)}</div> : null}
      <section id="submit-claim" className={styles.panel} aria-labelledby="fact-submit-title">
        <h2 id="fact-submit-title">{copy.submitTitle}</h2>
        <p>{copy.submitIntro}</p>
        <FactCheckSubmissionForm lang={lang} />
      </section>
    </main>
    <SiteFooter lang={lang} />
  </>;
}
