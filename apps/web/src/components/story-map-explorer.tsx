"use client";

import dynamic from "next/dynamic";
import { startTransition, useCallback, useDeferredValue, useEffect, useId, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type { Lang } from "@/lib/i18n";
import {
  getStoryMapContentCountLabel,
  getStoryMapCountLabel,
  type StoryMapData,
  type StoryMapEntry,
  type StoryMapEntryType,
  type StoryMapLocationGroup,
} from "@/lib/story-map";
import { summarizeMapStories, uniqueMapStories, type StoryMapAuthor } from "@/lib/story-map-markers";
import { activateStoryMapSheet } from "./story-map-sheet-accessibility";
import "./story-map-authors.css";
import styles from "./story-map-explorer.module.css";

const StoryMapLeafletMap = dynamic(
  () => import("@/components/story-map-leaflet-map").then((module) => module.StoryMapLeafletMap),
  { ssr: false }
);

type StoryMapExplorerCopy = {
  label: string;
  title: string;
  searchPlaceholder: string;
  allLocations: string;
  allSections: string;
  allTopics: string;
  allContentLabel: string;
  openStory: string;
  showAllFromLocation: string;
  noStoriesForLocation: string;
  emptyTitle: string;
  emptyCopy: string;
  locationPanelLabel: string;
  mapStageLabel: string;
  filtersLabel: string;
  closeLabel: string;
  textsLabel: string;
  textsOnlyLabel: string;
  documentariesLabel: string;
  documentariesOnlyLabel: string;
  galleriesLabel: string;
  galleriesOnlyLabel: string;
  authorsLabel: string;
  legendLabel: string;
  mixedLabel: string;
  mapLoadingTitle: string;
  mapLoadingCopy: string;
  zoomInLabel: string;
  zoomOutLabel: string;
  resetViewLabel: string;
};

type StoryMapExplorerProps = {
  lang: Lang;
  copy: StoryMapExplorerCopy;
  data: StoryMapData;
  initialQuery?: string;
  initialSection?: string;
  initialTopic?: string;
  initialLocation?: string;
  initialContentType?: string;
};

type ContentFilter = "" | StoryMapEntryType;

function toggleContentFilter(current: ContentFilter, next: StoryMapEntryType): ContentFilter {
  return current === next ? "" : next;
}

function normalizeForSearch(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function matchesLocationQuery(group: StoryMapLocationGroup, normalizedQuery: string) {
  if (!normalizedQuery) return true;

  const haystack = [group.name, group.canonicalName, group.country || "", group.region || ""]
    .map(normalizeForSearch)
    .join(" ");

  return haystack.includes(normalizedQuery);
}

function useCompactViewport() {
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(max-width: 980px)");
    const sync = () => setIsCompact(mediaQuery.matches);

    sync();
    mediaQuery.addEventListener("change", sync);
    return () => mediaQuery.removeEventListener("change", sync);
  }, []);

  return isCompact;
}

function buildLocationSummary(group: StoryMapLocationGroup) {
  return [group.country, group.region].filter(Boolean).join(" / ");
}

function stopSheetEventPropagation(event: { stopPropagation: () => void }) {
  event.stopPropagation();
}

function filterGroupEntries(
  entries: StoryMapEntry[],
  section: string,
  topic: string,
  contentType: ContentFilter
) {
  return entries.filter((entry) => {
    if (section && entry.sectionKey !== section) return false;
    if (topic && !entry.topicSlugs.includes(topic)) return false;
    if (contentType && entry.type !== contentType) return false;
    return true;
  });
}

function buildSearchState(
  lang: Lang,
  query: string,
  section: string,
  topic: string,
  location: string,
  contentType: ContentFilter
) {
  const params = new URLSearchParams();
  params.set("lang", lang);

  if (query.trim()) params.set("q", query.trim());
  if (section) params.set("section", section);
  if (topic) params.set("topic", topic);
  if (location) params.set("location", location);
  if (contentType) params.set("type", contentType);

  return params.toString();
}

