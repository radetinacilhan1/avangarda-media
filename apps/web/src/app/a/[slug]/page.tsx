import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ArticleViewTracker } from "@/components/article-view-tracker";
import { getAuthorLabel, localizeArticle, localizeAuthor } from "@/lib/content";
import { fetchPublishedArticles } from "@/lib/editorial";
import { getFallbackAuthorBySlug } from "@/lib/fallback-content";
import { getDictionary, getSectionLabel, resolveLang, withLang } from "@/lib/i18n";
import { getRichTextHtml } from "@/lib/richtext";
import { formatDisplayDate, getStrapiMediaUrl, strapiGet, unwrapStrapiCollection } from "@/lib/strapi";
import { getYouTubeEmbedUrl } from "@/lib/video";

type Author = {
  id: number;
  name: string;
  slug: string;
  bio?: string;
  bio_en?: string;
  bio_tr?: string;
  bio_fr?: string;
  bio_de?: string;
  email?: string;
  photo?: {
    url?: string;
    formats?: {
      small?: { url?: string };
      thumbnail?: { url?: string };
    };
  };
};

type Article = {
  id: number;
  title: string;
  slug?: string;
  subtitle?: string;
  content: string;
  title_en?: string;
  title_tr?: string;
  title_fr?: string;
  title_de?: string;
  subtitle_en?: string;
  subtitle_tr?: string;
  subtitle_fr?: string;
  subtitle_de?: string;
  content_en?: string;
  content_tr?: string;
  content_fr?: string;
  content_de?: string;
  publishedAt: string;
  section: string;
  focus?: string;
  style?: string;
  viewCount?: number;
  editorNote?: string;
  videoEmbedUrl?: string;
  authors?: unknown;
  topics?: unknown;
  relatedArticles?: unknown;
  cover?: {
    url?: string;
    formats?: {
      large?: { url?: string };
      medium?: { url?: string };
    };
  };
};

type Comment = {
  id: number;
  content: string;
  authorName?: string;
  createdAt?: string;
};

type HomepageSidebarItem = {
  id?: number;
  title?: string;
  shortDescription?: string;
  link?: string;
};

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

