"use client";

import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";
import type { Lang } from "@/lib/i18n";
import type { HumanRightsCopy } from "@/lib/human-rights";
import type { LegalCatalogueCopy } from "@/lib/legal-catalogue-copy";
import {
  LEGAL_FACETS, legalCatalogueHref, legalCatalogueQuery, readLegalCatalogueState,
  type LegalCatalogueResult, type LegalCatalogueState, type LegalFacet,
} from "@/lib/legal-catalogue";
import styles from "./legal-catalogue.module.css";

type Copy = Pick<HumanRightsCopy, "searchResourcesLabel" | "searchResourcesPlaceholder" | "resourceTypeLabel" | "legalAreaLabel" |
  "frameworkLabel" | "connectedRightsLabel" | "allTypesLabel" | "allAreasLabel" | "allFrameworksLabel" | "allRightsLabel" |
  "clearFiltersLabel" | "openResourceLabel" | "noResultsTitle" | "noResultsCopy">;
type RequestOptions = {
  changed?: LegalFacet; delay?: boolean; history?: "push" | "replace" | "none"; focusResults?: boolean;
};

function fill(template: string, values: Record<string, number>) {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ""));
}

function shouldHandle(event: MouseEvent<HTMLAnchorElement>) {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}

export function LegalCatalogue({ lang, initial, copy, catalogueCopy }: {
  lang: Lang; initial: LegalCatalogueResult; copy: Copy; catalogueCopy: LegalCatalogueCopy;
}) {
  const [data, setData] = useState(initial);
  const [controls, setControls] = useState<LegalCatalogueState>({ ...initial.filters, page: initial.page });
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);
  const sequence = useRef(0);
  const controller = useRef<AbortController | null>(null);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentControls = useRef(controls);
  const retryOptions = useRef<RequestOptions>({});
  const resultStart = useRef<HTMLDivElement>(null);
  const fieldLabels: Record<LegalFacet | "q", string> = {
    q: copy.searchResourcesLabel, type: copy.resourceTypeLabel, area: copy.legalAreaLabel,
    framework: copy.frameworkLabel, right: copy.connectedRightsLabel,
  };
  const allLabels: Record<LegalFacet, string> = {
    type: copy.allTypesLabel, area: copy.allAreasLabel, framework: copy.allFrameworksLabel, right: copy.allRightsLabel,
  };

  const request = useCallback((next: LegalCatalogueState, options: RequestOptions = {}) => {
    // Invalidate immediately, including the debounce window, so a slow previous
    // response cannot replace a newer keystroke, selection or Back navigation.
    const requestId = ++sequence.current;
    controller.current?.abort();
    if (debounce.current) clearTimeout(debounce.current);
    currentControls.current = next;
    retryOptions.current = { ...options, delay: false };
    setControls(next);
    setPending(true);
    setFailed(false);
    const run = async () => {
      const abortController = new AbortController();
      controller.current = abortController;
      const query = new URLSearchParams(legalCatalogueQuery(next));
      query.set("lang", lang);
      if (options.changed) query.set("changed", options.changed);
      try {
        const response = await fetch(`/api/legal-catalogue?${query}`, { signal: abortController.signal, cache: "no-store" });
        if (!response.ok) throw new Error("Catalogue unavailable");
        const result = await response.json() as LegalCatalogueResult;
        if (requestId !== sequence.current || abortController.signal.aborted) return;
        const normalized = { ...result.filters, page: result.page };
        // Normalize the applied query/URL, but keep the user's current editing
        // whitespace. A debounce pause after a word must not eat its separator.
        const nextControls = { ...normalized, q: next.q };
        setData(result);
        setControls(nextControls);
        currentControls.current = nextControls;
        const href = legalCatalogueHref(lang, normalized);
        const currentHref = window.location.pathname + window.location.search;
        if (href !== currentHref) {
          if (options.history === "none" || options.history === "replace") window.history.replaceState(null, "", href);
          else window.history.pushState(null, "", href);
        }
        if (options.focusResults) {
          resultStart.current?.focus({ preventScroll: true });
          resultStart.current?.scrollIntoView({ block: "start", behavior: "instant" });
        }
      } catch (error) {
        if (requestId === sequence.current && !abortController.signal.aborted) setFailed(true);
      } finally {
        if (requestId === sequence.current) setPending(false);
      }
    };
    if (options.delay) debounce.current = setTimeout(run, 320);
    else void run();
  }, [lang]);

  useEffect(() => {
    const initialControls = { ...initial.filters, page: initial.page };
    setData(initial);
    setControls(initialControls);
    currentControls.current = initialControls;
    setPending(false);
    setFailed(false);
    const normalizedHref = legalCatalogueHref(lang, initialControls);
    if (window.location.pathname + window.location.search !== normalizedHref) window.history.replaceState(null, "", normalizedHref);
    const onPopState = () => request(readLegalCatalogueState(new URLSearchParams(window.location.search)), { history: "none" });
    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("popstate", onPopState);
      ++sequence.current;
      controller.current?.abort();
      if (debounce.current) clearTimeout(debounce.current);
    };
  }, [initial, lang, request]);

  function changeFilter(key: LegalFacet | "q", value: string) {
    request({ ...currentControls.current, [key]: value, page: 1 }, { changed: key === "q" ? undefined : key, delay: key === "q" });
  }

  function follow(event: MouseEvent<HTMLAnchorElement>, next: LegalCatalogueState, focusResults = false) {
    if (!shouldHandle(event)) return;
    event.preventDefault();
    request(next, { focusResults });
  }

  function followPage(event: MouseEvent<HTMLAnchorElement>, page: number) {
    if (!shouldHandle(event)) return;
    // These links describe the last settled result set. Let the latest search
    // or facet request settle before navigating it, without losing that intent.
    if (pending) { event.preventDefault(); return; }
    follow(event, { ...currentControls.current, page }, true);
  }

  function removeFilter(event: MouseEvent<HTMLAnchorElement>, key: LegalFacet | "q") {
    follow(event, { ...currentControls.current, [key]: "", page: 1 });
  }

  const appliedState = { ...data.filters, page: data.page };
  const visiblePages = [...new Set([1, data.pageCount, data.page - 2, data.page - 1, data.page, data.page + 1, data.page + 2])]
    .filter((page) => page >= 1 && page <= data.pageCount).sort((left, right) => left - right);

  return (
    <div className={styles.catalogue}>
      <form action={`/${lang}/pravni-kompas`} method="get" className={`panel resource-hub__filter-panel ${styles.form}`}
        onSubmit={(event) => { event.preventDefault(); request({ ...currentControls.current, page: 1 }); }}>
        <div className={`resource-hub__filter-grid ${styles.filters}`}>
          <label className="resource-hub__field">
            <span>{copy.searchResourcesLabel}</span>
            <input type="search" name="q" value={controls.q} maxLength={200} placeholder={copy.searchResourcesPlaceholder}
              className="resource-hub__input" onChange={(event) => changeFilter("q", event.target.value)} />
          </label>
          {LEGAL_FACETS.map((facet) => (
            <label className="resource-hub__field" key={facet}>
              <span>{fieldLabels[facet]}</span>
              <select name={facet} value={controls[facet]} className="resource-hub__select"
                onChange={(event) => changeFilter(facet, event.target.value)}>
                <option value="">{allLabels[facet]}</option>
                {data.facets[facet].map((option) => <option key={option.value} value={option.value}>{option.label} ({option.count})</option>)}
              </select>
            </label>
          ))}
        </div>
        <div className="resource-hub__filter-actions">
          <button type="submit" className="button-secondary">{copy.searchResourcesLabel}</button>
          {(data.active.length > 0 || ["q", ...LEGAL_FACETS].some((key) => controls[key])) && <a href={`/${lang}/pravni-kompas`} className="button-secondary"
            onClick={(event) => follow(event, { q: "", type: "", area: "", framework: "", right: "", page: 1 })}>{copy.clearFiltersLabel}</a>}
        </div>
      </form>

      {data.active.length > 0 && <div className={styles.active} aria-label={catalogueCopy.active}>
        <span className={styles.activeLabel}>{catalogueCopy.active}</span>
        {data.active.map((filter) => {
          const next = { ...appliedState, [filter.key]: "", page: 1 };
          return <a href={legalCatalogueHref(lang, next)} key={filter.key} className={styles.chip}
            aria-label={`${catalogueCopy.remove}: ${fieldLabels[filter.key]} — ${filter.label}`}
            onClick={(event) => removeFilter(event, filter.key)}><span>{fieldLabels[filter.key]}: {filter.label}</span><span aria-hidden="true">×</span></a>;
        })}
      </div>}

      <div className={styles.status} aria-live="polite" aria-atomic="true">
        {data.cleared.length > 0 && <p>{catalogueCopy.cleared} {data.cleared.map((facet) => fieldLabels[facet]).join(", ")}</p>}
        {pending ? <p>{catalogueCopy.loading}</p> : failed ? <p role="alert">{catalogueCopy.error} <button type="button" className={styles.retry}
          onClick={() => request(currentControls.current, retryOptions.current)}>{catalogueCopy.retry}</button></p> : null}
      </div>

      <div className={styles.summary} ref={resultStart} tabIndex={-1}>
        <strong>{fill(catalogueCopy.results, { total: data.total })}</strong>
        <span>{fill(catalogueCopy.range, { from: data.from, to: data.to, total: data.total })}</span>
      </div>
      <div aria-busy={pending} className={styles.results}>
        {data.items.length ? <div className={`resource-hub__resource-grid ${styles.grid}`}>
          {data.items.map((resource) => <article key={resource.slug} className={`panel resource-hub__resource-card ${styles.card}`}>
            <div className="resource-hub__resource-meta">
              <span className="topic-pill">{resource.typeLabel}</span><span className="topic-pill">{resource.frameworkLabel}</span>
            </div>
            <h3 className={`resource-hub__card-title ${styles.title}`}><a href={resource.href}>{resource.title}</a></h3>
            {resource.shortDescription && <p className={`resource-hub__card-copy ${styles.description}`}>{resource.shortDescription}</p>}
            <div className="resource-hub__resource-actions"><a href={resource.href} className="button-secondary">{copy.openResourceLabel}</a></div>
          </article>)}
        </div> : <div className="panel empty-state resource-hub__empty"><h3>{copy.noResultsTitle}</h3><p>{copy.noResultsCopy}</p></div>}
      </div>

      <nav className={styles.pagination} aria-label={catalogueCopy.pagination}>
        <p>{fill(catalogueCopy.page, { page: data.page, pages: data.pageCount })}</p>
        <div className={styles.pageLinks}>
          {data.page > 1 && <a className="button-secondary" rel="prev" aria-disabled={pending || undefined} href={legalCatalogueHref(lang, { ...appliedState, page: data.page - 1 })}
            onClick={(event) => followPage(event, data.page - 1)}>{catalogueCopy.previous}</a>}
          {visiblePages.map((page, index) => <span key={page} className={styles.pageSlot}>
            {index > 0 && page - visiblePages[index - 1] > 1 && <span aria-hidden="true">…</span>}
            <a className={styles.pageLink} aria-current={page === data.page ? "page" : undefined} aria-disabled={pending || undefined} href={legalCatalogueHref(lang, { ...appliedState, page })}
              aria-label={fill(catalogueCopy.page, { page, pages: data.pageCount })}
              onClick={(event) => followPage(event, page)}>{page}</a>
          </span>)}
          {data.page < data.pageCount && <a className="button-secondary" rel="next" aria-disabled={pending || undefined} href={legalCatalogueHref(lang, { ...appliedState, page: data.page + 1 })}
            onClick={(event) => followPage(event, data.page + 1)}>{catalogueCopy.next}</a>}
        </div>
      </nav>
    </div>
  );
}