function DetailEntries({
  entries,
  copy,
  capped = false,
}: {
  entries: StoryMapEntry[];
  copy: StoryMapExplorerCopy;
  capped?: boolean;
}) {
  return (
    <div className={`story-map-detail__list${capped ? " story-map-detail__list--capped" : ""}`}>
      {entries.map((entry) => (
        <article key={entry.id} className="story-map-detail__entry">
          <div className="story-map-detail__entry-meta">
            <span>{entry.sectionLabel}</span>
            {entry.date ? <span>{entry.date}</span> : null}
          </div>
          {entry.authors.length ? <AuthorLegend authors={entry.authors} label={copy.authorsLabel} /> : null}

          <h3>{entry.title}</h3>

          {entry.topics.length ? (
            <div className="story-map-detail__topics">
              {entry.topics.map((topic) => (
                <span key={`${entry.id}-${topic}`} className="story-map-detail__topic">
                  {topic}
                </span>
              ))}
            </div>
          ) : null}

          <a className="button-secondary story-map-detail__cta" href={entry.href}>
            {copy.openStory}
          </a>
        </article>
      ))}
    </div>
  );
}

function AuthorLegend({ authors, label }: { authors: StoryMapAuthor[]; label: string }) {
  return <ul className="story-map__authors" aria-label={label}>{authors.map((author) => (
    <li key={author.id}><i style={{ backgroundColor: author.color }} aria-hidden="true" /><span>{author.name}</span></li>
  ))}</ul>;
}

