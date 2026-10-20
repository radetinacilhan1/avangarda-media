"use client";

import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";
import { ArchiveFilterForm, archiveFieldLabels } from "@/components/archive-filter-form";
import { ARCHIVE_FACETS, archiveHref, archiveQuery, readArchiveState, type ArchiveCard, type ArchiveFacet, type ArchiveResult, type ArchiveState } from "@/lib/archive-catalogue-state";
import type { ArchiveCopy } from "@/lib/archive-copy";
import type { Lang } from "@/lib/i18n";
import styles from "./archive-catalogue.module.css";

type RequestOptions = { changed?: ArchiveFacet; delay?: boolean; history?: "push" | "none"; focusResults?: boolean };
const fill = (template: string, values: Record<string, number>) => template.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ""));
const handleLink = (event: MouseEvent<HTMLAnchorElement>) => event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;

function ArticleCard({ article, copy, spotlight = false }: { article: ArchiveCard; copy: ArchiveCopy; spotlight?: boolean }) {
  return <a href={article.href} className={`panel article-card archive-card${article.imageUrl ? " article-card--media" : ""}${spotlight ? " archive-card--spotlight" : ""}`} data-archive-id={article.id}>
    {article.imageUrl && <div className="article-card__media archive-card__media"><img className="article-card__media-image" src={article.imageUrl} alt={article.title} loading="lazy" /></div>}
    <div className="archive-card__body">
      <div className="article-card__meta">{article.section && <span>{article.section}</span>}{article.date && <span>{article.date}</span>}{article.author && <span>{article.author}</span>}</div>
      <h3 className="article-card__title">{article.title}</h3>
      {article.excerpt && <p className="article-card__subtitle">{article.excerpt}</p>}
      {article.chips.length > 0 && <div className="archive-card__chips">{article.chips.map((chip, index) => <span key={`${index}-${chip}`} className="topic-pill archive-card__chip">{chip}</span>)}</div>}
    </div>
    <span className="button-secondary archive-card__open">{copy.readStory}</span>
  </a>;
}

