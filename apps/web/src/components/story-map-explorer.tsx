"use client";

import dynamic from "next/dynamic";
import { startTransition, useDeferredValue, useEffect, useMemo, useState } from "react";
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
            {entry.author ? <span>{entry.author}</span> : null}
          </div>

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
  const [query, setQuery] = useState(initialQuery);
  const [section, setSection] = useState(initialSection);
  const [topic, setTopic] = useState(initialTopic);
  const [contentType, setContentType] = useState<ContentFilter>(
    initialContentType === "article" || initialContentType === "documentary" ? initialContentType : ""
  );
  const [activeLocation, setActiveLocation] = useState(initialLocation);
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
        const articleCount = entries.filter((entry) => entry.type === "article").length;
        const documentaryCount = entries.filter((entry) => entry.type === "documentary").length;

        return {
          ...group,
          entries,
          totalCount: entries.length,
          articleCount,
          documentaryCount,
        };
      })
      .filter((group) => group.totalCount > 0)
      .filter((group) => matchesLocationQuery(group, normalizedQuery));
  }, [contentType, data.groups, normalizedQuery, section, topic]);

  const activeGroup = filteredGroups.find((group) => group.slug === activeLocation) || null;
  const locationCount = filteredGroups.length;
  const textCount = filteredGroups.reduce((sum, group) => sum + group.articleCount, 0);
  const documentaryCount = filteredGroups.reduce((sum, group) => sum + group.documentaryCount, 0);
  const isFiltered = Boolean(normalizedQuery || section || topic || contentType);
  const filterStateKey = `${normalizedQuery}|${section}|${topic}|${contentType}`;
  const featuredLocations = activeGroup
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

  useEffect(() => {
    if (searchParams.toString() !== urlState) {
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
    if (typeof document === "undefined" || !isCompactViewport) {
      return;
    }

    const shouldLockPageScroll = mobileFiltersOpen || (Boolean(activeGroup) && mobileSheetOpen);
    if (!shouldLockPageScroll) {
      return;
    }

    const { body, documentElement } = document;
    const previousBodyOverflow = body.style.overflow;
    const previousBodyOverscroll = body.style.overscrollBehavior;
    const previousHtmlOverflow = documentElement.style.overflow;
    const previousHtmlOverscroll = documentElement.style.overscrollBehavior;

    body.style.overflow = "hidden";
    body.style.overscrollBehavior = "contain";
    documentElement.style.overflow = "hidden";
    documentElement.style.overscrollBehavior = "contain";

    return () => {
      body.style.overflow = previousBodyOverflow;
      body.style.overscrollBehavior = previousBodyOverscroll;
      documentElement.style.overflow = previousHtmlOverflow;
      documentElement.style.overscrollBehavior = previousHtmlOverscroll;
    };
  }, [activeGroup, isCompactViewport, mobileFiltersOpen, mobileSheetOpen]);

  const handleActivateLocation = (slug: string) => {
    startTransition(() => {
      setActiveLocation((current) => (current === slug ? "" : slug));

      if (isCompactViewport) {
        setMobileFiltersOpen(false);
        setMobileSheetOpen(true);
      }
    });
  };

  const handleResetFilters = () => {
    startTransition(() => {
      setQuery("");
      setSection("");
      setTopic("");
      setContentType("");
      setActiveLocation("");
      setResetRevision((value) => value + 1);
      setDesktopFiltersOpen(false);
      setMobileSheetOpen(false);
      setMobileFiltersOpen(false);
    });
  };

  const handleResetView = () => {
    startTransition(() => {
      setActiveLocation("");
      setResetRevision((value) => value + 1);
      setMobileSheetOpen(false);
    });
  };

  const handleContentTypeToggle = (next: StoryMapEntryType) => {
    startTransition(() => {
      setContentType((current) => toggleContentFilter(current, next));
      setActiveLocation("");
      if (isCompactViewport) {
        setMobileSheetOpen(false);
      }
    });
  };

  const renderDetailCard = () => {
    if (!activeGroup) {
      return null;
    }

    const entries = activeGroup.entries;
    const hasOverflowEntries = entries.length > 5;
    const previewEntries = hasOverflowEntries ? entries.slice(0, 5) : entries;

    return (
      <section className="story-map-detail">
        <div className="story-map-detail__head">
          <div>
            <span className="eyebrow">{copy.mapStageLabel}</span>
            <h2>{activeGroup.name}</h2>
            <p className="story-map-detail__summary">{buildLocationSummary(activeGroup)}</p>
          </div>

          <button type="button" className="story-map-detail__close" onClick={handleResetView}>
            {copy.closeLabel}
          </button>
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
        </div>

        <DetailEntries entries={previewEntries} copy={copy} capped={previewEntries.length > 3} />

        <div className="story-map-detail__footer">
          <a className="button-secondary story-map-detail__all" href={activeGroup.archiveHref}>
            {copy.showAllFromLocation}
          </a>
        </div>
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
          </div>
        </div>

        <div className="story-map__legend">
          <span>
            {locationCount} {copy.locationPanelLabel}
          </span>
          <span>{getStoryMapContentCountLabel(textCount, "article", lang)}</span>
          <span>{getStoryMapContentCountLabel(documentaryCount, "documentary", lang)}</span>
        </div>

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
          </div>
        </div>

        <div className="story-map__viewport">
          <StoryMapLeafletMap
            lang={lang}
            copy={copy}
            groups={filteredGroups}
            activeLocation={activeLocation}
            isFiltered={isFiltered}
            filterStateKey={filterStateKey}
            resetRevision={resetRevision}
            onActivateLocation={handleActivateLocation}
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
            onPointerDownCapture={stopSheetEventPropagation}
            onTouchStartCapture={stopSheetEventPropagation}
            onTouchMoveCapture={stopSheetEventPropagation}
            onWheelCapture={stopSheetEventPropagation}
          >
            <div className="story-map-sheet__card story-map__filters-sheet">
              <div className="story-map-detail__head">
                <div>
                  <span className="eyebrow">{copy.filtersLabel}</span>
                  <h2>{copy.locationPanelLabel}</h2>
                </div>
                <button
                  type="button"
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
            className="story-map-sheet__panel"
            onPointerDownCapture={stopSheetEventPropagation}
            onTouchStartCapture={stopSheetEventPropagation}
            onTouchMoveCapture={stopSheetEventPropagation}
            onWheelCapture={stopSheetEventPropagation}
          >
            <div className="story-map-sheet__card story-map__detail-sheet">
              <input
                id={`story-map-detail-toggle-${activeGroup.slug}`}
                type="checkbox"
                className="story-map__detail-toggle"
              />
              <label
                htmlFor={`story-map-detail-toggle-${activeGroup.slug}`}
                className="story-map-sheet__handle"
                aria-label={copy.mapStageLabel}
              >
                <span className="story-map-sheet__handle-bar" />
              </label>
              {renderDetailCard()}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
