import type { Metadata } from "next";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import styles from "@/components/gallery-pages.module.css";
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

function compactDescription(value?: string | null, maxLength = 220) {
  const paragraph = value?.split(/\n+/).map((part) => part.trim()).find(Boolean);
  if (!paragraph || paragraph.length <= maxLength) return paragraph || null;
  const boundary = paragraph.lastIndexOf(" ", maxLength);
  return `${paragraph.slice(0, boundary > 0 ? boundary : maxLength).trimEnd()}…`;
}

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
  const getCompactMetaLine = (value?: string | null, maxLength = 104) => {
    if (!value) return null;

    const firstSentence =
      value
        .split(/[\n.]+/)
        .map((part) => part.trim())
        .find(Boolean) || value;

    if (firstSentence.length <= maxLength) return firstSentence;

    const softBreak = firstSentence.lastIndexOf(",", maxLength);
    const cutIndex = softBreak > 48 ? softBreak : firstSentence.lastIndexOf(" ", maxLength);
    const safeIndex = cutIndex > 0 ? cutIndex : maxLength;

    return `${firstSentence.slice(0, safeIndex).trim()}…`;
  };

  const lang = resolveLang(searchParams.lang);
  const t = getDictionary(lang);
  const copy = getGalleryCopy(lang);
  const galleries = await fetchGalleryArchive(lang);
  const featuredGallery = galleries.find((gallery) => gallery.isFeatured) || galleries[0] || null;
  const archiveItems = featuredGallery ? galleries.filter((gallery) => gallery.id !== featuredGallery.id) : galleries;
  const featuredSummary = compactDescription(featuredGallery?.description, 300);
  const featuredCover = featuredGallery ? getGalleryCoverImage(featuredGallery) : null;
  const featuredLocationLine = getCompactMetaLine(featuredGallery?.locationSummary);

  return (
    <>
      <SiteHeader lang={lang} currentPath="/galerije" activeNav="archive" />

      <main className="site-main">
        <div className={`page-shell ${styles.shell}`}>
          <section className={`panel ${styles.archiveIntro}`}>
            <h1 className={styles.archiveTitle}>{copy.title}</h1>
            <p>{copy.intro}</p>
          </section>

          {!galleries.length ? (
            <section className="panel empty-state gallery-empty-state">
              <h2>{copy.emptyTitle}</h2>
              <p>{copy.emptyCopy}</p>
            </section>
          ) : null}

          {featuredGallery ? (
            <section aria-labelledby="featured-gallery-title">
              <a href={withLang(getGalleryHref(featuredGallery.slug), lang)} className={`panel ${styles.feature}`} data-gallery-feature>
                <div className={styles.featureMedia}>
                  {featuredCover ? (
                    <img
                      src={featuredCover.src}
                      alt={featuredCover.alt || featuredGallery.title}
                      className={styles.coverImage}
                      draggable={false}
                      data-protected-media="true"
                      data-downloadable={featuredCover.downloadable ? "true" : undefined}
                      data-watermark={featuredCover.watermark ? "true" : undefined}
                    />
                  ) : (
                    <div className={styles.placeholder} aria-hidden="true">
                      <span>{copy.label}</span>
                    </div>
                  )}
                </div>

                <div className={styles.featureBody}>
                  <span className={styles.featureLabel}>{copy.featuredLabel}</span>
                  <h2 className={styles.featureTitle} id="featured-gallery-title">{featuredGallery.title}</h2>
                  {featuredSummary ? <p className={styles.featureSummary}>{featuredSummary}</p> : null}

                  <ul className={styles.cardMeta}>
                    {featuredGallery.galleryDate || featuredGallery.publishedAt ? (
                      <li>{formatDisplayDate(featuredGallery.galleryDate || featuredGallery.publishedAt, lang)}</li>
                    ) : null}
                    {featuredLocationLine ? <li>{featuredLocationLine}</li> : null}
                    <li>{formatGalleryImageCount(featuredGallery.images.length, lang)}</li>
                    {featuredGallery.photographerLine ? <li>{featuredGallery.photographerLine}</li> : null}
                  </ul>

                  <span className={`button-secondary ${styles.featureCta}`}>{copy.openGallery}</span>
                </div>
              </a>
            </section>
          ) : null}

          {archiveItems.length ? (
            <section className="section-block">
              <div className="section-header">
                <div>
                  <h2 className="section-title">{copy.allGalleriesLabel}</h2>
                </div>
              </div>

              <div className={styles.archiveGrid} data-gallery-archive>
                {archiveItems.map((gallery) => {
                  const coverImage = getGalleryCoverImage(gallery);

                  return (
                    <a key={gallery.id} href={withLang(getGalleryHref(gallery.slug), lang)} className={`panel ${styles.archiveCard}`}>
                      <div className={styles.archiveMedia}>
                        {coverImage ? (
                          <img
                            src={coverImage.src}
                            alt={coverImage.alt}
                            className={styles.coverImage}
                            draggable={false}
                            data-protected-media="true"
                            data-downloadable={coverImage.downloadable ? "true" : undefined}
                            data-watermark={coverImage.watermark ? "true" : undefined}
                          />
                        ) : (
                          <div className={styles.placeholder} aria-hidden="true">
                            <span>{copy.label}</span>
                          </div>
                        )}
                      </div>

                      <h3 className={styles.archiveCardTitle}>{gallery.title}</h3>
                      <p className={styles.archiveSummary}>{compactDescription(gallery.description)}</p>
                      <ul className={`${styles.cardMeta} ${styles.archiveMeta}`}>
                        {gallery.galleryDate || gallery.publishedAt ? (
                          <li>{formatDisplayDate(gallery.galleryDate || gallery.publishedAt, lang)}</li>
                        ) : null}
                        {getCompactMetaLine(gallery.locationSummary, 88) ? (
                          <li>{getCompactMetaLine(gallery.locationSummary, 88)}</li>
                        ) : null}
                        <li>{formatGalleryImageCount(gallery.images.length, lang)}</li>
                      </ul>
                      <span className={`button-secondary ${styles.archiveCta}`}>{copy.openGallery}</span>
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