function resolveSidebarHref(link: string | undefined, lang: ReturnType<typeof resolveLang>) {
  if (!link?.trim()) return undefined;
  if (/^(https?:)?\/\//i.test(link)) return link;

  const normalized = link.startsWith("/") ? link : `/${link}`;
  return withLang(normalized, lang);
}

function mergeUniqueArticles(primary: Article[], fallback: Article[], limit: number, excludedId?: number) {
  const merged = new Map<number, Article>();

  for (const article of [...primary, ...fallback]) {
    if (!article?.id || article.id === excludedId || merged.has(article.id)) continue;
    merged.set(article.id, article);
    if (merged.size >= limit) break;
  }

  return Array.from(merged.values());
}

export default async function ArticlePage({
  params,
  searchParams
}: {
  params: { slug: string };
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const lang = resolveLang(searchParams.lang);
  const t = getDictionary(lang);
  const articleSlug = encodeURIComponent(params.slug);
  const publishedArticles = await fetchPublishedArticles(lang, 240);
  const res = await strapiGet<{ data: unknown[] }>(
    `/api/articles?filters[slug][$eq]=${articleSlug}&populate[authors][populate][0]=photo&populate[cover]=*&populate[topics]=*&populate[relatedArticles][populate][authors][populate][0]=photo&populate[relatedArticles][populate][cover]=*`
  );
  let item = unwrapStrapiCollection<Article>(res?.data)[0];

  if (!item) {
    item = publishedArticles.find((entry) => entry.slug === params.slug) as Article | undefined;
  }

  if (!item) {
    return (
      <main className="site-main">
        <div className="article-shell">
          <div className="panel empty-state">
            <h3>{t.articleNotFound}</h3>
            <p>{t.articleNotFoundCopy}</p>
          </div>
        </div>
      </main>
    );
  }

  const localizedItem = localizeArticle(item, lang);
  const authors = unwrapStrapiCollection<Author>(item.authors);
  const leadAuthor = authors[0];
  const leadAuthorPhotoUrl = leadAuthor?.photo?.url
    ? getStrapiMediaUrl(leadAuthor.photo.formats?.small?.url || leadAuthor.photo.formats?.thumbnail?.url || leadAuthor.photo.url)
    : "";
  const videoUrl = getYouTubeEmbedUrl(item.videoEmbedUrl);
  const articleHtml = getRichTextHtml(localizedItem.content);
  const manualRelatedArticles = unwrapStrapiCollection<Article>(item.relatedArticles)
    .filter((article) => article.id !== item.id)
    .map((article) => localizeArticle(article, lang));

  const commentsRes = await strapiGet<{ data: unknown[] }>(
    `/api/comments?filters[article][id][$eq]=${item.id}&sort=createdAt:desc`
  );
  const relatedSectionRes = manualRelatedArticles.length
    ? null
    : await strapiGet<{ data: unknown[] }>(
        `/api/articles?filters[id][$ne]=${item.id}&filters[section][$eq]=${item.section}&populate=authors&sort=publishedAt:desc&pagination[pageSize]=6`
      );
  const topReadRes = await strapiGet<{ data: unknown[] }>(
    `/api/articles?filters[id][$ne]=${item.id}&filters[viewCount][$gt]=0&populate=authors,cover&sort[0]=viewCount:desc&sort[1]=publishedAt:desc&pagination[pageSize]=4`
  );
  const latestSidebarRes = await strapiGet<{ data: unknown[] }>(
    `/api/articles?filters[id][$ne]=${item.id}&populate=authors&sort=publishedAt:desc&pagination[pageSize]=4`
  );
  const authorRes = leadAuthor?.slug
    ? await strapiGet<{ data: unknown[] }>(
        `/api/authors?filters[slug][$eq]=${encodeURIComponent(leadAuthor.slug)}&populate=photo,socials`
      )
    : null;
  const authorLatestRes = leadAuthor?.slug
    ? await strapiGet<{ data: unknown[] }>(
        `/api/articles?filters[id][$ne]=${item.id}&filters[authors][slug][$eq]=${leadAuthor.slug}&populate=authors&sort=publishedAt:desc&pagination[pageSize]=3`
      )
    : null;

  const comments = unwrapStrapiCollection<Comment>(commentsRes?.data);
  const fallbackRelatedArticles = publishedArticles
    .filter((article) => article.id !== item.id && article.section === item.section)
    .slice(0, 6)
    .map((article) => localizeArticle(article as Article, lang));
  const relatedArticles = (manualRelatedArticles.length
    ? manualRelatedArticles
    : unwrapStrapiCollection<Article>(relatedSectionRes?.data).map((article) => localizeArticle(article, lang))
  ).slice(0, 6);
  const finalRelatedArticles = relatedArticles.length ? relatedArticles : fallbackRelatedArticles;
  const fallbackTopReadArticles = [...publishedArticles]
    .filter((article) => article.id !== item.id)
    .sort((left, right) => {
      const viewDelta = (right.viewCount || 0) - (left.viewCount || 0);
      if (viewDelta !== 0) return viewDelta;
      return Date.parse(right.publishedAt || "") - Date.parse(left.publishedAt || "");
    })
    .slice(0, 4)
    .map((article) => localizeArticle(article as Article, lang));
  const topReadArticlesSource = unwrapStrapiCollection<Article>(topReadRes?.data).map((article) => localizeArticle(article, lang));
  const topReadArticles = topReadArticlesSource.length ? topReadArticlesSource : fallbackTopReadArticles;
  const fallbackLatestSidebarItems = publishedArticles
    .filter((article) => article.id !== item.id)
    .slice(0, 4)
    .map((article) => localizeArticle(article as Article, lang));
  const latestSidebarSource = unwrapStrapiCollection<Article>(latestSidebarRes?.data).map((article) => localizeArticle(article, lang));
  const latestSidebarItems = latestSidebarSource.length ? latestSidebarSource : fallbackLatestSidebarItems;
  const rankedMostReadArticles = mergeUniqueArticles(topReadArticles, latestSidebarItems, 4, item.id);
  const mostReadItems = rankedMostReadArticles
    .map((article) => {
      return {
        id: article.id,
        title: article.title,
        shortDescription: article.subtitle || getAuthorLabel(article.authors) || formatDisplayDate(article.publishedAt, lang),
        link: article.slug ? `/a/${article.slug}` : "/archive",
      };
    })
    .filter((entry) => Boolean(entry.title?.trim()));
  const authorDetail =
    unwrapStrapiCollection<Author>(authorRes?.data)[0] ||
    (leadAuthor?.slug ? getFallbackAuthorBySlug(leadAuthor.slug) : null) ||
    leadAuthor;
  const fallbackAuthorPosts = leadAuthor?.slug
    ? publishedArticles
        .filter((article) =>
          article.id !== item.id && unwrapStrapiCollection<Author>(article.authors).some((entry) => entry.slug === leadAuthor.slug)
        )
        .slice(0, 3)
        .map((article) => localizeArticle(article as Article, lang))
    : [];
  const authorPostsSource = unwrapStrapiCollection<Article>(authorLatestRes?.data).map((article) => localizeArticle(article, lang));
  const authorPosts = authorPostsSource.length ? authorPostsSource : fallbackAuthorPosts;
  const localizedAuthor = authorDetail ? localizeAuthor(authorDetail, lang) : null;

  const authorLabel =
    lang === "en" ? "Author" :
    lang === "tr" ? "Yazar" :
    lang === "fr" ? "Auteur" :
    lang === "de" ? "Autor" :
    "Autor";
  const guestLabel =
    lang === "en" ? "Guest" :
    lang === "tr" ? "Misafir" :
    lang === "fr" ? "Invite" :
    lang === "de" ? "Gast" :
    "Gost";
  const focusLabel =
    lang === "en" ? "Focus" :
    lang === "tr" ? "Odak" :
    lang === "fr" ? "Focus" :
    lang === "de" ? "Fokus" :
    "Fokus";
  const styleLabel =
    lang === "en" ? "Style" :
    lang === "tr" ? "Stil" :
    lang === "fr" ? "Style" :
    lang === "de" ? "Stil" :
    "Stil";
  const mostReadLabel =
    lang === "en" ? "Most read" :
    lang === "tr" ? "En cok okunan" :
    lang === "fr" ? "Les plus lus" :
    lang === "de" ? "Meistgelesen" :
    "Najčitanije";
  const relatedLabel =
    lang === "en" ? "Related stories" :
    lang === "tr" ? "Benzer yazilar" :
    lang === "fr" ? "Articles lies" :
    lang === "de" ? "Ahnliche texte" :
    "Slični tekstovi";
  const readNextLabel =
    lang === "en" ? "Read next" :
    lang === "tr" ? "Siradaki" :
    lang === "fr" ? "Lire ensuite" :
    lang === "de" ? "Weiterlesen" :
    "Pročitaj sledeće";

  return (
    <>
      <SiteHeader
        lang={lang}
        currentPath={`/a/${params.slug}`}
        activeNav={
          item.section === "news" || item.section === "analysis" || item.section === "interview" || item.section === "column"
            ? item.section
            : null
        }
      />

      <main className="site-main">
        <ArticleViewTracker articleId={item.id} />
        <div className="article-shell">
          <div className="article-layout">
            <div className="article-main">
              <section className="panel article-header">
                <div className="article-header__links">
                  <a className="button-secondary" href={withLang("/", lang)}>{t.backToHome}</a>
                  <div className="site-nav">
                    <a href={withLang("/search", lang)}>{t.navSearch}</a>
                    <a href={withLang("/archive", lang)}>{t.navArchive}</a>
                  </div>
                </div>

                <span className="eyebrow">{getSectionLabel(item.section, lang)}</span>
                <h1 className="article-header__title">{localizedItem.title}</h1>
                {localizedItem.subtitle ? <p className="article-header__subtitle">{localizedItem.subtitle}</p> : null}

                <div className="article-byline">
                  <span>{formatDisplayDate(item.publishedAt, lang)}</span>
                  <span className="article-byline__separator" aria-hidden="true">&bull;</span>
                  <span>{authorLabel}:</span>
                  {authors.length ? (
                    authors.map((author) => (
                      <a key={author.id} className="article-byline__author" href={withLang(`/author/${author.slug}`, lang)}>
                        {author.name}
                      </a>
                    ))
                  ) : (
                    <span className="article-byline__author">Redakcija Avangarda</span>
                  )}
                </div>

                <div className="hero-meta-strip article-meta-strip">
                  {item.focus ? (
                    <div className="hero-meta-chip">
                      <span className="hero-meta-chip__label">{focusLabel}</span>
                      <strong>{item.focus}</strong>
                    </div>
                  ) : null}
                  <div className="hero-meta-chip">
                    <span className="hero-meta-chip__label">{t.heroDate}</span>
                    <strong>{formatDisplayDate(item.publishedAt, lang)}</strong>
                  </div>
                  {item.style ? (
                    <div className="hero-meta-chip">
                      <span className="hero-meta-chip__label">{styleLabel}</span>
                      <strong>{item.style}</strong>
                    </div>
                  ) : null}
                </div>
              </section>

              {item.cover?.url ? (
                <section className="panel article-cover-panel">
                  <img
                    src={getStrapiMediaUrl(item.cover.formats?.large?.url || item.cover.formats?.medium?.url || item.cover.url)}
                    alt={localizedItem.title}
                    className="article-cover-panel__image"
                  />
                </section>
              ) : null}

              {videoUrl ? (
                <section className="panel video-panel">
                  <div className="video-panel__frame">
                    <iframe
                      src={videoUrl}
                      title={localizedItem.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </section>
              ) : null}

              <article className="panel article-body">
                <div className="article-richtext" dangerouslySetInnerHTML={{ __html: articleHtml }} />
              </article>

              <section className="panel info-card article-editorial-note">
                <span className="eyebrow">{t.readMode}</span>
                <h3>{t.readModeTitle}</h3>
                <p>{item.editorNote?.trim() || t.readModeCopy}</p>
              </section>

              {finalRelatedArticles.length ? (
                <section className="section-block article-next">
                  <div className="section-header">
                    <div>
                      <span className="eyebrow">{relatedLabel}</span>
                      <h2 className="section-title">{readNextLabel}</h2>
                    </div>
                    <p className="section-kicker">{getSectionLabel(item.section, lang)}</p>
                  </div>

                  <div className="article-next__grid">
                    {finalRelatedArticles.slice(0, 4).map((article) => (
                      <a key={article.id} href={withLang(`/a/${article.slug}`, lang)} className="panel article-card article-card--compact">
                        <div>
                          <div className="article-card__meta">
                            <span>{getSectionLabel(article.section, lang)}</span>
                            <span>{formatDisplayDate(article.publishedAt, lang)}</span>
                            {getAuthorLabel(article.authors) ? <span>{getAuthorLabel(article.authors)}</span> : null}
                          </div>
                          <h3 className="article-card__title">{article.title}</h3>
                          {article.subtitle ? <p className="article-card__subtitle">{article.subtitle}</p> : null}
                        </div>
                        <span className="button-secondary">{t.readStory}</span>
                      </a>
                    ))}
                  </div>
                </section>
              ) : null}

              <section className="panel comment-card">
                <h3>{t.commentsTitle}</h3>
                <p className="muted-copy">{t.commentsCopy}</p>

                {comments.length ? (
                  <div className="comment-list">
                    {comments.map((comment) => (
                      <article key={comment.id} className="comment-item">
                        <div className="comment-item__meta">
                          <strong>{comment.authorName?.trim() || guestLabel}</strong>
                          {comment.createdAt ? <span>{formatDisplayDate(comment.createdAt, lang)}</span> : null}
                        </div>
                        <p>{comment.content}</p>
                      </article>
                    ))}
                  </div>
                ) : null}

                <form action="/api/comments" method="post" className="comment-form">
                  <input type="hidden" name="slug" value={params.slug} />
                  <input type="hidden" name="lang" value={lang} />
                  <input type="hidden" name="returnTo" value={withLang(`/a/${params.slug}`, lang)} />
                  <input className="field" name="authorName" placeholder={t.commentName} />
                  <input className="field" name="authorEmail" placeholder={t.commentEmail} />
                  <textarea className="textarea" name="content" placeholder={t.commentPlaceholder} rows={5} />
                  <button className="button-ghost" type="submit">{t.sendComment}</button>
                </form>
              </section>
            </div>

            <aside className="article-sidebar">
              {mostReadItems.length ? (
                <section className="panel article-sidebar__panel">
                  <div className="homepage-sidebar__heading">
                    <span className="eyebrow">{mostReadLabel}</span>
                  </div>
                  <div className="article-sidebar__list">
                    {mostReadItems.map((entry, index) => {
                      const href = resolveSidebarHref(entry.link, lang);

                      return href ? (
                        <a key={`${entry.title}-${index}`} href={href} className="article-sidebar__link">
                          <span className="article-sidebar__index">{String(index + 1).padStart(2, "0")}</span>
                          <div>
                            <strong>{entry.title}</strong>
                            {entry.shortDescription ? <p>{entry.shortDescription}</p> : null}
                          </div>
                        </a>
                      ) : null;
                    })}
                  </div>
                </section>
              ) : null}

              {finalRelatedArticles.length ? (
                <section className="panel article-sidebar__panel">
                  <div className="homepage-sidebar__heading">
                    <span className="eyebrow">{relatedLabel}</span>
                  </div>
                  <div className="article-sidebar__list">
                    {finalRelatedArticles.slice(0, 3).map((article) => (
                      <a key={article.id} href={withLang(`/a/${article.slug}`, lang)} className="article-sidebar__link">
                        <div>
                          <strong>{article.title}</strong>
                          <p>{formatDisplayDate(article.publishedAt, lang)}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                </section>
              ) : null}

              {leadAuthor ? (
                <section className="panel article-sidebar__panel article-sidebar__panel--author">
                  <div className="homepage-sidebar__heading">
                    <span className="eyebrow">{authorLabel}</span>
                  </div>

                  <div className="article-sidebar__author">
                    {leadAuthorPhotoUrl ? (
                      <img
                        src={leadAuthorPhotoUrl}
                        alt={leadAuthor.name}
                        className="article-sidebar__author-photo"
                      />
                    ) : (
                      <span className="article-sidebar__initials">{getInitials(leadAuthor.name)}</span>
                    )}
                    <div className="article-sidebar__author-copy">
                      <a href={withLang(`/author/${leadAuthor.slug}`, lang)} className="article-sidebar__author-name">
                        {leadAuthor.name}
                      </a>
                      {localizedAuthor?.bio ? <p>{localizedAuthor.bio}</p> : null}
                    </div>
                  </div>

                  {authorPosts.length ? (
                    <div className="article-sidebar__list">
                      {authorPosts.map((article) => (
                        <a key={article.id} href={withLang(`/a/${article.slug}`, lang)} className="article-sidebar__link">
                          <div>
                            <strong>{article.title}</strong>
                            <p>{formatDisplayDate(article.publishedAt, lang)}</p>
                          </div>
                        </a>
                      ))}
                    </div>
                  ) : null}
                </section>
              ) : null}
            </aside>
          </div>
        </div>
      </main>

      <SiteFooter lang={lang} t={t} />
    </>
  );
}