export function ArchiveCatalogue({ lang, initial, copy }: { lang: Lang; initial: ArchiveResult; copy: ArchiveCopy }) {
  const [data, setData] = useState(initial);
  const [controls, setControls] = useState<ArchiveState>({ ...initial.filters, page: initial.page });
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);
  const sequence = useRef(0);
  const controller = useRef<AbortController | null>(null);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const current = useRef(controls);
  const retryOptions = useRef<RequestOptions>({});
  const resultStart = useRef<HTMLDivElement>(null);
  const labels = archiveFieldLabels(copy);

  const request = useCallback((next: ArchiveState, options: RequestOptions = {}) => {
    const id = ++sequence.current;
    controller.current?.abort();
    if (debounce.current) clearTimeout(debounce.current);
    current.current = next; retryOptions.current = { ...options, delay: false };
    setControls(next); setPending(true); setFailed(false);
    const run = async () => {
      const abort = new AbortController(); controller.current = abort;
      const query = new URLSearchParams(archiveQuery(next)); query.set("lang", lang);
      if (options.changed) query.set("changed", options.changed);
      try {
        const response = await fetch(`/api/archive-catalogue?${query}`, { signal: abort.signal, cache: "no-store" });
        if (!response.ok) throw new Error("Archive unavailable");
        const result = await response.json() as ArchiveResult;
        if (id !== sequence.current || abort.signal.aborted) return;
        const normalized = { ...result.filters, page: result.page };
        // Keep editing whitespace after a debounce pause while normalizing URL.
        const editing = { ...normalized, q: next.q };
        setData(result); setControls(editing); current.current = editing;
        const href = archiveHref(lang, normalized);
        if (window.location.pathname + window.location.search !== href) {
          if (options.history === "none") window.history.replaceState(null, "", href);
          else window.history.pushState(null, "", href);
        }
        // Filters preserve scroll. Only an explicit page link moves to results.
        if (options.focusResults) { resultStart.current?.focus({ preventScroll: true }); resultStart.current?.scrollIntoView({ block: "start", behavior: "instant" }); }
      } catch {
        if (id === sequence.current && !abort.signal.aborted) setFailed(true);
      } finally { if (id === sequence.current) setPending(false); }
    };
    if (options.delay) debounce.current = setTimeout(run, 320); else void run();
  }, [lang]);

  useEffect(() => {
    const initialControls = { ...initial.filters, page: initial.page };
    setData(initial); setControls(initialControls); current.current = initialControls; setPending(false); setFailed(false);
    const href = archiveHref(lang, initialControls);
    if (window.location.pathname + window.location.search !== href) window.history.replaceState(null, "", href);
    const onPop = () => request(readArchiveState(new URLSearchParams(window.location.search)), { history: "none" });
    window.addEventListener("popstate", onPop);
    return () => { window.removeEventListener("popstate", onPop); ++sequence.current; controller.current?.abort(); if (debounce.current) clearTimeout(debounce.current); };
  }, [initial, lang, request]);

  function change(key: ArchiveFacet | "q" | "sort", value: string) {
    request({ ...current.current, [key]: value, page: 1 }, { changed: ARCHIVE_FACETS.includes(key as ArchiveFacet) ? key as ArchiveFacet : undefined, delay: key === "q" });
  }
  function follow(event: MouseEvent<HTMLAnchorElement>, next: ArchiveState, options: RequestOptions = {}) {
    if (!handleLink(event)) return; event.preventDefault(); request(next, options);
  }
  function pageLink(event: MouseEvent<HTMLAnchorElement>, page: number) {
    if (!handleLink(event)) return;
    if (pending) { event.preventDefault(); return; }
    follow(event, { ...current.current, page }, { focusResults: true });
  }
  const applied = { ...data.filters, page: data.page };
  const empty = { q: "", section: "", topic: "", author: "", year: "", style: "", location: "", sort: controls.sort, page: 1 } as ArchiveState;
  const active = data.active.length > 0 || ["q", ...ARCHIVE_FACETS].some((key) => controls[key]);
  const visiblePages = [...new Set([1, data.pageCount, data.page - 1, data.page, data.page + 1])].filter((page) => page >= 1 && page <= data.pageCount).sort((left, right) => left - right);

  return <section className={`archive-layout ${styles.catalogue}`}>
    <div className="archive-layout__main">
      <section className="panel info-card archive-filters">
        <div className="archive-filters__topline"><div><span className="eyebrow">{copy.filtersLabel}</span><h2>{copy.filterTitle}</h2></div>
          {active && <a className="button-secondary archive-filters__reset" href={archiveHref(lang, empty)} onClick={(event) => follow(event, empty)}>{copy.clearFilters}</a>}
        </div>
        <ArchiveFilterForm lang={lang} controls={controls} facets={data.facets} copy={copy} onChange={change} onSubmit={() => request({ ...current.current, page: 1 })} />
        {data.active.length > 0 && <div className={styles.active} aria-label={copy.active}><strong>{copy.active}</strong>
          {data.active.map((filter) => <a key={filter.key} className={styles.chip} href={archiveHref(lang, { ...applied, [filter.key]: "", page: 1 })}
            aria-label={`${copy.remove}: ${labels[filter.key]} — ${filter.label}`} onClick={(event) => follow(event, { ...current.current, [filter.key]: "", page: 1 })}>
            <span>{labels[filter.key]}: {filter.label}</span><span aria-hidden="true">×</span></a>)}
        </div>}
        <div className={styles.status} aria-live="polite" aria-atomic="true">
          {data.cleared.length > 0 && <p>{copy.cleared} {data.cleared.map((facet) => labels[facet]).join(", ")}</p>}
          {pending ? <p>{copy.loading}</p> : failed ? <p role="alert">{copy.error} <button type="button" className={styles.retry} onClick={() => request(current.current, retryOptions.current)}>{copy.retry}</button></p> : null}
        </div>
      </section>

      <div className={styles.resultGroup} aria-busy={pending}>
        {data.featured.length > 0 && <section className="archive-spotlight"><div className="section-header"><h2 className="section-title">{copy.highlightedLabel}</h2></div>
          <div className="archive-spotlight__grid">{data.featured.map((article) => <ArticleCard key={article.id} article={article} copy={copy} spotlight />)}</div>
        </section>}
        <section className="section-block archive-results">
          <div className={`section-header ${styles.summary}`} ref={resultStart} tabIndex={-1}><div><span className="eyebrow">{copy.searchResults}</span><h2 className="section-title">{fill(copy.results, { total: data.total })}</h2></div><span>{fill(copy.range, { from: data.from, to: data.to, total: data.total })}</span></div>
          {data.items.length > 0 ? <div className="page-grid archive-grid">{data.items.map((article) => <ArticleCard key={article.id} article={article} copy={copy} />)}</div> : <div className="panel empty-state"><h3>{copy.emptyTitle}</h3><p>{copy.emptyCopy}</p></div>}
          {data.pageCount > 1 && <nav className={styles.pagination} aria-label={copy.pagination}><p>{fill(copy.page, { page: data.page, pages: data.pageCount })}</p><div className={styles.pageLinks}>
            {data.page > 1 && <a className="button-secondary" rel="prev" aria-disabled={pending || undefined} href={archiveHref(lang, { ...applied, page: data.page - 1 })} onClick={(event) => pageLink(event, data.page - 1)}>{copy.prevLabel}</a>}
            {visiblePages.map((page, index) => <span key={page} className={styles.pageSlot}>{index > 0 && page - visiblePages[index - 1] > 1 && <span aria-hidden="true">…</span>}<a className={styles.pageLink} href={archiveHref(lang, { ...applied, page })} aria-current={page === data.page ? "page" : undefined} aria-disabled={pending || undefined} onClick={(event) => pageLink(event, page)}>{page}</a></span>)}
            {data.page < data.pageCount && <a className="button-secondary" rel="next" aria-disabled={pending || undefined} href={archiveHref(lang, { ...applied, page: data.page + 1 })} onClick={(event) => pageLink(event, data.page + 1)}>{copy.nextLabel}</a>}
          </div></nav>}
        </section>
      </div>
    </div>
    <aside className="archive-layout__side"><section className="panel homepage-sidebar__panel archive-sidebar"><div className="homepage-sidebar__heading"><span className="eyebrow">{copy.themesLabel}</span></div><p className="archive-sidebar__copy">{copy.themesCopy}</p><div className="topic-list archive-sidebar__topics">
      {data.facets.topic.slice(0, 6).map((topic) => <a key={topic.value} href={archiveHref(lang, { ...applied, topic: topic.value, page: 1 })} className="topic-pill" onClick={(event) => follow(event, { ...current.current, topic: topic.value, page: 1 }, { changed: "topic" })}>{topic.label}</a>)}
    </div></section></aside>
  </section>;
}
