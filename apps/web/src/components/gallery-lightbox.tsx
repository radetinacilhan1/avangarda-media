"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { GalleryImageItem, GalleryUiCopy } from "@/lib/galleries";

type GalleryLightboxProps = {
  images: GalleryImageItem[];
  copy: GalleryUiCopy;
};

export function GalleryLightbox({ images, copy }: GalleryLightboxProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const touchStartX = useRef<number | null>(null);
  const activeImage = useMemo(
    () => (activeIndex == null ? null : images[activeIndex] || null),
    [activeIndex, images]
  );

  const showPrevious = useCallback(() => {
    setActiveIndex((current) => (current == null ? 0 : current === 0 ? images.length - 1 : current - 1));
  }, [images.length]);

  const showNext = useCallback(() => {
    setActiveIndex((current) => (current == null ? 0 : (current + 1) % images.length));
  }, [images.length]);

  useEffect(() => {
    if (activeIndex == null) return undefined;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveIndex(null);
        return;
      }

      if (event.key === "ArrowRight") {
        showNext();
        return;
      }

      if (event.key === "ArrowLeft") {
        showPrevious();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeIndex, images.length, showNext, showPrevious]);

  if (!images.length) return null;

  return (
    <>
      <div className="gallery-grid">
        {images.map((image, index) => (
          <button
            key={image.id}
            type="button"
            className="panel gallery-grid__card"
            onClick={() => setActiveIndex(index)}
            aria-label={`${copy.openImage}: ${image.alt}`}
          >
            <div className="gallery-grid__media">
              <img
                src={image.src}
                alt={image.alt}
                className="gallery-grid__image"
                width={image.width}
                height={image.height}
                draggable={false}
                data-protected-media="true"
                data-downloadable={image.downloadable ? "true" : undefined}
                data-watermark={image.watermark ? "true" : undefined}
              />
            </div>

            {image.caption || image.creditDisplay ? (
              <div className="gallery-grid__meta">
                {image.caption ? <p className="article-media__caption" dir="auto">{image.caption}</p> : null}
                {image.creditDisplay ? (
                  <div className="article-media__credit" dir="auto">
                    <span className="article-media__credit-prefix">{image.creditDisplay.prefix}:</span>
                    <span className="article-media__credit-main">{image.creditDisplay.mainText}</span>
                    {image.creditDisplay.preLinkText ? (
                      <span className="article-media__credit-extra">{image.creditDisplay.preLinkText}</span>
                    ) : null}
                    {image.creditDisplay.linkText && image.creditDisplay.linkUrl ? (
                      <a
                        className="article-media__credit-link"
                        href={image.creditDisplay.linkUrl}
                        target="_blank"
                        rel="noreferrer noopener nofollow"
                        onClick={(event) => event.stopPropagation()}
                      >
                        {image.creditDisplay.linkText}
                      </a>
                    ) : null}
                    {image.creditDisplay.suffixText ? (
                      <span className="article-media__credit-extra">{image.creditDisplay.suffixText}</span>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ) : null}
          </button>
        ))}
      </div>

      {activeImage ? (
        <div
          className="gallery-lightbox-modal"
          role="dialog"
          aria-modal="true"
          aria-label={activeImage.alt}
          onClick={() => setActiveIndex(null)}
        >
          <div className="gallery-lightbox-modal__shell" onClick={(event) => event.stopPropagation()}>
            <div className="gallery-lightbox-modal__toolbar">
              <span className="eyebrow">{copy.label}</span>
              <button type="button" className="button-secondary gallery-lightbox-modal__close" onClick={() => setActiveIndex(null)}>
                {copy.closeLabel}
              </button>
            </div>

            <div className="gallery-lightbox-modal__stage">
              <button
                type="button"
                className="gallery-lightbox-modal__nav gallery-lightbox-modal__nav--prev"
                onClick={showPrevious}
                aria-label={copy.previousLabel}
              >
                <span aria-hidden="true">‹</span>
              </button>

              <figure
                className="gallery-lightbox-modal__figure"
                onTouchStart={(event) => {
                  touchStartX.current = event.touches[0]?.clientX ?? null;
                }}
                onTouchEnd={(event) => {
                  const startX = touchStartX.current;
                  const endX = event.changedTouches[0]?.clientX ?? null;
                  touchStartX.current = null;

                  if (startX == null || endX == null) return;
                  const delta = endX - startX;

                  if (Math.abs(delta) < 42) return;
                  if (delta > 0) {
                    showPrevious();
                    return;
                  }

                  showNext();
                }}
              >
                <img
                  src={activeImage.src}
                  alt={activeImage.alt}
                  className="gallery-lightbox-modal__image"
                  width={activeImage.width}
                  height={activeImage.height}
                  draggable={false}
                  data-protected-media="true"
                  data-downloadable={activeImage.downloadable ? "true" : undefined}
                  data-watermark={activeImage.watermark ? "true" : undefined}
                />

                {activeImage.caption || activeImage.creditDisplay ? (
                  <figcaption className="gallery-lightbox-modal__caption">
                    {activeImage.caption ? <p className="article-media__caption" dir="auto">{activeImage.caption}</p> : null}
                    {activeImage.creditDisplay ? (
                      <div className="article-media__credit" dir="auto">
                        <span className="article-media__credit-prefix">{activeImage.creditDisplay.prefix}:</span>
                        <span className="article-media__credit-main">{activeImage.creditDisplay.mainText}</span>
                        {activeImage.creditDisplay.preLinkText ? (
                          <span className="article-media__credit-extra">{activeImage.creditDisplay.preLinkText}</span>
                        ) : null}
                        {activeImage.creditDisplay.linkText && activeImage.creditDisplay.linkUrl ? (
                          <a
                            className="article-media__credit-link"
                            href={activeImage.creditDisplay.linkUrl}
                            target="_blank"
                            rel="noreferrer noopener nofollow"
                          >
                            {activeImage.creditDisplay.linkText}
                          </a>
                        ) : null}
                        {activeImage.creditDisplay.suffixText ? (
                          <span className="article-media__credit-extra">{activeImage.creditDisplay.suffixText}</span>
                        ) : null}
                      </div>
                    ) : null}
                  </figcaption>
                ) : null}
              </figure>

              <button
                type="button"
                className="gallery-lightbox-modal__nav gallery-lightbox-modal__nav--next"
                onClick={showNext}
                aria-label={copy.nextLabel}
              >
                <span aria-hidden="true">›</span>
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
