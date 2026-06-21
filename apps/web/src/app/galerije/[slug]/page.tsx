import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { GalleryLightbox } from "@/components/gallery-lightbox";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import {
  fetchGalleryBySlug,
  formatGalleryImageCount,
  getGalleryCopy,
  getGallerySeoDescription,
  getGallerySeoImage,
  getGallerySeoTitle,
} from "@/lib/galleries";
import { getDictionary, getSectionLabel, resolveLang, withLang } from "@/lib/i18n";
import { buildPageTitle, buildSeoMetadata, SITE_OG_IMAGE } from "@/lib/seo";
import { formatDisplayDate } from "@/lib/strapi";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: Record<string, string | string[] | undefined>;
}): Promise<Metadata> {
  const lang = resolveLang(searchParams.lang);
  const copy = getGalleryCopy(lang);
  const gallery = await fetchGalleryBySlug(params.slug, lang);

  if (!gallery) {
    return buildSeoMetadata({
      lang,
      pathname: `/galerije/${params.slug}`,
      title: buildPageTitle(copy.label),
      description: copy.intro,
    });
  }

  return buildSeoMetadata({
    lang,
    pathname: `/galerije/${params.slug}`,
    title: buildPageTitle(getGallerySeoTitle(gallery)),
    description: getGallerySeoDescription(gallery),
    image: getGallerySeoImage(gallery) || SITE_OG_IMAGE,
  });
}

export default async function GalleryPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const lang = resolveLang(searchParams.lang);
  const t = getDictionary(lang);
  const copy = getGalleryCopy(lang);
  const gallery = await fetchGalleryBySlug(params.slug, lang);

  if (!gallery) {
    notFound();
  }

  const copyrightNote = gallery.images
    .map((image) => image.credit?.copyrightNotice?.trim() || "")
    .find(Boolean);

  return (
    <>
      <SiteHeader lang={lang} currentPath={`/galerije/${params.slug}`} activeNav="archive" />

      <main className="site-main">
        <div className="page-shell gallery-page-shell">
          <section className="panel gallery-detail-hero">
            <div className="gallery-detail-hero__actions">
              <a className="button-secondary" href={withLang("/galerije", lang)}>
                {copy.backToArchive}
              </a>
            </div>

            <span className="eyebrow">{copy.label}</span>
            <h1 className="gallery-detail-hero__title">{gallery.title}</h1>
            {gallery.description ? <p className="gallery-detail-hero__copy">{gallery.description}</p> : null}

            <div className="gallery-detail-hero__meta">
              {gallery.galleryDate || gallery.publishedAt ? (
                <div className="hero-meta-chip">
                  <span className="hero-meta-chip__label">{copy.dateLabel}</span>
                  <strong>{formatDisplayDate(gallery.galleryDate || gallery.publishedAt, lang)}</strong>
                </div>
              ) : null}
              {gallery.locationSummary ? (
                <div className="hero-meta-chip">
                  <span className="hero-meta-chip__label">{copy.locationLabel}</span>
                  <strong>{gallery.locationSummary}</strong>
                </div>
              ) : null}
              {gallery.photographerLine ? (
                <div className="hero-meta-chip">
                  <span className="hero-meta-chip__label">{copy.photographerLabel}</span>
                  <strong>{gallery.photographerLine}</strong>
                </div>
              ) : null}
              <div className="hero-meta-chip">
                <span className="hero-meta-chip__label">{copy.label}</span>
                <strong>{formatGalleryImageCount(gallery.images.length, lang)}</strong>
              </div>
            </div>

            {gallery.topics.length ? (
              <div className="gallery-detail-hero__topics">
                {gallery.topics.map((topic) => (
                  <a key={topic.slug} href={withLang(`/topic/${topic.slug}`, lang)} className="hero-tag">
                    {topic.name}
                  </a>
                ))}
              </div>
            ) : null}
          </section>

          <section className="section-block gallery-detail-stage">
            <div className="section-header">
              <div>
                <span className="eyebrow">{copy.label}</span>
                <h2 className="section-title">{gallery.title}</h2>
              </div>
            </div>

            <GalleryLightbox images={gallery.images} copy={copy} />
          </section>

          {copyrightNote ? (
            <section className="panel info-card gallery-copyright-card">
              <span className="eyebrow">{copy.copyrightLabel}</span>
              <p>{copyrightNote}</p>
            </section>
          ) : null}

          {gallery.relatedArticles.length ? (
            <section className="section-block gallery-related-articles">
              <div className="section-header">
                <div>
                  <span className="eyebrow">{copy.relatedArticlesLabel}</span>
                  <h2 className="section-title">{copy.relatedArticlesLabel}</h2>
                </div>
              </div>

              <div className="article-next__grid">
                {gallery.relatedArticles.slice(0, 4).map((article) => (
                  <a key={article.id} href={withLang(`/a/${article.slug}`, lang)} className="panel article-card article-card--compact">
                    <div>
                      <div className="article-card__meta">
                        {article.section ? <span>{getSectionLabel(article.section, lang)}</span> : null}
                        {article.publishedAt ? <span>{formatDisplayDate(article.publishedAt, lang)}</span> : null}
                        {article.author ? <span>{article.author}</span> : null}
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
        </div>
      </main>

      <SiteFooter lang={lang} t={t} />
    </>
  );
}