export function StoryMapExplorer({
  lang,
  copy,
  data,
  initialQuery = "",
  initialSection = "",
  initialTopic = "",
  initialLocation = "",
  initialContentType = "",
}: StoryMapExplorerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isCompactViewport = useCompactViewport();
  const sheetId = useId();
  const detailDialogRef = useRef<HTMLDivElement>(null);
  const detailCloseRef = useRef<HTMLButtonElement>(null);
  const filterDialogRef = useRef<HTMLDivElement>(null);
  const filterCloseRef = useRef<HTMLButtonElement>(null);
  const [query, setQuery] = useState(initialQuery);
  const [section, setSection] = useState(initialSection);
  const [topic, setTopic] = useState(initialTopic);
  const [contentType, setContentType] = useState<ContentFilter>(
    initialContentType === "article" || initialContentType === "documentary" || initialContentType === "gallery" ? initialContentType : ""
  );
  const [activeLocation, setActiveLocation] = useState(initialLocation);
  const [activeCluster, setActiveCluster] = useState<string[]>([]);
  const [desktopFiltersOpen, setDesktopFiltersOpen] = useState(
    Boolean(initialQuery || initialSection || initialTopic || initialContentType)
  );
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(Boolean(initialLocation));
  const [resetRevision, setResetRevision] = useState(0);
  const deferredQuery = useDeferredValue(query);
  const normalizedQuery = useMemo(() => normalizeForSearch(deferredQuery), [deferredQuery]);

  const filteredGroups = useMemo(() => {
    return data.groups
      .map((group) => {
        const entries = filterGroupEntries(group.entries, section, topic, contentType);

        return {
          ...group,
          entries,
          ...summarizeMapStories(entries),
        };
      })
      .filter((group) => group.totalCount > 0)
      .filter((group) => matchesLocationQuery(group, normalizedQuery));
  }, [contentType, data.groups, normalizedQuery, section, topic]);

  const clusterGroups = activeCluster.length ? filteredGroups.filter((group) => activeCluster.includes(group.slug)) : [];
  const clusterEntries = uniqueMapStories(clusterGroups.flatMap((group) => group.entries));
  const clusterLocationNames = clusterGroups.map((group) => group.name);
  const clusterHeading = clusterLocationNames.slice(0, 3).join(" / ") +
    (clusterLocationNames.length > 3 ? ` +${new Intl.NumberFormat(lang).format(clusterLocationNames.length - 3)}` : "");
  const activeGroup = clusterGroups.length ? {
    ...clusterGroups[0], slug: "", name: clusterHeading,
    entries: clusterEntries, ...summarizeMapStories(clusterEntries),
  } : filteredGroups.find((group) => group.locationSlugs.includes(activeLocation)) || null;
  const locationCount = filteredGroups.length;
  const visibleSummary = summarizeMapStories(filteredGroups.flatMap((group) => group.entries));
  const textCount = visibleSummary.articleCount;
  const documentaryCount = visibleSummary.documentaryCount;
  const galleryCount = visibleSummary.galleryCount;
  const isFiltered = Boolean(normalizedQuery || section || topic || contentType);
  const filterStateKey = `${normalizedQuery}|${section}|${topic}|${contentType}`;
  const featuredLocations = activeGroup?.slug
    ? [activeGroup, ...filteredGroups.filter((group) => group.slug !== activeGroup.slug)].slice(0, 5)
    : filteredGroups.slice(0, 5);
  const urlState = buildSearchState(
    lang,
    query,
    section,
    topic,
    activeGroup?.slug || "",
    contentType
  );
  const detailSheetVisible = isCompactViewport && Boolean(activeGroup) && mobileSheetOpen;
  const filterSheetVisible = isCompactViewport && mobileFiltersOpen;

  useEffect(() => {
    if ((searchParams?.toString() || "") !== urlState) {
      router.replace(`${pathname}?${urlState}`, { scroll: false });
    }
  }, [pathname, router, searchParams, urlState]);

  useEffect(() => {
    if (activeLocation && !activeGroup) {
      setActiveLocation("");
      setMobileSheetOpen(false);
    }
  }, [activeGroup, activeLocation]);

  useEffect(() => {
    if (isCompactViewport) {
      setDesktopFiltersOpen(false);
      return;
    }

    setMobileFiltersOpen(false);
  }, [isCompactViewport]);

  useEffect(() => {
    const dialog = filterSheetVisible ? filterDialogRef.current : detailSheetVisible ? detailDialogRef.current : null;
    const close = filterSheetVisible ? filterCloseRef.current : detailCloseRef.current;
    if (!dialog || !close) return;
    return activateStoryMapSheet(dialog, close, () => {
      setMobileFiltersOpen(false);
      setMobileSheetOpen(false);
    });
    // Depend on visibility, rather than the reconstructed group object, so a
    // harmless render cannot reset focus or the sheet's scroll position.
  }, [detailSheetVisible, filterSheetVisible]);

  const handleActivateLocation = useCallback((slug: string) => {
    startTransition(() => {
      setActiveCluster([]);
      setActiveLocation((current) => (!isCompactViewport && current === slug ? "" : slug));

      if (isCompactViewport) {
        setMobileFiltersOpen(false);
        setMobileSheetOpen(true);
      }
    });
  }, [isCompactViewport]);

  const handleActivateCluster = useCallback((slugs: string[]) => {
    startTransition(() => {
      setActiveLocation("");
      setActiveCluster(slugs);
      if (isCompactViewport) {
        setMobileFiltersOpen(false);
        setMobileSheetOpen(true);
      }
    });
  }, [isCompactViewport]);

  const handleResetFilters = () => {
    startTransition(() => {
      setQuery("");
      setSection("");
      setTopic("");
      setContentType("");
      setActiveLocation("");
      setActiveCluster([]);
      setResetRevision((value) => value + 1);
      setDesktopFiltersOpen(false);
      setMobileSheetOpen(false);
      setMobileFiltersOpen(false);
    });
  };

  const handleResetView = () => {
    startTransition(() => {
      setActiveLocation("");
      setActiveCluster([]);
      setResetRevision((value) => value + 1);
      setMobileSheetOpen(false);
    });
  };

  const handleContentTypeToggle = (next: StoryMapEntryType) => {
    startTransition(() => {
      setContentType((current) => toggleContentFilter(current, next));
      setActiveLocation("");
      setActiveCluster([]);
      if (isCompactViewport) {
        setMobileSheetOpen(false);
      }
    });
  };

  const renderDetailCard = (mobile = false) => {
    if (!activeGroup) {
      return null;
    }

    const entries = activeGroup.entries;

    return (
      <section className="story-map-detail">
        <div className="story-map-detail__head">
          <div>
            <span className="eyebrow">{copy.mapStageLabel}</span>
            <h2 id={mobile ? `${sheetId}-detail-title` : undefined}>{activeGroup.name}</h2>
            {clusterGroups.length ? (
              <details className="story-map-detail__locations">
                <summary>{copy.locationPanelLabel} ({new Intl.NumberFormat(lang).format(clusterGroups.length)})</summary>
                <ul>{clusterLocationNames.map((name, index) => <li key={clusterGroups[index].slug}>{name}</li>)}</ul>
              </details>
            ) : <p className="story-map-detail__summary">{buildLocationSummary(activeGroup)}</p>}
          </div>

          {!mobile ? <button type="button" className="story-map-detail__close" onClick={handleResetView}>
            {copy.closeLabel}
          </button> : null}
        </div>

        <div className="story-map-detail__meta">
          <span className="story-map-detail__count-pill">
            {getStoryMapCountLabel(activeGroup.totalCount, lang)}
          </span>
          {activeGroup.articleCount ? (
            <span className="story-map-detail__meta-badge">
              {getStoryMapContentCountLabel(activeGroup.articleCount, "article", lang)}
            </span>
          ) : null}
          {activeGroup.documentaryCount ? (
            <span className="story-map-detail__meta-badge">
              {getStoryMapContentCountLabel(activeGroup.documentaryCount, "documentary", lang)}
            </span>
          ) : null}
          {activeGroup.galleryCount ? <span className="story-map-detail__meta-badge">{getStoryMapContentCountLabel(activeGroup.galleryCount, "gallery", lang)}</span> : null}
        </div>

        <AuthorLegend authors={activeGroup.authors} label={copy.authorsLabel} />
        <DetailEntries entries={entries} copy={copy} capped={!mobile && entries.length > 3} />

        {activeGroup.slug ? <div className="story-map-detail__footer">
          <a className="button-secondary story-map-detail__all" href={activeGroup.archiveHref}>
            {copy.showAllFromLocation}
          </a>
        </div> : null}
      </section>
    );
  };

  const filtersCard = (
    <div className="story-map__control-card">
      <div className="story-map__control-head">
        <div>
          <span className="eyebrow">{copy.filtersLabel}</span>
          <h2>{copy.locationPanelLabel}</h2>
        </div>

        <div className="story-map__control-actions">
          {isFiltered || activeLocation ? (
            <button type="button" className="button-secondary story-map__reset" onClick={handleResetFilters}>
              {copy.resetViewLabel}
            </button>
          ) : null}

          <button
            type="button"
            className="button-secondary story-map-detail__close story-map-detail__close--panel"
            onClick={() => setDesktopFiltersOpen(false)}
          >
            {copy.closeLabel}
          </button>
        </div>
      </div>

      <div className="story-map__control-body">
        <div className="story-map__filters">
          <label className="story-map__field">
            <span className="story-map__field-label">{copy.searchPlaceholder}</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="story-map__input"
              placeholder={copy.searchPlaceholder}
            />
          </label>

          <label className="story-map__field">
            <span className="story-map__field-label">{copy.allSections}</span>
            <select value={section} onChange={(event) => setSection(event.target.value)} className="story-map__select">
              {data.sections.map((sectionOption) => (
                <option key={sectionOption.key || "all"} value={sectionOption.key}>
                  {sectionOption.label}
                </option>
              ))}
            </select>
          </label>

          <label className="story-map__field">
            <span className="story-map__field-label">{copy.allTopics}</span>
            <select value={topic} onChange={(event) => setTopic(event.target.value)} className="story-map__select">
              {data.topics.map((topicOption) => (
                <option key={topicOption.slug || "all"} value={topicOption.slug}>
                  {topicOption.name}
                </option>
              ))}
            </select>
          </label>

          <div className="story-map__type-switch" role="tablist" aria-label={copy.mapStageLabel}>
            <span className="story-map__field-label story-map__field-label--inline">{copy.allContentLabel}</span>
            <button
              type="button"
              className={`story-map__type-pill${contentType === "" ? " story-map__type-pill--active" : ""}`}
              onClick={() => setContentType("")}
            >
              {copy.allContentLabel}
            </button>
            <button
              type="button"
              className={`story-map__type-pill${contentType === "article" ? " story-map__type-pill--active" : ""}`}
              onClick={() => setContentType("article")}
            >
              {copy.textsOnlyLabel}
            </button>
            <button
              type="button"
              className={`story-map__type-pill${contentType === "documentary" ? " story-map__type-pill--active" : ""}`}
              onClick={() => setContentType("documentary")}
            >
              {copy.documentariesOnlyLabel}
            </button>
            <button type="button" className={`story-map__type-pill${contentType === "gallery" ? " story-map__type-pill--active" : ""}`} onClick={() => setContentType("gallery")}>{copy.galleriesOnlyLabel}</button>
          </div>
        </div>

        <div className="story-map__legend">
          <span>
            {locationCount} {copy.locationPanelLabel}
          </span>
          <span>{getStoryMapContentCountLabel(textCount, "article", lang)}</span>
          <span>{getStoryMapContentCountLabel(documentaryCount, "documentary", lang)}</span>
          {galleryCount ? <span>{getStoryMapContentCountLabel(galleryCount, "gallery", lang)}</span> : null}
        </div>
        <AuthorLegend authors={visibleSummary.authors} label={copy.authorsLabel} />

        <div className="story-map__location-list">
          {featuredLocations.length ? (
            featuredLocations.map((group) => (
              <button
                key={group.slug}
                type="button"
                className={`story-map__location-item${
                  group.slug === activeLocation ? " story-map__location-item--active" : ""
                }`}
                onClick={() => handleActivateLocation(group.slug)}
              >
                <div>
                  <strong>{group.name}</strong>
                  <span>{buildLocationSummary(group) || copy.mapStageLabel}</span>
                </div>

                <span className="story-map__location-count">{group.totalCount}</span>
              </button>
            ))
          ) : (
            <div className="story-map__empty-list">
              <h3>{copy.emptyTitle}</h3>
              <p>{copy.emptyCopy}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <section className="story-map">
      <div className="story-map__map-panel panel">
        <div className="story-map__map-header">
          <div>
            <span className="eyebrow">{copy.mapStageLabel}</span>
            <p className="story-map__map-intro">{copy.searchPlaceholder}</p>
          </div>

          <div className="story-map__content-toggle" role="tablist" aria-label={copy.mapStageLabel}>
            <button
              type="button"
              className={`story-map__legend-chip story-map__legend-toggle${
                contentType === "article" ? " story-map__legend-toggle--active" : ""
              }`}
              aria-pressed={contentType === "article"}
              onClick={() => handleContentTypeToggle("article")}
            >
              <span>{copy.textsLabel}</span>
              <span className="story-map__legend-count">{textCount}</span>
            </button>
            <button
              type="button"
              className={`story-map__legend-chip story-map__legend-chip--documentary story-map__legend-toggle${
                contentType === "documentary" ? " story-map__legend-toggle--active" : ""
              }`}
              aria-pressed={contentType === "documentary"}
              onClick={() => handleContentTypeToggle("documentary")}
            >
              <span>{copy.documentariesLabel}</span>
              <span className="story-map__legend-count">{documentaryCount}</span>
            </button>
            <button type="button" className={`story-map__legend-chip story-map__legend-chip--gallery story-map__legend-toggle${contentType === "gallery" ? " story-map__legend-toggle--active" : ""}`} aria-pressed={contentType === "gallery"} onClick={() => handleContentTypeToggle("gallery")}>
              <span>{copy.galleriesLabel}</span><span className="story-map__legend-count">{galleryCount}</span>
            </button>
          </div>
        </div>

        <div className="story-map__shape-legend" aria-label={copy.legendLabel}>
          <span className="story-map__shape-key"><i className="story-map__shape story-map__shape--article" aria-hidden="true">●</i>{copy.textsLabel}</span>
          <span className="story-map__shape-key"><i className="story-map__shape story-map__shape--documentary" aria-hidden="true">▶</i>{copy.documentariesLabel}</span>
          <span className="story-map__shape-key"><i className="story-map__shape story-map__shape--gallery" aria-hidden="true">▧</i>{copy.galleriesLabel}</span>
          <span className="story-map__shape-key"><i className="story-map__shape story-map__shape--mixed" aria-hidden="true">●▶▧</i>{copy.mixedLabel}</span>
        </div>

        <div className="story-map__viewport">
          <StoryMapLeafletMap
            lang={lang}
            copy={copy}
            groups={filteredGroups}
            activeLocation={activeLocation}
            activeCluster={activeCluster}
            isFiltered={isFiltered}
            filterStateKey={filterStateKey}
            resetRevision={resetRevision}
            onActivateLocation={handleActivateLocation}
            onActivateCluster={handleActivateCluster}
            onResetView={handleResetView}
          />

          <div className="story-map__floating-controls">
            <button
              type="button"
              className={`story-map__filter-trigger${
                desktopFiltersOpen || mobileFiltersOpen ? " story-map__filter-trigger--active" : ""
              }`}
              onClick={() => {
                if (isCompactViewport) {
                  setMobileSheetOpen(false);
                  setMobileFiltersOpen(true);
                  return;
                }

                setDesktopFiltersOpen((current) => !current);
              }}
            >
              {copy.filtersLabel}
            </button>
          </div>

          {!isCompactViewport && desktopFiltersOpen ? (
            <aside className="story-map__control-panel">{filtersCard}</aside>
          ) : null}

          {!isCompactViewport && activeGroup ? (
            <aside className="story-map__detail-panel">{renderDetailCard()}</aside>
          ) : null}

          {!filteredGroups.length ? (
            <div className="story-map__canvas-empty">
              <h3>{copy.emptyTitle}</h3>
              <p>{copy.emptyCopy}</p>
            </div>
          ) : null}
        </div>
      </div>

      {isCompactViewport && mobileFiltersOpen ? (
        <div className="story-map-sheet">
          <button
            type="button"
            className="story-map-sheet__backdrop"
            aria-label={copy.closeLabel}
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div
            className="story-map-sheet__panel"
            ref={filterDialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${sheetId}-filter-title`}
            onPointerDownCapture={stopSheetEventPropagation}
            onTouchStartCapture={stopSheetEventPropagation}
            onTouchMoveCapture={stopSheetEventPropagation}
            onWheelCapture={stopSheetEventPropagation}
          >
            <div className="story-map-sheet__card story-map__filters-sheet">
              <div className="story-map-detail__head">
                <div>
                  <span className="eyebrow">{copy.filtersLabel}</span>
                  <h2 id={`${sheetId}-filter-title`}>{copy.locationPanelLabel}</h2>
                </div>
                <button
                  type="button"
                  ref={filterCloseRef}
                  className="story-map-detail__close"
                  onClick={() => setMobileFiltersOpen(false)}
                >
                  {copy.closeLabel}
                </button>
              </div>

              {filtersCard}
            </div>
          </div>
        </div>
      ) : null}

      {isCompactViewport && activeGroup && mobileSheetOpen ? (
        <div className="story-map-sheet story-map-sheet--detail">
          <button
            type="button"
            className="story-map-sheet__backdrop"
            aria-label={copy.closeLabel}
            onClick={() => {
              setMobileSheetOpen(false);
            }}
          />
          <div
            className={`story-map-sheet__panel ${styles.detailPanel}`}
            ref={detailDialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${sheetId}-detail-title`}
            onPointerDownCapture={stopSheetEventPropagation}
            onTouchStartCapture={stopSheetEventPropagation}
            onTouchMoveCapture={stopSheetEventPropagation}
            onWheelCapture={stopSheetEventPropagation}
          >
            <div className={`story-map-sheet__card story-map__detail-sheet ${styles.detailCard}`}>
              <div className={styles.closeBar}>
                <button ref={detailCloseRef} type="button" className="story-map-detail__close" onClick={() => setMobileSheetOpen(false)}>
                  {copy.closeLabel}
                </button>
              </div>
              {renderDetailCard(true)}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
