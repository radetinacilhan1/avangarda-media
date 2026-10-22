import type { Metadata } from "next";
import { notFound } from "next/navigation";

import styles from "@/components/fact-check.module.css";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getFactCheckCopy } from "@/lib/fact-check-copy";
import { fetchFactCheck } from "@/lib/fact-checks";
import { resolveLang, withLang } from "@/lib/i18n";
import { getRichTextHtml } from "@/lib/richtext";
import { buildPageTitle, buildSeoMetadata } from "@/lib/seo";
import { formatDisplayDate } from "@/lib/strapi";

type Props = { params: { slug: string }; searchParams?: { lang?: string | string[] } };

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const lang = resolveLang(searchParams?.lang);
  const check = await fetchFactCheck(params.slug, lang);
  if (!check) notFound();
  return buildSeoMetadata({ lang, pathname: `/provera-cinjenica/${check.slug}`, title: buildPageTitle(check.title), description: check.summary, availableLanguages: check.availableLanguages, canonicalLang: check.canonicalLang });
}

export default async function FactCheckDetailPage({ params, searchParams }: Props) {
  const lang = resolveLang(searchParams?.lang);
  const copy = getFactCheckCopy(lang);
  const check = await fetchFactCheck(params.slug, lang);
  if (!check) notFound();
  const date = (value: string) => <time dateTime={value}>{formatDisplayDate(value, lang)}</time>;
  const contentLanguage = check.canonicalLang;
  const contentDirection = contentLanguage === "ar" ? "rtl" : "ltr";
  return <>
    <SiteHeader lang={lang} currentPath={`/provera-cinjenica/${check.slug}`} activeNav="news" />
    <main className={styles.page}>
      <a href={withLang("/provera-cinjenica", lang)} className={styles.link}>{copy.back}</a>
      {check.canonicalLang !== lang ? <p role="note" className={styles.muted}>{copy.fallback}</p> : null}
      <article>
        <header className={styles.hero}>
          <p className={styles.eyebrow}>{copy.title}</p>
          <span className={styles.rating} data-rating={check.rating}>{copy.ratings[check.rating]}</span>
          <h1 className={styles.title} lang={contentLanguage} dir={contentDirection}>{check.title}</h1>
          <p className={`${styles.lead} ${styles.prose}`} lang={contentLanguage} dir={contentDirection}>{check.claim}</p>
          <dl className={styles.meta}>
            {check.claimant ? <div><dt>{copy.claimant}</dt><dd>{check.claimant}</dd></div> : null}
            {check.claimDate ? <div><dt>{copy.claimDate}</dt><dd>{date(check.claimDate)}</dd></div> : null}
            {check.sourceUrl ? <div><dt>{copy.originalSource}</dt><dd><a href={check.sourceUrl} rel="noreferrer">{check.sourceUrl}</a></dd></div> : null}
            <div><dt>{copy.responsible}</dt><dd>{check.responsiblePerson}</dd></div>
            <div><dt>{copy.checked}</dt><dd>{date(check.checkedAt)}</dd></div>
            {check.updatedAt ? <div><dt>{copy.updated}</dt><dd>{date(check.updatedAt)}</dd></div> : null}
          </dl>
        </header>
        <section className={styles.panel} aria-labelledby="fact-context">
          <h2 id="fact-context">{copy.context}</h2>
          <p className={styles.prose} lang={contentLanguage} dir={contentDirection}><strong>{check.summary}</strong></p>
          <div className={styles.context} lang={contentLanguage} dir={contentDirection} dangerouslySetInnerHTML={{ __html: getRichTextHtml(check.context, { lang: contentLanguage, imageCredits: [], bodyImages: [] }) }} />
        </section>
        <section className={styles.panel} aria-labelledby="fact-sources">
          <h2 id="fact-sources">{copy.sources}</h2>
          <ol className={styles.sourceList}>{check.sources.map((source, index) => <li key={`${source.url}-${index}`}><a href={source.url} rel="noreferrer">{source.name}</a><br /><span className={styles.muted} dir="ltr">{source.url}</span>{source.accessedAt ? <p className={styles.muted}>{copy.accessed}: {date(source.accessedAt)}</p> : null}</li>)}</ol>
        </section>
        <section className={styles.panel} aria-labelledby="fact-corrections">
          <h2 id="fact-corrections">{copy.corrections}</h2>
          {check.corrections.length ? <ol className={styles.sourceList}>{check.corrections.map((entry, index) => <li key={`${entry.date}-${index}`}>{entry.date ? date(entry.date) : null}<p className={styles.prose} lang={contentLanguage} dir={contentDirection}>{entry.note}</p></li>)}</ol> : <p>{copy.noCorrections}</p>}
        </section>
        <section className={styles.panel} aria-labelledby="detail-method"><h2 id="detail-method">{copy.methodTitle}</h2><p>{copy.method}</p></section>
      </article>
    </main>
    <SiteFooter lang={lang} />
  </>;
}
