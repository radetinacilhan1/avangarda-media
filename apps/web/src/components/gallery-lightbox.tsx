"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import type { GalleryImageItem, GalleryUiCopy } from "@/lib/galleries";
import styles from "./gallery-lightbox.module.css";

type GalleryLightboxProps = { images: GalleryImageItem[]; copy: GalleryUiCopy };
type TouchOrigin = { x: number; y: number; identifier: number };

function ImageCredit({ image }: { image: GalleryImageItem }) {
  const credit = image.creditDisplay;
  if (!credit) return null;
  return <div className={`article-media__credit ${styles.credit}`} dir="auto">
    <span className="article-media__credit-prefix">{credit.prefix}:</span>
    <span className="article-media__credit-main">{credit.mainText}</span>
    {credit.preLinkText ? <span className="article-media__credit-extra">{credit.preLinkText}</span> : null}
    {credit.linkText && credit.linkUrl ? <a className="article-media__credit-link" href={credit.linkUrl} target="_blank" rel="noreferrer noopener nofollow">{credit.linkText}</a> : null}
    {credit.suffixText ? <span className={`article-media__credit-extra ${styles.creditSuffix}`}>{credit.suffixText}</span> : null}
  </div>;
}

export function GalleryLightbox({ images, copy }: GalleryLightboxProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const captionRef = useRef<HTMLElement | null>(null);
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const touchOrigin = useRef<TouchOrigin | null>(null);
  const activeImage = useMemo(() => activeIndex == null ? null : images[activeIndex] || null, [activeIndex, images]);
  const isOpen = activeImage !== null;
  const close = useCallback(() => setActiveIndex(null), []);
  const showPrevious = useCallback(() => setActiveIndex(current => current == null ? 0 : (current + images.length - 1) % images.length), [images.length]);
  const showNext = useCallback(() => setActiveIndex(current => current == null ? 0 : (current + 1) % images.length), [images.length]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const dialog = dialogRef.current;
    if (!dialog) return undefined;
    // Native modal focus containment keeps the rest of the document inert.
    // Fixed-body locking also preserves the page position in mobile Safari.
    const body = document.body;
    const scrollX = window.scrollX, scrollY = window.scrollY;
    const previous = { overflow: body.style.overflow, position: body.style.position, top: body.style.top, left: body.style.left, right: body.style.right, width: body.style.width, paddingInlineEnd: body.style.paddingInlineEnd };
    const scrollbar = Math.max(0, window.innerWidth - document.documentElement.clientWidth);
    const padding = parseFloat(window.getComputedStyle(body).paddingInlineEnd) || 0;
    Object.assign(body.style, {
      overflow: "hidden", position: "fixed", top: `-${scrollY}px`, left: `-${scrollX}px`, right: "0", width: "100%",
      ...(scrollbar ? { paddingInlineEnd: `${padding + scrollbar}px` } : {}),
    });
    if (!dialog.open) dialog.showModal();
    closeRef.current?.focus({ preventScroll: true });
    return () => {
      if (dialog.open) dialog.close();
      Object.assign(body.style, previous);
      window.scrollTo({ left: scrollX, top: scrollY, behavior: "instant" });
      if (openerRef.current?.isConnected) openerRef.current.focus({ preventScroll: true });
      touchOrigin.current = null;
    };
  }, [isOpen]);

  useEffect(() => {
    if (captionRef.current) captionRef.current.scrollTop = 0;
    touchOrigin.current = null;
  }, [activeIndex]);

  if (!images.length) return null;
  return <>
    <div className={styles.grid}>
      {images.map((image, index) => <figure key={image.id} className={`panel ${styles.card}`}>
        <button type="button" className={styles.imageButton} onClick={event => { openerRef.current = event.currentTarget; setActiveIndex(index); }} aria-label={`${copy.openImage}: ${image.alt}`} aria-haspopup="dialog">
          <img src={image.src} alt={image.alt} className={styles.preview} width={image.width} height={image.height} draggable={false} data-protected-media="true" data-downloadable={image.downloadable ? "true" : undefined} data-watermark={image.watermark ? "true" : undefined} />
        </button>
        {image.caption || image.creditDisplay ? <figcaption className={styles.meta}>
          <div>{image.caption ? <p className={`article-media__caption ${styles.caption}`} dir="auto">{image.caption}</p> : null}</div>
          <ImageCredit image={image} />
        </figcaption> : null}
      </figure>)}
    </div>

    {activeImage ? createPortal(<dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-label={`${copy.openImage}: ${activeImage.alt}`}
      onCancel={event => { event.preventDefault(); close(); }}
      onClose={event => { if (!event.currentTarget.open) close(); }}
      onClick={event => { if (event.target === event.currentTarget) close(); }}
      onKeyDown={event => {
        const rtl = document.documentElement.dir === "rtl";
        if (event.key === "ArrowRight") { event.preventDefault(); rtl ? showPrevious() : showNext(); }
        if (event.key === "ArrowLeft") { event.preventDefault(); rtl ? showNext() : showPrevious(); }
      }}
    >
      <div className={styles.shell}>
        <div className={styles.toolbar}>
          <div className={styles.navigation}>
            <button type="button" className={styles.nav} onClick={showPrevious} aria-label={copy.previousLabel} disabled={images.length < 2}><span className={styles.navIcon} aria-hidden="true">‹</span></button>
            <span className={styles.counter} dir="ltr" aria-live="polite" aria-atomic="true">{activeIndex! + 1} / {images.length}</span>
            <button type="button" className={styles.nav} onClick={showNext} aria-label={copy.nextLabel} disabled={images.length < 2}><span className={styles.navIcon} aria-hidden="true">›</span></button>
          </div>
          <button ref={closeRef} type="button" className={`button-secondary ${styles.close}`} onClick={close}>{copy.closeLabel}</button>
        </div>
        <figure className={styles.figure}>
          <div
            className={styles.stage}
            onTouchStart={event => {
              const touch = event.touches.length === 1 ? event.touches[0] : null;
              touchOrigin.current = touch ? { x: touch.clientX, y: touch.clientY, identifier: touch.identifier } : null;
            }}
            onTouchMove={event => {
              if (event.touches.length !== 1) { touchOrigin.current = null; return; }
              const start = touchOrigin.current, touch = event.touches[0];
              // A vertical gesture remains a scroll even if it later drifts.
              // No preventDefault: vertical scrolling and pinch zoom stay native.
              if (start && Math.abs(touch.clientY - start.y) > 16 && Math.abs(touch.clientY - start.y) >= Math.abs(touch.clientX - start.x)) touchOrigin.current = null;
            }}
            onTouchCancel={() => { touchOrigin.current = null; }}
            onTouchEnd={event => {
              const start = touchOrigin.current;
              touchOrigin.current = null;
              if (!start) return;
              const end = Array.from(event.changedTouches).find(touch => touch.identifier === start.identifier);
              if (!end) return;
              const dx = end.clientX - start.x, dy = end.clientY - start.y;
              if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
              const previous = document.documentElement.dir === "rtl" ? dx < 0 : dx > 0;
              previous ? showPrevious() : showNext();
            }}
          >
            <img src={activeImage.src} alt={activeImage.alt} className={styles.image} width={activeImage.width} height={activeImage.height} draggable={false} data-protected-media="true" data-downloadable={activeImage.downloadable ? "true" : undefined} data-watermark={activeImage.watermark ? "true" : undefined} />
          </div>
          {activeImage.caption || activeImage.creditDisplay ? <figcaption ref={captionRef} className={styles.lightboxCaption} tabIndex={0}>
            {activeImage.caption ? <p className={`article-media__caption ${styles.caption}`} dir="auto">{activeImage.caption}</p> : null}
            <ImageCredit image={activeImage} />
          </figcaption> : null}
        </figure>
      </div>
    </dialog>, document.body) : null}
  </>;
}
