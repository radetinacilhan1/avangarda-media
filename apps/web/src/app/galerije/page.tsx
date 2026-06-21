import type { Metadata } from "next";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import {
  fetchGalleryArchive,
  formatGalleryImageCount,
  getGalleryCopy,
  getGalleryCoverImage,
  getGalleryHref,
} from "@/lib/galleries";
import { getDictionary, resolveLang, withLang } from "@/lib/i18n";
import { buildPageTitle, buildSeoMetadata } from "@/lib/seo";
import { formatDisplayDate } from "@/lib/strapi";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}): Promise<Metadata> {
  const lang = resolveLang(searchParams.lang);
  const copy = getGalleryCopy(lang);

  return buildSeoMetadata({
    lang,
    pathname: "/galerije",
    title: buildPageTitle(copy.label),
    description: copy.intro,
  });
}

export default async function GalleriesPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const lang = resolveLang(searchParams.lang);
  const t = getDictionary(lang);
  const copy = getGalleryCopy(lang);
  const galleries = await fetchGalleryArchive(lang);
  const featuredGallery = galleries.find((gallery) => gallery.isFeatured) || galleries[0] || null;
  const archiveItems = featuredGallery ? galleries.filter((gallery) => gallery.id !== featuredGallery.id) : galleries;

  return (
    <>
      <SiteHeader lang={lang} currentPath="/galerije" activeNav="archive" />

      <main className="site-main">
        <div className="page-shell gallery-page-shell">
          <section className="panel subpage-hero gallery-page-hero">
            <span className="eyebrow">{copy.label}</span>
            <h1 className="subpage-hero__title">{copy.title}</h1>
            <p className="subpage-hero__copy">{copy.intro}</p>
          </section>

          {!galleries.length ? (
            <section className="panel empty-state gallery-empty-state">
              <h2>{copy.emptyTitle}</h2>
              <p>{copy.emptyCopy}</p>
            </section>
          ) : null}

          {featuredGallery ? (
            <section className="section-block">
              <div className="section-header">
                <div>
                  <span className="eyebrow">{copy.featuredLabel}</span>
                  <h2 className="section-title">{featuredGallery.title}</h2>
                </div>
              </div>

              <a href={withLang(getGalleryHref(featuredGallery.slug), lang)} className="panel gallery-feature-card">
                <div className="gallery-feature-card__media">
                  {getGalleryCoverImage(featuredGallery) ? (
                    <img
                      src={getGalleryCoverImage(featuredGallery)?.src}
                      alt={getGalleryCoverImage(featuredGallery)?.alt || featuredGallery.title}
                      className="gallery-feature-card__image"
                      draggable={false}
                      data-protected-media="true"
                      data-downloadable={getGalleryCoverImage(featuredGallery)?.downloadable ? "true" : undefined}
                      data-watermark={getGalleryCoverImage(featuredGallery)?.watermark ? "true" : undefined}
                    />
                  ) : (
                    <div className="gallery-feature-card__placeholder" aria-hidden="true">
                      <span>{copy.label}</span>
                    </div>
                  )}
                </div>

                <div className="gallery-feature-card__body">
                  <div className="gallery-feature-card__topline">
                    <span className="eyebrow">{copy.label}</span>
                    <span className="gallery-feature-card__count">{formatGalleryImageCount(featuredGallery.images.length, lang)}</span>
                  </div>

                  <h3>{featuredGallery.title}</h3>
                  {featuredGallery.description ? <p>{featuredGallery.description}</p> : null}

                  <div className="gallery-feature-card__meta">
                    {featuredGallery.galleryDate || featuredGallery.publishedAt ? (
                      <span>{formatDisplayDate(featuredGallery.galleryDate || featuredGallery.publishedAt, lang)}</span>
                    ) : null}
                    {featuredGallery.locationSummary ? <span>{featuredGallery.locationSummary}</span> : null}
                    {featuredGallery.photographerLine ? <span>{featuredGallery.photographerLine}</span> : null}
                  </div>

                  <span className="button-secondary gallery-feature-card__cta">{copy.openGallery}</span>
                </div>
              </a>
            </section>
          ) : null}

          {archiveItems.length ? (
            <section className="section-block">
              <div className="section-header">
                <div>
                  <span className="eyebrow">{copy.label}</span>
                  <h2 className="section-title">{copy.allGalleriesLabel}</h2>
                </div>
              </div>

              <div className="gallery-archive-grid">
                {archiveItems.map((gallery) => {
                  const coverImage = getGalleryCoverImage(gallery);

                  return (
                    <a key={gallery.id} href={withLang(getGalleryHref(gallery.slug), lang)} className="panel gallery-archive-card">
                      <div className="gallery-archive-card__media">
                        {coverImage ? (
                          <img
                            src={coverImage.src}
                            alt={coverImage.alt}
                            className="gallery-archive-card__image"
                            draggable={false}
                            data-protected-media="true"
                            data-downloadable={coverImage.downloadable ? "true" : undefined}
                            data-watermark={coverImage.watermark ? "true" : undefined}
                          />
                        ) : (
                          <div className="gallery-archive-card__placeholder" aria-hidden="true">
                            <span>{copy.label}</span>
                          </div>
                        )}
                      </div>

                      <div className="gallery-archive-card__body">
                        <div className="gallery-archive-card__topline">
                          <span className="eyebrow">{copy.label}</span>
                          <span className="gallery-archive-card__count">{formatGalleryImageCount(gallery.images.length, lang)}</span>
                        </div>

                        <h3>{gallery.title}</h3>
                        {gallery.description ? <p>{gallery.description}</p> : null}

                        <div className="gallery-archive-card__meta">
                          {gallery.galleryDate || gallery.publishedAt ? (
                            <span>{formatDisplayDate(gallery.galleryDate || gallery.publishedAt, lang)}</span>
                          ) : null}
                          {gallery.locationSummary ? <span>{gallery.locationSummary}</span> : null}
                        </div>

                        <span className="button-secondary gallery-archive-card__cta">{copy.openGallery}</span>
                      </div>
                    </a>
                  );
                })}
              </div>
            </section>
          ) : null}
        </div>
      </main>

      <SiteFooter lang={lang} t={t} />
    </>
  );
}
