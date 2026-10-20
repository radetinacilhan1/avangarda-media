import type { Metadata } from "next";
import { IntroMotifs } from "@/components/intro-motifs";
import { ArchiveCatalogue } from "@/components/archive-catalogue";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { buildArchiveCatalogue } from "@/lib/archive-catalogue";
import { readArchiveState } from "@/lib/archive-catalogue-state";
import { getArchiveCopy } from "@/lib/archive-copy";
import { fetchArchiveArticles } from "@/lib/archive-source";
import { getDictionary, resolveLang } from "@/lib/i18n";
import { buildPageTitle, buildSeoMetadata } from "@/lib/seo";
import styles from "./archive.module.css";

type SearchParamValue = string | string[] | undefined;
type SearchParams = Record<string, SearchParamValue>;

export function generateMetadata({ searchParams }: { searchParams: SearchParams }): Metadata {
  const lang = resolveLang(searchParams.lang);
  const t = getDictionary(lang);
  return buildSeoMetadata({ lang, pathname: "/archive", title: buildPageTitle(t.archiveTitlePage), description: t.archiveCopy });
}

export default async function ArchivePage({ searchParams }: { searchParams: SearchParams }) {
  const lang = resolveLang(searchParams.lang);
  const t = getDictionary(lang);
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    const first = Array.isArray(value) ? value[0] : value;
    if (first) params.set(key, first);
  }
  const state = readArchiveState(params);
  const articles = await fetchArchiveArticles(lang, Boolean(state.q));
  const initial = buildArchiveCatalogue(articles, lang, state);
  const copy = getArchiveCopy(lang);
  return <>
    <SiteHeader lang={lang} currentPath="/archive" activeNav="archive" />
    <main className="site-main"><div className={`page-shell ${styles.archive}`}>
      <section className="panel subpage-hero archive-hero reader-page-intro has-intro-motifs">
        <IntroMotifs kind="archive" />
        <h1 className="subpage-hero__title">{copy.archiveLabel}</h1>
        <p className="subpage-hero__copy">{copy.archiveIntro}</p>
      </section>
      <ArchiveCatalogue lang={lang} initial={initial} copy={copy} />
    </div></main>
    <SiteFooter lang={lang} t={t} />
  </>;
}
