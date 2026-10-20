"use client";

import { ARCHIVE_FACETS, type ArchiveFacet, type ArchiveResult, type ArchiveState } from "@/lib/archive-catalogue-state";
import type { ArchiveCopy } from "@/lib/archive-copy";
import type { Lang } from "@/lib/i18n";
import styles from "./archive-catalogue.module.css";

export function archiveFieldLabels(copy: ArchiveCopy): Record<ArchiveFacet | "q" | "sort", string> {
  return { q: copy.searchLabel, section: copy.sectionLabel, topic: copy.topicFilterLabel, author: copy.authorFilterLabel,
    year: copy.yearLabel, style: copy.styleFilterLabel, location: copy.locationFilterLabel, sort: copy.sortLabel };
}

/** Native labelled selects retain touch and keyboard support; the complete
 * selected name remains readable below the control even on a narrow phone. */
export function ArchiveFilterForm({ lang, controls, facets, copy, onChange, onSubmit }: {
  lang: Lang; controls: ArchiveState; facets: ArchiveResult["facets"]; copy: ArchiveCopy;
  onChange: (key: ArchiveFacet | "q" | "sort", value: string) => void; onSubmit: () => void;
}) {
  const labels = archiveFieldLabels(copy);
  return <form action={`/${lang}/archive`} method="get" autoComplete="off" className={`archive-form archive-form--expanded ${styles.form}`}
    onSubmit={(event) => { event.preventDefault(); onSubmit(); }}>
    <label className={styles.field}>
      <span>{labels.q}</span>
      <input className="field archive-form__search" name="q" type="search" value={controls.q} maxLength={200}
        autoComplete="off" spellCheck={false} placeholder={copy.searchPlaceholder} onChange={(event) => onChange("q", event.target.value)} />
    </label>
    {ARCHIVE_FACETS.map((facet) => <label className={styles.field} key={facet}>
      <span>{labels[facet]}</span>
      <select className="select" name={facet} value={controls[facet]} onChange={(event) => onChange(facet, event.target.value)}>
        <option value="">{labels[facet]}</option>
        {facets[facet].map((option) => <option key={option.value} value={option.value}>{option.label} ({option.count})</option>)}
      </select>
      {controls[facet] && <span className={styles.selectedValue}>{facets[facet].find((option) => option.value === controls[facet])?.label || controls[facet]}</span>}
    </label>)}
    <label className={styles.field}>
      <span>{labels.sort}</span>
      <select className="select" name="sort" value={controls.sort} onChange={(event) => onChange("sort", event.target.value)}>
        <option value="newest">{copy.newestLabel}</option><option value="oldest">{copy.oldestLabel}</option>
      </select>
    </label>
    <button className="button-ghost" type="submit">{copy.applyLabel}</button>
  </form>;
}
