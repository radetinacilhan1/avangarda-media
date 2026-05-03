import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ArchiveFilterForm } from "@/components/archive-filter-form";
import { getAuthorLabel, localizeTopic } from "@/lib/content";
import { fetchPublishedArticles, filterPublishedArticles, getArticleYear, type PublishedArticle } from "@/lib/editorial";
import { getDictionary, getSectionLabel, resolveLang, withLang } from "@/lib/i18n";
import { normalizeSectionSlug } from "@/lib/sections";
import { formatDisplayDate, getStrapiMediaUrl, unwrapStrapiCollection } from "@/lib/strapi";

type SearchParamValue = string | string[] | undefined;

type NamedOption = {
  label: string;
  value: string;
};

type NamedRelation = {
  id?: number | string;
  name?: string;
  name_en?: string;
  name_tr?: string;
  name_fr?: string;
  name_de?: string;
  slug?: string;
};

function readParam(value: SearchParamValue) {
  return Array.isArray(value) ? value[0] || "" : value || "";
}

function normalizeForOption(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function getNamedRelations(
  value: unknown,
  lang: ReturnType<typeof resolveLang>,
  variant: "generic" | "topic" = "generic"
) {
  return unwrapStrapiCollection<NamedRelation>(value)
    .map((item) => {
      const localizedItem = variant === "topic" ? localizeTopic(item, lang) : item;
      return {
        label: localizedItem.name?.trim() || "",
        value: item.slug?.trim() || item.name?.trim() || ""
      };
    })
    .filter((item) => item.label && item.value);
}

function buildUniqueOptions(values: NamedOption[]) {
  const seen = new Set<string>();

  return values.filter((item) => {
    const key = normalizeForOption(item.value);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function getArchiveMeta(article: PublishedArticle, lang: ReturnType<typeof resolveLang>) {
  const topics = getNamedRelations(article.topics, lang, "topic");
  const locations = getNamedRelations(article.locations, lang);

  return {
    section: getSectionLabel(article.section || "", lang),
    date: formatDisplayDate(article.publishedAt, lang),
    author: getAuthorLabel(article.authors),
    topic: topics[0]?.label || "",
    style: article.style || "",
    location: locations[0]?.label || "",
    excerpt: article.subtitle || article.focus || ""
  };
}

function buildArchiveHref(
  lang: ReturnType<typeof resolveLang>,
  current: Record<string, string>,
  updates: Record<string, string | number | null | undefined>
) {
  const params = new URLSearchParams();

  Object.entries({ ...current, ...updates }).forEach(([key, value]) => {
    if (value === null || value === undefined) return;
    const stringValue = String(value).trim();
    if (!stringValue) return;
    params.set(key, stringValue);
  });

  params.set("lang", lang);
  return `/archive?${params.toString()}`;
}

export default async function ArchivePage({
  searchParams
}: {
  searchParams: Record<string, SearchParamValue>;
}) {
  const lang = resolveLang(searchParams.lang);
  const t = getDictionary(lang);
  const q = readParam(searchParams.q);
  const section = normalizeSectionSlug(readParam(searchParams.section));
  const topic = readParam(searchParams.topic);
  const author = readParam(searchParams.author);
  const year = readParam(searchParams.year);
  const style = readParam(searchParams.style);
  const location = readParam(searchParams.location);
  const sort = readParam(searchParams.sort) === "oldest" ? "oldest" : "newest";
  const page = Math.max(1, Number(readParam(searchParams.page) || "1"));

  const archiveLabel =
    lang === "en" ? "Archive" :
    lang === "tr" ? "Arsiv" :
    lang === "fr" ? "Archives" :
    lang === "de" ? "Archiv" :
    "Arhiva";
  const archiveIntro =
    lang === "en" ? "This is where the publication becomes a record: every published story stays searchable, filterable and editorially legible." :
    lang === "tr" ? "Yayimlanan her hikaye burada bir kayda donusur: aranabilir, filtrelenebilir ve editoral olarak okunabilir kalir." :
    lang === "fr" ? "C'est ici que la publication devient archive: chaque recit publie reste consultable, filtrable et lisible editorialement." :
    lang === "de" ? "Hier wird die Publikation zum Archiv: Jede veroeffentlichte Geschichte bleibt durchsuchbar, filterbar und editorial lesbar." :
    "Ovde publikacija postaje arhiva: svaki objavljen tekst ostaje pretraživ, filtriran i urednički čitljiv.";
  const highlightedLabel =
    lang === "en" ? "From the archive" :
    lang === "tr" ? "Arsivden secilen" :
    lang === "fr" ? "Depuis les archives" :
    lang === "de" ? "Aus dem Archiv" :
    "Iz arhive izdvajamo";
  const themesLabel =
    lang === "en" ? "Themes we follow" :
    lang === "tr" ? "Takip ettigimiz temalar" :
    lang === "fr" ? "Themes suivis" :
    lang === "de" ? "Themen im Fokus" :
    "Teme koje pratimo";
  const filtersLabel =
    lang === "en" ? "Filters" :
    lang === "tr" ? "Filtreler" :
    lang === "fr" ? "Filtres" :
    lang === "de" ? "Filter" :
    "Filteri";
  const resetLabel =
    lang === "en" ? "Reset" :
    lang === "tr" ? "Sifirla" :
    lang === "fr" ? "Reinitialiser" :
    lang === "de" ? "Zurucksetzen" :
    "Resetuj";
  const authorFilterLabel =
    lang === "en" ? "Author" :
    lang === "tr" ? "Yazar" :
    lang === "fr" ? "Auteur" :
    lang === "de" ? "Autor" :
    "Autor";
  const topicFilterLabel =
    lang === "en" ? "Topic" :
    lang === "tr" ? "Tema" :
    lang === "fr" ? "Theme" :
    lang === "de" ? "Thema" :
    "Tema";
  const locationFilterLabel =
    lang === "en" ? "Location" :
    lang === "tr" ? "Konum" :
    lang === "fr" ? "Lieu" :
    lang === "de" ? "Ort" :
    "Lokacija";
  const styleFilterLabel =
    lang === "en" ? "Style" :
    lang === "tr" ? "Stil" :
    lang === "fr" ? "Style" :
    lang === "de" ? "Stil" :
    "Stil";
  const sortLabel =
    lang === "en" ? "Sort" :
    lang === "tr" ? "Sirala" :
    lang === "fr" ? "Tri" :
    lang === "de" ? "Sortierung" :
    "Sortiraj";
  const newestLabel =
    lang === "en" ? "Newest first" :
    lang === "tr" ? "Once en yeni" :
    lang === "fr" ? "Plus recent d'abord" :
    lang === "de" ? "Neueste zuerst" :
    "Najnovije prvo";
  const oldestLabel =
    lang === "en" ? "Oldest first" :
    lang === "tr" ? "Once en eski" :
    lang === "fr" ? "Plus ancien d'abord" :
    lang === "de" ? "Aelteste zuerst" :
    "Najstarije prvo";
  const applyLabel =
    lang === "en" ? "Apply filters" :
    lang === "tr" ? "Filtreleri uygula" :
    lang === "fr" ? "Appliquer" :
    lang === "de" ? "Filter anwenden" :
    "Primeni filtere";
  const pageLabel =
    lang === "en" ? "Page" :
    lang === "tr" ? "Sayfa" :
    lang === "fr" ? "Page" :
    lang === "de" ? "Seite" :
    "Strana";
  const prevLabel =
    lang === "en" ? "Previous" :
    lang === "tr" ? "Onceki" :
    lang === "fr" ? "Precedent" :
    lang === "de" ? "Zuruck" :
    "Prethodna";
  const nextLabel =
    lang === "en" ? "Next" :
    lang === "tr" ? "Sonraki" :
    lang === "fr" ? "Suivant" :
    lang === "de" ? "Weiter" :
    "Sledeća";
  const emptyTitle =
    lang === "en" ? "No archive results for this combination." :
    lang === "tr" ? "Bu filtre kombinasyonu icin sonuc yok." :
    lang === "fr" ? "Aucun resultat pour cette combinaison." :
    lang === "de" ? "Keine Treffer fuer diese Kombination." :
    "Nema rezultata za ovu kombinaciju filtera.";
  const emptyCopy =
    lang === "en" ? "Try a broader search, remove a filter or go back to the full archive." :
    lang === "tr" ? "Daha genis bir arama deneyin, bir filtreyi kaldirin ya da tum arsive donun." :
    lang === "fr" ? "Essayez une recherche plus large, retirez un filtre ou revenez a toute l'archive." :
    lang === "de" ? "Versuche eine breitere Suche, entferne einen Filter oder gehe zum gesamten Archiv zurueck." :
    "Probaj širi pojam, skloni neki filter ili se vrati na celu arhivu.";

  const baseParams = { q, section, topic, author, year, style, location, sort };
  const articles = await fetchPublishedArticles(lang, 240);
  const filteredArticles = filterPublishedArticles(articles, {
    q,
    section,
    topic,
    author,
    year,
    style,
    location,
    sort: sort as "newest" | "oldest"
  });

  const pageSize = 12;
  const totalPages = Math.max(1, Math.ceil(filteredArticles.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * pageSize;
  const pageItems = filteredArticles.slice(pageStart, pageStart + pageSize);
  const featuredItems = (filteredArticles.length ? filteredArticles : articles)
    .filter((article) => article.cover?.url || article.subtitle || article.focus)
    .slice(0, 2);

  const years = Array.from(
    new Set(
      articles
        .map((article) => getArticleYear(article))
        .filter((value): value is number => value !== null)
    )
  ).sort((left, right) => right - left);

  const authorOptions = buildUniqueOptions(
    articles.flatMap((article) => getNamedRelations(article.authors, lang))
  ).sort((left, right) => left.label.localeCompare(right.label));
  const topicOptions = buildUniqueOptions(
    articles.flatMap((article) => getNamedRelations(article.topics, lang, "topic"))
  ).sort((left, right) => left.label.localeCompare(right.label));
  const locationOptions = buildUniqueOptions(
    articles.flatMap((article) => getNamedRelations(article.locations, lang))
  ).sort((left, right) => left.label.localeCompare(right.label));
  const styleOptions = Array.from(new Set(articles.map((article) => article.style).filter(Boolean)))
    .sort((left, right) => String(left).localeCompare(String(right)))
    .map((value) => ({ label: value || "", value: value || "" }));

  const themePreview = topicOptions.slice(0, 6);
  const sectionOptions = [
    { label: t.allSections, value: "" },
    { label: t.sectionNews, value: "front" },
    { label: t.sectionAnalysis, value: "analysis" },
    { label: t.sectionInterview, value: "interview" },
    { label: t.sectionColumn, value: "column" }
  ];
  const topicSelectOptions = [{ label: topicFilterLabel, value: "" }, ...topicOptions];
  const authorSelectOptions = [{ label: authorFilterLabel, value: "" }, ...authorOptions];
  const yearSelectOptions = [{ label: t.archiveYear, value: "" }, ...years.map((value) => ({ label: String(value), value: String(value) }))];
  const styleSelectOptions = [{ label: styleFilterLabel, value: "" }, ...styleOptions];
  const locationSelectOptions = [{ label: locationFilterLabel, value: "" }, ...locationOptions];
  const sortOptions = [
    { label: newestLabel, value: "newest" },
    { label: oldestLabel, value: "oldest" }
  ];

  return (
    <>
      <SiteHeader lang={lang} currentPath="/archive" activeNav="archive" />

      <main className="site-main">
        <div className="page-shell">
          <section className="panel subpage-hero archive-hero">
            <span className="eyebrow">{archiveLabel}</span>
            <h1 className="subpage-hero__title">{archiveLabel}</h1>
            <p className="subpage-hero__copy">{archiveIntro}</p>
          </section>

          <section className="archive-layout">
            <div className="archive-layout__main">
              <section className="panel info-card archive-filters">
                <div className="archive-filters__topline">
                  <div>
                    <span className="eyebrow">{filtersLabel}</span>
                    <h2>{archiveLabel}</h2>
                  </div>
                  <a className="button-secondary archive-filters__reset" href={withLang("/archive", lang)}>
                    {resetLabel}
                  </a>
                </div>

                <ArchiveFilterForm
                  lang={lang}
                  searchPlaceholder={t.archiveSearchPlaceholder}
                  applyLabel={applyLabel}
                  defaults={{ q, section, topic, author, year, style, location, sort }}
                  options={{
                    sections: sectionOptions,
                    topics: topicSelectOptions,
                    authors: authorSelectOptions,
                    years: yearSelectOptions,
                    styles: styleSelectOptions,
                    locations: locationSelectOptions,
                    sorts: sortOptions
                  }}
                  labels={{
                    section: t.allSections,
                    topic: topicFilterLabel,
                    author: authorFilterLabel,
                    year: t.archiveYear,
                    style: styleFilterLabel,
                    location: locationFilterLabel
                  }}
                />
              </section>

              {featuredItems.length ? (
                <section className="archive-spotlight">
                  <div className="section-header">
                    <div>
                      <span className="eyebrow">{highlightedLabel}</span>
                      <h2 className="section-title">{archiveLabel}</h2>
                    </div>
                    <p className="section-kicker">{t.archiveCopyPage}</p>
                  </div>

                  <div className="archive-spotlight__grid">
                    {featuredItems.map((article) => {
                      const meta = getArchiveMeta(article, lang);
                      const imageUrl = article.cover?.url
                        ? getStrapiMediaUrl(article.cover.formats?.medium?.url || article.cover.formats?.small?.url || article.cover.url)
                        : "";

                      return (
                        <a
                          key={article.id}
                          href={withLang(`/a/${article.slug}`, lang)}
                          className={imageUrl ? "panel article-card article-card--media archive-card archive-card--spotlight" : "panel article-card archive-card archive-card--spotlight"}
                        >
                          {imageUrl ? (
                            <div className="article-card__media archive-card__media">
                              <img className="article-card__media-image" src={imageUrl} alt={article.title} />
                            </div>
                          ) : null}

                          <div>
                            <div className="article-card__meta">
                              {meta.section ? <span>{meta.section}</span> : null}
                              {meta.date ? <span>{meta.date}</span> : null}
                              {meta.author ? <span>{meta.author}</span> : null}
                            </div>
                            <h3 className="article-card__title">{article.title}</h3>
                            {meta.excerpt ? <p className="article-card__subtitle">{meta.excerpt}</p> : null}
                          </div>
                        </a>
                      );
                    })}
                  </div>
                </section>
              ) : null}

              <section className="section-block archive-results">
                <div className="section-header">
                  <div>
                    <span className="eyebrow">{t.searchResults}</span>
                    <h2 className="section-title">{filteredArticles.length} {archiveLabel.toLowerCase()}</h2>
                  </div>
                  <p className="section-kicker">{sortLabel}: {sort === "oldest" ? oldestLabel : newestLabel}</p>
                </div>

                {pageItems.length ? (
                  <>
                    <div className="page-grid archive-grid">
                      {pageItems.map((article) => {
                        const meta = getArchiveMeta(article, lang);
                        const imageUrl = article.cover?.url
                          ? getStrapiMediaUrl(article.cover.formats?.small?.url || article.cover.formats?.medium?.url || article.cover.url)
                          : "";
                        const chips = [meta.topic, meta.style, meta.location].filter(Boolean).slice(0, 3);

                        return (
                          <a
                            key={article.id}
                            href={withLang(`/a/${article.slug}`, lang)}
                            className={imageUrl ? "panel article-card article-card--media archive-card" : "panel article-card archive-card"}
                          >
                            {imageUrl ? (
                              <div className="article-card__media archive-card__media">
                                <img className="article-card__media-image" src={imageUrl} alt={article.title} />
                              </div>
                            ) : null}

                            <div>
                              <div className="article-card__meta">
                                {meta.section ? <span>{meta.section}</span> : null}
                                {meta.date ? <span>{meta.date}</span> : null}
                                {meta.author ? <span>{meta.author}</span> : null}
                              </div>
                              <h3 className="article-card__title">{article.title}</h3>
                              {meta.excerpt ? <p className="article-card__subtitle">{meta.excerpt}</p> : null}
                              {chips.length ? (
                                <div className="archive-card__chips">
                                  {chips.map((chip) => (
                                    <span key={`${article.id}-${chip}`} className="topic-pill archive-card__chip">{chip}</span>
                                  ))}
                                </div>
                              ) : null}
                            </div>
                            <span className="button-secondary">{t.readStory}</span>
                          </a>
                        );
                      })}
                    </div>

                    {totalPages > 1 ? (
                      <nav className="archive-pager" aria-label={pageLabel}>
                        <a
                          href={buildArchiveHref(lang, baseParams, { page: currentPage > 1 ? currentPage - 1 : 1 })}
                          className={`button-secondary archive-pager__button${currentPage === 1 ? " archive-pager__button--disabled" : ""}`}
                          aria-disabled={currentPage === 1}
                        >
                          {prevLabel}
                        </a>
                        <span className="archive-pager__status">
                          {pageLabel} {currentPage} / {totalPages}
                        </span>
                        <a
                          href={buildArchiveHref(lang, baseParams, { page: currentPage < totalPages ? currentPage + 1 : totalPages })}
                          className={`button-secondary archive-pager__button${currentPage === totalPages ? " archive-pager__button--disabled" : ""}`}
                          aria-disabled={currentPage === totalPages}
                        >
                          {nextLabel}
                        </a>
                      </nav>
                    ) : null}
                  </>
                ) : (
                  <div className="panel empty-state">
                    <h3>{emptyTitle}</h3>
                    <p>{emptyCopy}</p>
                  </div>
                )}
              </section>
            </div>

            <aside className="archive-layout__side">
              <section className="panel homepage-sidebar__panel archive-sidebar">
                <div className="homepage-sidebar__heading">
                  <span className="eyebrow">{themesLabel}</span>
                </div>
                <p className="archive-sidebar__copy">{t.themesCopy}</p>
                <div className="topic-list archive-sidebar__topics">
                  {themePreview.map((theme) => (
                    <a
                      key={theme.value}
                      href={buildArchiveHref(lang, baseParams, { topic: theme.value, page: 1 })}
                      className="topic-pill"
                    >
                      {theme.label}
                    </a>
                  ))}
                </div>
              </section>
            </aside>
          </section>
        </div>
      </main>

      <SiteFooter lang={lang} t={t} />
    </>
  );
}
