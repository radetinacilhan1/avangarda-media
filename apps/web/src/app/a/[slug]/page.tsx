import type { Metadata } from "next";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ArticleViewTracker } from "@/components/article-view-tracker";
import { SignalBlock } from "@/components/signal-block";
import { getAuthorLabel, localizeArticle, localizeAuthor } from "@/lib/content";
import { fetchPublishedArticles } from "@/lib/editorial";
import { getFallbackArticleBySlug, getFallbackAuthorBySlug } from "@/lib/fallback-content";
import { formatGalleryImageCount, getGalleryCopy, getGalleryHref, normalizeGalleryCollection } from "@/lib/galleries";
import { getDictionary, getSectionLabel, resolveLang, withLang } from "@/lib/i18n";
import {
  type ImageCreditDisplay,
  findImageCreditMatch,
  getImageCreditDisplay,
  normalizeImageCredits,
  resolveCoverImageCredit,
  resolveImageAlt,
  resolveImageCaption,
} from "@/lib/image-credits";
import { buildPageTitle, buildSeoMetadata, getSeoDescription, SITE_OG_IMAGE } from "@/lib/seo";
import { getHeaderSectionNavKey, getSectionAliases, normalizeSectionRecord, normalizeSectionSlug } from "@/lib/sections";
import { getRichTextHtml } from "@/lib/richtext";
import { fetchSignalsForAnalysisArticle } from "@/lib/signals";
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
  relatedGalleries?: unknown;
  coverMeta?: unknown;
  imageCredits?: unknown;
  bodyImages?: unknown;
  cover?: {
    url?: string;
    alternativeText?: string;
    caption?: string;
    width?: number;
    height?: number;
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

function ArticleImageMeta({
  caption,
  credit,
  className,
}: {
  caption?: string;
  credit?: ImageCreditDisplay | null;
  className?: string;
}) {
  const hasCaption = typeof caption === "string" && caption.trim().length > 0;
  if (!hasCaption && !credit) return null;

  return (
    <div className={["article-media__meta", className].filter(Boolean).join(" ")}>
      {hasCaption ? <p className="article-media__caption" dir="auto">{caption}</p> : null}
      {credit ? (
        <div className="article-media__credit" dir="auto">
          <span className="article-media__credit-prefix">{credit.prefix}:</span>
          <span className="article-media__credit-main">{credit.mainText}</span>
          {credit.preLinkText ? <span className="article-media__credit-extra">{credit.preLinkText}</span> : null}
          {credit.linkText && credit.linkUrl ? (
            <a
              className="article-media__credit-link"
              href={credit.linkUrl}
              target="_blank"
              rel="noreferrer noopener nofollow"
            >
              {credit.linkText}
            </a>
          ) : null}
          {credit.suffixText ? <span className="article-media__credit-extra">{credit.suffixText}</span> : null}
        </div>
      ) : null}
    </div>
  );
}

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

export async function generateMetadata({
  params,
  searchParams
}: {
  params: { slug: string };
  searchParams: Record<string, string | string[] | undefined>;
}): Promise<Metadata> {
  const lang = resolveLang(searchParams.lang);
  const articleSlug = encodeURIComponent(params.slug);
  const articleRes = await strapiGet<{ data: unknown[] }>(
    `/api/articles?filters[slug][$eq]=${articleSlug}&populate=cover`
  );
  const directArticle = unwrapStrapiCollection<Article>(articleRes?.data)[0];
  const publishedArticles = await fetchPublishedArticles(lang, 240);
  const articleRecord = directArticle
    ? normalizeSectionRecord(localizeArticle(directArticle as Article, lang))
    : publishedArticles.find((item) => item.slug === params.slug)
      || (() => {
        const fallbackArticle = getFallbackArticleBySlug(params.slug);
        return fallbackArticle ? normalizeSectionRecord(localizeArticle(fallbackArticle as Article, lang)) : undefined;
      })();

  if (!articleRecord) {
    return buildSeoMetadata({
      lang,
      pathname: `/a/${params.slug}`
    });
  }

  const article = localizeArticle(articleRecord as Article, lang);
  const imageUrl = article.cover?.url
    ? getStrapiMediaUrl(article.cover.formats?.large?.url || article.cover.formats?.medium?.url || article.cover.url)
    : SITE_OG_IMAGE;

  return buildSeoMetadata({
    lang,
    pathname: `/a/${params.slug}`,
    title: buildPageTitle(article.title),
    description: article.subtitle?.trim() || article.focus?.trim() || getSeoDescription(lang),
    image: imageUrl
  });
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
  const galleryCopy = getGalleryCopy(lang);
  const articleSlug = encodeURIComponent(params.slug);
  const publishedArticles = await fetchPublishedArticles(lang, 240);
  const articlePopulateQuery = [
    "populate[authors][populate][0]=photo",
    "populate[cover]=*",
    "populate[coverMeta][populate][0]=image",
    "populate[imageCredits][populate][0]=image",
    "populate[bodyImages][populate][0]=image",
    "populate[topics]=*",
    "populate[relatedArticles][populate][authors][populate][0]=photo",
    "populate[relatedArticles][populate][cover]=*",
    "populate[relatedGalleries][populate][authors]=*",
    "populate[relatedGalleries][populate][topics]=*",
    "populate[relatedGalleries][populate][locations]=*",
    "populate[relatedGalleries][populate][images][populate][0]=image",
    "populate[relatedGalleries][populate][shareImage]=*",
  ].join("&");
  const res = await strapiGet<{ data: unknown[] }>(
    `/api/articles?filters[slug][$eq]=${articleSlug}&${articlePopulateQuery}`
  );
  let item: Article | undefined = unwrapStrapiCollection<Article>(res?.data)[0];

  if (!item) {
    const fallbackItem = publishedArticles.find((entry) => entry.slug === params.slug);

    if (fallbackItem) {
      item = {
        ...fallbackItem,
        content: fallbackItem.content || "",
        publishedAt: fallbackItem.publishedAt || "",
        section: fallbackItem.section || "analysis",
      };
    }
  }

  if (item) {
    item = normalizeSectionRecord(item);
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
  const editorialNote = item.editorNote?.trim();
  const authors = unwrapStrapiCollection<Author>(item.authors);
  const leadAuthor = authors[0];
  const leadAuthorPhotoUrl = leadAuthor?.photo?.url
    ? getStrapiMediaUrl(leadAuthor.photo.formats?.small?.url || leadAuthor.photo.formats?.thumbnail?.url || leadAuthor.photo.url)
    : "";
  const videoUrl = getYouTubeEmbedUrl(item.videoEmbedUrl);
  const normalizedImageCredits = normalizeImageCredits(item.imageCredits, lang);
  const coverImageUrl = item.cover?.url
    ? getStrapiMediaUrl(item.cover.formats?.large?.url || item.cover.formats?.medium?.url || item.cover.url)
    : "";
  const coverImageCredit = resolveCoverImageCredit(item.coverMeta, lang) || findImageCreditMatch(coverImageUrl, normalizedImageCredits);
  const coverCaption = resolveImageCaption(coverImageCredit) || item.cover?.caption || "";
  const coverCreditDisplay = getImageCreditDisplay(coverImageCredit, lang);
  const coverAlt = resolveImageAlt({
    existingAlt: item.cover?.alternativeText,
    credit: coverImageCredit,
    articleTitle: localizedItem.title,
  });
  const articleHtml = getRichTextHtml(localizedItem.content, {
    lang,
    articleTitle: localizedItem.title,
    imageCredits: item.imageCredits,
    bodyImages: item.bodyImages,
  });
  const manualRelatedArticles = unwrapStrapiCollection<Article>(item.relatedArticles)
    .filter((article) => article.id !== item.id)
    .map((article) => localizeArticle(article, lang));

  const commentsRes = await strapiGet<{ data: unknown[] }>(
    `/api/comments?filters[article][id][$eq]=${item.id}&sort=createdAt:desc`
  );
  const relatedSectionFilters = getSectionAliases(item.section)
    .map((value, index) => `filters[$or][${index}][section][$eq]=${encodeURIComponent(value)}`)
    .join("&");
  const relatedSectionRes = manualRelatedArticles.length
    ? null
    : await strapiGet<{ data: unknown[] }>(
        `/api/articles?filters[id][$ne]=${item.id}&${relatedSectionFilters}&populate=authors&sort=publishedAt:desc&pagination[pageSize]=6`
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
    .filter((article) => article.id !== item.id && normalizeSectionSlug(article.section) === item.section)
    .slice(0, 6)
    .map((article) => localizeArticle(article as Article, lang));
  const relatedArticles = (manualRelatedArticles.length
    ? manualRelatedArticles
    : unwrapStrapiCollection<Article>(relatedSectionRes?.data).map((article) => localizeArticle(article, lang))
  ).slice(0, 6);
  const relatedGalleries = normalizeGalleryCollection(item.relatedGalleries, lang).slice(0, 2);
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
  const isAnalysisArticle = normalizeSectionSlug(item.section) === "analysis";
  const relatedSignals = isAnalysisArticle
    ? await fetchSignalsForAnalysisArticle(lang, item.id, item.slug || params.slug, 3)
    : [];

  const authorLabel =
    lang === "en" ? "Author" :
    lang === "tr" ? "Yazar" :
    lang === "fr" ? "Auteur" :
    lang === "de" ? "Autor" :
    lang === "es" ? "Autor" :
    lang === "el" ? "Συντάκτης" :
    lang === "ar" ? "الكاتب" :
    "Autor";
  const guestLabel =
    lang === "en" ? "Guest" :
    lang === "tr" ? "Misafir" :
    lang === "fr" ? "Invite" :
    lang === "de" ? "Gast" :
    lang === "es" ? "Invitado" :
    lang === "el" ? "Καλεσμένος" :
    lang === "ar" ? "ضيف" :
    "Gost";
  const focusLabel =
    lang === "en" ? "Focus" :
    lang === "tr" ? "Odak" :
    lang === "fr" ? "Focus" :
    lang === "de" ? "Fokus" :
    lang === "es" ? "Enfoque" :
    lang === "el" ? "Εστίαση" :
    lang === "ar" ? "التركيز" :
    "Fokus";
  const styleLabel =
    lang === "en" ? "Style" :
    lang === "tr" ? "Stil" :
    lang === "fr" ? "Style" :
    lang === "de" ? "Stil" :
    lang === "es" ? "Estilo" :
    lang === "el" ? "Ύφος" :
    lang === "ar" ? "الأسلوب" :
    "Stil";
  const mostReadLabel =
    lang === "en" ? "Most read" :
    lang === "tr" ? "En cok okunan" :
    lang === "fr" ? "Les plus lus" :
    lang === "de" ? "Meistgelesen" :
    lang === "es" ? "Lo más leído" :
    lang === "el" ? "Τα πιο διαβασμένα" :
    lang === "ar" ? "الأكثر قراءة" :
    "Najčitanije";
  const relatedLabel =
    lang === "en" ? "Related stories" :
    lang === "tr" ? "Benzer yazilar" :
    lang === "fr" ? "Articles lies" :
    lang === "de" ? "Ahnliche texte" :
    lang === "es" ? "Textos relacionados" :
    lang === "el" ? "Σχετικά κείμενα" :
    lang === "ar" ? "نصوص مرتبطة" :
    "Slični tekstovi";
  const readNextLabel =
    lang === "en" ? "Read next" :
    lang === "tr" ? "Siradaki" :
    lang === "fr" ? "Lire ensuite" :
    lang === "de" ? "Weiterlesen" :
    lang === "es" ? "Leer a continuación" :
    lang === "el" ? "Διάβασε στη συνέχεια" :
    lang === "ar" ? "اقرأ التالي" :
    "Pročitaj sledeće";
  const editorialDeskLabel =
    lang === "en" ? "Avangarda editorial" :
    lang === "tr" ? "Avangarda editor ekibi" :
    lang === "fr" ? "Redaction Avangarda" :
    lang === "de" ? "Avangarda Redaktion" :
    lang === "es" ? "Redaccion Avangarda" :
    lang === "el" ? "Σύνταξη Avangarda" :
    lang === "ar" ? "هيئة تحرير أفانغاردا" :
    "Redakcija Avangarda";

  return (
    <>
      <SiteHeader
        lang={lang}
        currentPath={`/a/${params.slug}`}
        activeNav={getHeaderSectionNavKey(item.section)}
      />

      <main className="site-main">
        <ArticleViewTracker articleId={item.id} />
        <div className="article-shell">
          <div className="article-layout">
            <div className="article-main">
              <section className="panel article-header">
                <div className="article-header__links">
                  <a className="button-secondary article-header__action article-header__action--home" href={withLang("/", lang)}>
                    {t.backToHome}
                  </a>
                  <div className="article-header__actions" aria-label={t.utilityLabel}>
                    <a className="button-secondary article-header__action" href={withLang("/search", lang)}>
                      {t.navSearch}
                    </a>
                    <a className="button-secondary article-header__action" href={withLang("/archive", lang)}>
                      {t.navArchive}
                    </a>
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
                    <span className="article-byline__author">{editorialDeskLabel}</span>
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
                  <figure className="article-cover-panel__figure">
                    <img
                      src={coverImageUrl}
                      alt={coverAlt}
                      className="article-cover-panel__image"
                      width={item.cover?.width}
                      height={item.cover?.height}
                      draggable={false}
                      data-protected-media="true"
                      data-downloadable={coverImageCredit?.downloadable ? "true" : undefined}
                      data-watermark={coverImageCredit?.watermark ? "true" : undefined}
                    />
                    <ArticleImageMeta
                      caption={coverCaption}
                      credit={coverCreditDisplay}
                      className="article-cover-panel__meta"
                    />
                  </figure>
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

              {isAnalysisArticle ? (
                <SignalBlock
                  lang={lang}
                  label={t.signalLabel}
                  title={t.articleSignalTitle}
                  signals={relatedSignals}
                  ctaLabel={t.signalContextCta}
                  variant="article"
                  currentAnalysisSlug={params.slug}
                />
              ) : null}

              {editorialNote ? (
                <section className="panel info-card article-editorial-note">
                  <span className="eyebrow">{t.readMode}</span>
                  <p>{editorialNote}</p>
                </section>
              ) : null}

              {relatedGalleries.length ? (
                <section className="section-block article-related-galleries">
                  <div className="section-header">
                    <div>
                      <span className="eyebrow">{galleryCopy.relatedGalleryLabel}</span>
                      <h2 className="section-title">{galleryCopy.relatedGalleryLabel}</h2>
                    </div>
                  </div>

                  <div className="gallery-inline-grid">
                    {relatedGalleries.map((gallery) => (
                      <a
                        key={gallery.id}
                        href={withLang(getGalleryHref(gallery.slug), lang)}
                        className="panel gallery-inline-card"
                      >
                        <div className="gallery-inline-card__media">
                          {gallery.coverImage ? (
                            <img
                              src={gallery.coverImage.src}
                              alt={gallery.coverImage.alt}
                              className="gallery-inline-card__image"
                              draggable={false}
                              data-protected-media="true"
                              data-downloadable={gallery.coverImage.downloadable ? "true" : undefined}
                              data-watermark={gallery.coverImage.watermark ? "true" : undefined}
                            />
                          ) : (
                            <div className="gallery-inline-card__placeholder" aria-hidden="true">
                              <span>{galleryCopy.label}</span>
                            </div>
                          )}
                        </div>

                        <div className="gallery-inline-card__body">
                          <div className="gallery-inline-card__topline">
                            <span className="eyebrow">{galleryCopy.label}</span>
                            <span>{formatGalleryImageCount(gallery.images.length, lang)}</span>
                          </div>

                          <h3>{gallery.title}</h3>
                          {gallery.description ? <p>{gallery.description}</p> : null}

                          <div className="gallery-inline-card__meta">
                            {gallery.galleryDate || gallery.publishedAt ? (
                              <span>{formatDisplayDate(gallery.galleryDate || gallery.publishedAt, lang)}</span>
                            ) : null}
                            {gallery.locationSummary ? <span>{gallery.locationSummary}</span> : null}
                          </div>

                          <span className="button-secondary">{galleryCopy.openGallery}</span>
                        </div>
                      </a>
                    ))}
                  </div>
                </section>
              ) : null}

              {finalRelatedArticles.length ? (
                <section className="section-block article-next">
                  <div className="section-header">
                    <div>
                      <span className="eyebrow">{relatedLabel}</span>
                      <h2 className="section-title">{readNextLabel}</h2>
                    </div>
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
                  <div
                    aria-hidden="true"
                    style={{ position: "absolute", left: "-9999px", width: "1px", height: "1px", overflow: "hidden" }}
                  >
                    <label htmlFor="comment-website">Website</label>
                    <input id="comment-website" name="website" tabIndex={-1} autoComplete="off" />
                  </div>
                  <input className="field" name="authorName" placeholder={t.commentName} maxLength={80} autoComplete="name" />
                  <input className="field" name="authorEmail" placeholder={t.commentEmail} maxLength={160} autoComplete="email" inputMode="email" />
                  <textarea className="textarea" name="content" placeholder={t.commentPlaceholder} rows={5} maxLength={2000} />
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
                        draggable={false}
                        data-protected-media="true"
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
