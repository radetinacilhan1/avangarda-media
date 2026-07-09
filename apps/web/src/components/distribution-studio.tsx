"use client";

import { startTransition, useDeferredValue, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  buildDistributionDrafts,
  buildDistributionOpenLinks,
  type DistributionArticle,
  type DistributionDraft,
  type DistributionDraftKey,
  type DistributionPanelCopy,
} from "@/lib/distribution";
import type { Lang } from "@/lib/i18n";
import { buildLocalizedUrl } from "@/lib/seo";
import { formatDisplayDate } from "@/lib/strapi";

type DistributionStudioListItem = {
  id: number;
  slug: string;
  title: string;
  subtitle?: string;
  publishedAt?: string;
  section?: string;
  authors: string[];
  topics: string[];
};

type DistributionStudioProps = {
  lang: Lang;
  source: "cms" | "fallback";
  copy: DistributionPanelCopy;
  articles: DistributionStudioListItem[];
  selectedArticle: DistributionArticle | null;
  initialDrafts: DistributionDraft[];
};

type CopyState = Partial<Record<DistributionDraftKey, boolean>>;

function normalizeSearch(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function buildSearchHaystack(article: DistributionStudioListItem) {
  return normalizeSearch(
    [
      article.title,
      article.subtitle || "",
      article.authors.join(" "),
      article.topics.join(" "),
    ].join(" ")
  );
}

export function DistributionStudio({
  lang,
  source,
  copy,
  articles,
  selectedArticle,
  initialDrafts,
}: DistributionStudioProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [noteValue, setNoteValue] = useState(selectedArticle?.distributionNote || "");
  const [drafts, setDrafts] = useState<DistributionDraft[]>(initialDrafts);
  const [copyState, setCopyState] = useState<CopyState>({});

  useEffect(() => {
    setNoteValue(selectedArticle?.distributionNote || "");
    setDrafts(initialDrafts);
    setCopyState({});
  }, [selectedArticle?.slug, selectedArticle?.distributionNote, initialDrafts]);

  const filteredArticles = useMemo(() => {
    const normalized = normalizeSearch(deferredQuery);
    if (!normalized) return articles;
    return articles.filter((article) => buildSearchHaystack(article).includes(normalized));
  }, [articles, deferredQuery]);

  const sourceLabel = source === "cms" ? copy.sourceCms : copy.sourceFallback;
  const articleUrl = selectedArticle ? buildLocalizedUrl(`/a/${selectedArticle.slug}`, lang) : "";

  function updateSelectedSlug(slug: string) {
    const params = new URLSearchParams(searchParams?.toString() || "");
    params.set("slug", slug);
    params.set("lang", lang);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  async function copyDraft(key: DistributionDraftKey, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopyState((current) => ({ ...current, [key]: true }));
      window.setTimeout(() => {
        setCopyState((current) => ({ ...current, [key]: false }));
      }, 1400);
    } catch {
      setCopyState((current) => ({ ...current, [key]: false }));
    }
  }

  function refreshDrafts() {
    if (!selectedArticle) return;
    startTransition(() => {
      setDrafts(buildDistributionDrafts(selectedArticle, lang, noteValue));
      setCopyState({});
    });
  }

  function resetNote() {
    if (!selectedArticle) return;
    const nextValue = selectedArticle.distributionNote || "";
    setNoteValue(nextValue);
    startTransition(() => {
      setDrafts(buildDistributionDrafts(selectedArticle, lang, nextValue));
      setCopyState({});
    });
  }

  return (
    <section className="distribution-studio">
      <div className="distribution-studio__hero panel">
        <div>
          <span className="eyebrow">{copy.eyebrow}</span>
          <h1 className="subpage-hero__title">{copy.title}</h1>
          <p className="subpage-hero__copy">{copy.intro}</p>
        </div>
        <div className="distribution-studio__hero-meta">
          <span className="distribution-studio__badge">{copy.internalBadge}</span>
          <span className="distribution-studio__badge distribution-studio__badge--muted">{sourceLabel}</span>
          <span className="distribution-studio__hero-note">{copy.manualReviewLabel}</span>
        </div>
      </div>

      <div className="distribution-studio__grid">
        <aside className="panel distribution-studio__sidebar">
          <div className="distribution-studio__sidebar-header">
            <span className="eyebrow">{copy.articleListLabel}</span>
            <input
              className="field distribution-studio__search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={copy.articleSearchPlaceholder}
            />
          </div>

          {filteredArticles.length ? (
            <div className="distribution-studio__article-list">
              {filteredArticles.map((article) => {
                const isActive = article.slug === selectedArticle?.slug;

                return (
                  <button
                    key={article.id}
                    type="button"
                    className={`distribution-studio__article-item${isActive ? " is-active" : ""}`}
                    onClick={() => updateSelectedSlug(article.slug)}
                  >
                    <span className="distribution-studio__article-title">{article.title}</span>
                    {article.subtitle ? (
                      <span className="distribution-studio__article-subtitle">{article.subtitle}</span>
                    ) : null}
                    <span className="distribution-studio__article-meta">
                      {article.authors.slice(0, 2).join(", ")}
                      {article.publishedAt ? ` · ${formatDisplayDate(article.publishedAt, lang)}` : ""}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="distribution-studio__empty">
              <h2>{copy.noArticlesTitle}</h2>
              <p>{copy.noArticlesCopy}</p>
            </div>
          )}
        </aside>

        <div className="distribution-studio__main">
          {selectedArticle ? (
            <>
              <section className="panel distribution-studio__article-panel">
                <div className="distribution-studio__article-header">
                  <div className="distribution-studio__article-copy">
                    <span className="eyebrow">{copy.selectedArticleLabel}</span>
                    <h2 className="distribution-studio__article-heading">{selectedArticle.title}</h2>
                    {selectedArticle.subtitle ? (
                      <p className="distribution-studio__article-intro">{selectedArticle.subtitle}</p>
                    ) : null}
                  </div>
                  {selectedArticle.coverImageUrl ? (
                    <img
                      src={selectedArticle.coverImageUrl}
                      alt={selectedArticle.title}
                      className="distribution-studio__cover"
                      draggable={false}
                      data-protected-media="true"
                    />
                  ) : null}
                </div>

                <div className="distribution-studio__meta-grid">
                  <div className="distribution-studio__meta-card">
                    <span>{copy.languageLabel}</span>
                    <strong>{lang.toUpperCase()}</strong>
                  </div>
                  <div className="distribution-studio__meta-card">
                    <span>{copy.sectionLabel}</span>
                    <strong>{copy.sectionLabels[(selectedArticle.section as "front" | "analysis" | "interview" | "column") || "front"]}</strong>
                  </div>
                  <div className="distribution-studio__meta-card">
                    <span>{copy.authorLabel}</span>
                    <strong>{selectedArticle.authors.join(", ") || "Avangarda"}</strong>
                  </div>
                  <div className="distribution-studio__meta-card">
                    <span>{copy.topicsLabel}</span>
                    <strong>{selectedArticle.topics.join(", ") || "—"}</strong>
                  </div>
                </div>

                <div className="distribution-studio__link-row">
                  <span className="distribution-studio__link-label">{copy.articleLinkLabel}</span>
                  <a href={articleUrl} target="_blank" rel="noopener noreferrer" className="distribution-studio__story-link">
                    {articleUrl}
                  </a>
                </div>

                <div className="distribution-studio__note-panel">
                  <div className="distribution-studio__note-header">
                    <div>
                      <span className="eyebrow">{copy.distributionNoteLabel}</span>
                      <p className="distribution-studio__note-helper">
                        {selectedArticle.distributionNote ? copy.distributionNoteHelper : copy.noDistributionNote}
                      </p>
                    </div>
                    <div className="distribution-studio__note-actions">
                      <button type="button" className="button-secondary" onClick={resetNote}>
                        {copy.resetNoteLabel}
                      </button>
                      <button type="button" className="button-ghost" onClick={refreshDrafts}>
                        {copy.regenerateLabel}
                      </button>
                    </div>
                  </div>
                  <textarea
                    className="textarea distribution-studio__note-textarea"
                    value={noteValue}
                    onChange={(event) => setNoteValue(event.target.value)}
                    rows={4}
                  />
                </div>
              </section>

              <section className="distribution-studio__drafts">
                <div className="distribution-studio__drafts-header">
                  <span className="eyebrow">{copy.draftsLabel}</span>
                </div>

                <div className="distribution-studio__draft-grid">
                  {drafts.map((draft) => {
                    const openLinks = buildDistributionOpenLinks({
                      draftKey: draft.key,
                      lang,
                      articleUrl,
                      articleTitle: selectedArticle.title,
                      text: draft.text,
                    });

                    return (
                      <section key={draft.key} className="panel distribution-studio__draft-card">
                        <div className="distribution-studio__draft-header">
                          <div>
                            <h3>{draft.title}</h3>
                            <p>{draft.tone}</p>
                          </div>
                          <button
                            type="button"
                            className="button-secondary distribution-studio__copy-button"
                            onClick={() => copyDraft(draft.key, draft.text)}
                          >
                            {copyState[draft.key] ? copy.copiedLabel : copy.copyLabel}
                          </button>
                        </div>

                        <textarea
                          className="textarea distribution-studio__draft-textarea"
                          value={draft.text}
                          onChange={(event) => {
                            const nextText = event.target.value;
                            setDrafts((current) =>
                              current.map((entry) =>
                                entry.key === draft.key ? { ...entry, text: nextText } : entry
                              )
                            );
                          }}
                          rows={draft.key === "x" ? 6 : 9}
                        />

                        <div className="distribution-studio__draft-actions">
                          {openLinks.map((link) => (
                            <a
                              key={`${draft.key}-${link.label}`}
                              href={link.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="button-secondary distribution-studio__open-link"
                            >
                              {link.label}
                            </a>
                          ))}
                        </div>
                      </section>
                    );
                  })}
                </div>
              </section>
            </>
          ) : (
            <section className="panel distribution-studio__empty">
              <h2>{copy.emptyTitle}</h2>
              <p>{copy.emptyCopy}</p>
            </section>
          )}
        </div>
      </div>
    </section>
  );
}
