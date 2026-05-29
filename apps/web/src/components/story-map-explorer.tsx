"use client";

import { startTransition, useDeferredValue, useEffect, useState } from "react";

import type { Lang } from "@/lib/i18n";
import {
  getStoryMapCountLabel,
  type StoryMapData,
  type StoryMapEntry,
  type StoryMapLocationGroup,
} from "@/lib/story-map";

type StoryMapExplorerCopy = {
  label: string;
  searchPlaceholder: string;
  allLocations: string;
  allSections: string;
  allTopics: string;
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
  documentariesLabel: string;
};

type StoryMapExplorerProps = {
  lang: Lang;
  copy: StoryMapExplorerCopy;
  data: StoryMapData;
  initialLocation?: string;
  initialSection?: string;
  initialTopic?: string;
  initialQuery?: string;
};

function normalizeFilterValue(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function countEntryType(entries: StoryMapEntry[], type: StoryMapEntry["type"]) {
  return entries.reduce((total, entry) => total + Number(entry.type === type), 0);
}

function entryMatchesQuery(entry: StoryMapEntry, query: string) {
  if (!query) return true;

  const haystack = normalizeFilterValue(
    [
      entry.title,
      entry.sectionLabel,
      entry.author,
      entry.topics.join(" "),
    ]
      .filter(Boolean)
      .join(" ")
  );

  return haystack.includes(query);
}

function getVisibleGroups({
  groups,
  query,
  section,
  topic,
}: {
  groups: StoryMapLocationGroup[];
  query: string;
  section: string;
  topic: string;
}) {
  return groups.reduce<StoryMapLocationGroup[]>((collection, group) => {
    const sectionFiltered = group.entries.filter((entry) => {
      if (section && entry.sectionKey !== section) {
        return false;
      }

      if (topic && !entry.topicSlugs.includes(topic)) {
        return false;
      }

      return true;
    });

    if (!sectionFiltered.length) {
      return collection;
    }

    const groupMatch = normalizeFilterValue(
      [group.name, group.canonicalName, group.country, group.region].filter(Boolean).join(" ")
    ).includes(query);
    const visibleEntries = query
      ? groupMatch
        ? sectionFiltered
        : sectionFiltered.filter((entry) => entryMatchesQuery(entry, query))
      : sectionFiltered;

    if (!visibleEntries.length) {
      return collection;
    }

    collection.push({
      ...group,
      totalCount: visibleEntries.length,
      articleCount: countEntryType(visibleEntries, "article"),
      documentaryCount: countEntryType(visibleEntries, "documentary"),
      entries: visibleEntries,
    });

    return collection;
  }, []);
}

function StoryMapLocationCard({
  group,
  copy,
  lang,
  mobile = false,
  onClose,
}: {
  group: StoryMapLocationGroup | null;
  copy: StoryMapExplorerCopy;
  lang: Lang;
  mobile?: boolean;
  onClose?: () => void;
}) {
  return (
    <section
      className={mobile ? "story-map-sheet__card" : "story-map-detail"}
      aria-live="polite"
    >
      {group ? (
        <>
          <div className="story-map-detail__head">
            <div>
              <span className="eyebrow">{copy.label}</span>
              <h2>{group.name}</h2>
            </div>
            {onClose ? (
              <button type="button" className="story-map-detail__close" onClick={onClose}>
                {copy.closeLabel}
              </button>
            ) : null}
          </div>

          <div className="story-map-detail__meta">
            <span className="topic-pill">{getStoryMapCountLabel(group.totalCount, lang)}</span>
            {group.country ? <span>{group.country}</span> : null}
            {group.region ? <span>{group.region}</span> : null}
          </div>

          <div className="story-map-detail__list">
            {group.entries.map((entry) => (
              <article key={entry.id} className="story-map-detail__entry">
                <div className="story-map-detail__entry-meta">
                  <span>{entry.sectionLabel}</span>
                  {entry.date ? <span>{entry.date}</span> : null}
                  {entry.author ? <span>{entry.author}</span> : null}
                </div>
                <h3>{entry.title}</h3>
                {entry.topics.length ? (
                  <div className="story-map-detail__topics">
                    {entry.topics.slice(0, 3).map((topic) => (
                      <span key={`${entry.id}-${topic}`} className="topic-pill">
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

          <div className="story-map-detail__footer">
            <a className="button-secondary story-map-detail__all" href={group.archiveHref}>
              {copy.showAllFromLocation}
            </a>
          </div>
        </>
      ) : (
        <div className="story-map-detail__empty">
          <h2>{copy.allLocations}</h2>
          <p>{copy.noStoriesForLocation}</p>
        </div>
      )}
    </section>
  );
}

export function StoryMapExplorer({
  lang,
  copy,
  data,
  initialLocation = "",
  initialSection = "",
  initialTopic = "",
  initialQuery = "",
}: StoryMapExplorerProps) {
  const [query, setQuery] = useState(initialQuery);
  const [section, setSection] = useState(initialSection);
  const [topic, setTopic] = useState(initialTopic);
  const [activeLocation, setActiveLocation] = useState(initialLocation || data.groups[0]?.slug || "");
  const [locationInUrl, setLocationInUrl] = useState(Boolean(initialLocation));
  const [mobileSheetOpen, setMobileSheetOpen] = useState(Boolean(initialLocation));
  const deferredQuery = useDeferredValue(query);
  const visibleGroups = getVisibleGroups({
    groups: data.groups,
    query: normalizeFilterValue(deferredQuery),
    section,
    topic,
  });
  const activeGroup = visibleGroups.find((group) => group.slug === activeLocation) || visibleGroups[0] || null;
  const visibleArticleCount = visibleGroups.reduce((total, group) => total + group.articleCount, 0);
  const visibleDocumentaryCount = visibleGroups.reduce((total, group) => total + group.documentaryCount, 0);

  useEffect(() => {
    if (!visibleGroups.length) {
      if (activeLocation) {
        setActiveLocation("");
      }
      if (mobileSheetOpen) {
        setMobileSheetOpen(false);
      }
      return;
    }

    if (!visibleGroups.some((group) => group.slug === activeLocation)) {
      setActiveLocation(visibleGroups[0]?.slug || "");
    }
  }, [activeLocation, mobileSheetOpen, visibleGroups]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const params = new URLSearchParams();
    params.set("lang", lang);

    if (query.trim()) params.set("q", query.trim());
    if (section) params.set("section", section);
    if (topic) params.set("topic", topic);
    if (locationInUrl && activeGroup?.slug) params.set("location", activeGroup.slug);

    const next = `${window.location.pathname}?${params.toString()}`;
    const current = `${window.location.pathname}${window.location.search}`;

    if (next !== current) {
      window.history.replaceState(null, "", next);
    }
  }, [activeGroup?.slug, lang, query, section, topic]);

  const activateLocation = (slug: string, openSheet: boolean) => {
    startTransition(() => {
      setActiveLocation(slug);
      setLocationInUrl(true);
      setMobileSheetOpen(openSheet);
    });
  };

  const clearFilters = () => {
    startTransition(() => {
      setQuery("");
      setSection("");
      setTopic("");
      setLocationInUrl(false);
      setMobileSheetOpen(false);
    });
  };

  return (
    <section className="story-map">
      <div className="story-map__layout">
        <aside className="panel story-map__sidebar">
          <div className="story-map__sidebar-head">
            <div>
              <span className="eyebrow">{copy.filtersLabel}</span>
              <h2>{copy.locationPanelLabel}</h2>
            </div>
            <button type="button" className="button-ghost story-map__reset" onClick={clearFilters}>
              {copy.allLocations}
            </button>
          </div>

          <div className="story-map__filters">
            <input
              type="search"
              className="field"
              value={query}
              placeholder={copy.searchPlaceholder}
              aria-label={copy.searchPlaceholder}
              onChange={(event) => {
                const nextValue = event.target.value;
                startTransition(() => setQuery(nextValue));
              }}
            />

            <select
              className="select"
              value={section}
              aria-label={copy.allSections}
              onChange={(event) => {
                const nextValue = event.target.value;
                startTransition(() => setSection(nextValue));
              }}
            >
              {data.sections.map((option) => (
                <option key={option.key || "all"} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              className="select"
              value={topic}
              aria-label={copy.allTopics}
              onChange={(event) => {
                const nextValue = event.target.value;
                startTransition(() => setTopic(nextValue));
              }}
            >
              {data.topics.map((option) => (
                <option key={option.slug || "all"} value={option.slug}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>

          <div className="story-map__legend">
            <span>{visibleGroups.length} {copy.locationPanelLabel.toLowerCase()}</span>
            <span>{visibleArticleCount} {copy.textsLabel.toLowerCase()}</span>
            <span>{visibleDocumentaryCount} {copy.documentariesLabel.toLowerCase()}</span>
          </div>

          <div className="story-map__location-list">
            {visibleGroups.length ? (
              visibleGroups.map((group) => {
                const isActive = group.slug === activeGroup?.slug;

                return (
                  <button
                    key={group.slug}
                    type="button"
                    className={isActive ? "story-map__location-item story-map__location-item--active" : "story-map__location-item"}
                    onClick={() => activateLocation(group.slug, true)}
                  >
                    <div>
                      <strong>{group.name}</strong>
                      <span>{[group.country, group.region].filter(Boolean).join(" • ") || copy.mapStageLabel}</span>
                    </div>
                    <span className="story-map__location-count">{group.totalCount}</span>
                  </button>
                );
              })
            ) : (
              <div className="story-map__empty-list">
                <h3>{copy.emptyTitle}</h3>
                <p>{copy.emptyCopy}</p>
              </div>
            )}
          </div>
        </aside>

        <div className="story-map__main">
          <div className="panel story-map__stage">
            <div className="story-map__stage-head">
              <div>
                <span className="eyebrow">{copy.mapStageLabel}</span>
                <h2>{activeGroup?.name || copy.allLocations}</h2>
              </div>
              <div className="story-map__stage-legend">
                <span className="story-map__legend-chip story-map__legend-chip--text">{copy.textsLabel}</span>
                <span className="story-map__legend-chip story-map__legend-chip--documentary">{copy.documentariesLabel}</span>
              </div>
            </div>

            <div className="story-map__canvas" aria-label={copy.mapStageLabel} role="img">
              <div className="story-map__canvas-glow story-map__canvas-glow--one" aria-hidden="true" />
              <div className="story-map__canvas-glow story-map__canvas-glow--two" aria-hidden="true" />
              <div className="story-map__canvas-grid" aria-hidden="true" />
              <svg className="story-map__contours" viewBox="0 0 1000 680" aria-hidden="true" focusable="false">
                <path d="M80 168C173 110 280 116 365 176c67 47 132 65 209 46 69-17 127-64 202-62 57 1 105 27 144 70" />
                <path d="M132 290c84-39 176-42 258-3 68 33 121 90 198 107 74 16 152-5 227 8 42 8 80 23 117 44" />
                <path d="M174 438c78-42 175-52 265-29 92 24 161 86 256 99 84 12 161-13 243 17" />
                <path d="M232 556c73-29 149-35 223-16 65 16 121 54 186 68 101 22 208-3 299 24" />
              </svg>

              {visibleGroups.length ? (
                visibleGroups.map((group) => {
                  const isActive = group.slug === activeGroup?.slug;

                  return (
                    <button
                      key={group.slug}
                      type="button"
                      className={isActive ? "story-map__marker story-map__marker--active" : "story-map__marker"}
                      style={{ left: `${group.x}%`, top: `${group.y}%` }}
                      aria-pressed={isActive}
                      aria-label={`${group.name} (${group.totalCount})`}
                      onClick={() => activateLocation(group.slug, true)}
                    >
                      <span className="story-map__marker-pulse" aria-hidden="true" />
                      <span className="story-map__marker-core" aria-hidden="true" />
                      <span className="story-map__marker-count">{group.totalCount}</span>
                      {isActive ? <span className="story-map__marker-label">{group.name}</span> : null}
                    </button>
                  );
                })
              ) : (
                <div className="story-map__canvas-empty">
                  <h3>{copy.emptyTitle}</h3>
                  <p>{copy.emptyCopy}</p>
                </div>
              )}

              {activeGroup ? (
                <div className="story-map__desktop-card">
                  <StoryMapLocationCard group={activeGroup} copy={copy} lang={lang} />
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {mobileSheetOpen && activeGroup ? (
        <div className="story-map-sheet" role="dialog" aria-modal="true" aria-label={activeGroup.name}>
          <button
            type="button"
            className="story-map-sheet__backdrop"
            aria-label={copy.closeLabel}
            onClick={() => setMobileSheetOpen(false)}
          />
          <div className="story-map-sheet__panel">
            <StoryMapLocationCard
              group={activeGroup}
              copy={copy}
              lang={lang}
              mobile
              onClose={() => setMobileSheetOpen(false)}
            />
          </div>
        </div>
      ) : null}
    </section>
  );
}
