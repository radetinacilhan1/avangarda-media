"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import styles from "./topic-strip.module.css";

type TopicStripItem = {
  id: number | string;
  href: string;
  label: string;
  headline?: string;
  detail?: string;
};

type TopicStripProps = {
  label: string;
  items: TopicStripItem[];
  dir?: "ltr" | "rtl";
  ariaLabel?: string;
  controlsLabel?: string;
  previousLabel?: string;
  nextLabel?: string;
};

const CARD_MIN_WIDTH = 168;
const CARD_GAP = 12;

export function TopicStrip({
  label,
  items,
  dir = "ltr",
  ariaLabel = "Theme navigation",
  controlsLabel = "Topic navigation controls",
  previousLabel = "Previous topics",
  nextLabel = "Next topics"
}: TopicStripProps) {
  const visibleItems = items.filter((item) => item.label.trim() && item.href.trim());
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const visibleCountRef = useRef(1);
  const targetIndexRef = useRef<number | null>(null);
  const suppressClickUntilRef = useRef(0);
  const touchStartRef = useRef({ x: 0, y: 0 });
  const [visibleCount, setVisibleCount] = useState(1);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  function logicalPosition(viewport: HTMLDivElement) {
    return Math.max(0, Math.min(viewport.scrollWidth - viewport.clientWidth,
      dir === "rtl" ? -viewport.scrollLeft : viewport.scrollLeft));
  }

  function itemSpan(viewport: HTMLDivElement) {
    return (viewport.clientWidth + CARD_GAP) / visibleCountRef.current;
  }

  function scrollToIndex(index: number, smooth = true) {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const lastIndex = Math.max(0, visibleItems.length - visibleCountRef.current);
    const nextIndex = Math.max(0, Math.min(lastIndex, index));
    const position = nextIndex * itemSpan(viewport);
    targetIndexRef.current = nextIndex;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    viewport.scrollTo({
      left: dir === "rtl" ? -position : position,
      behavior: smooth && !reduceMotion ? "smooth" : "auto"
    });
  }

  function nudge(direction: "prev" | "next") {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const currentIndex = targetIndexRef.current ?? Math.round(logicalPosition(viewport) / itemSpan(viewport));
    scrollToIndex(currentIndex + (direction === "next" ? 1 : -1));
  }

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    let resizeFrame = 0;
    let settleTimer: ReturnType<typeof setTimeout> | undefined;

    const updateControls = () => {
      const position = logicalPosition(viewport);
      setCanScrollPrev(position > 1);
      setCanScrollNext(position < viewport.scrollWidth - viewport.clientWidth - 1);
    };
    const settle = () => {
      targetIndexRef.current = null;
      updateControls();
    };
    const measure = () => {
      const previousIndex = Math.round(logicalPosition(viewport) / itemSpan(viewport));
      const count = Math.max(1, Math.min(visibleItems.length,
        Math.floor((viewport.clientWidth + CARD_GAP) / (CARD_MIN_WIDTH + CARD_GAP))));
      visibleCountRef.current = count;
      setVisibleCount(count);
      // Apply synchronously so resizing snaps against the new card geometry.
      viewport.style.setProperty("--topic-visible-count", String(count));
      scrollToIndex(previousIndex, false);
      settle();
    };
    const onResize = () => {
      window.cancelAnimationFrame(resizeFrame);
      resizeFrame = window.requestAnimationFrame(measure);
    };
    const onScroll = () => {
      updateControls();
      clearTimeout(settleTimer);
      settleTimer = setTimeout(settle, 180);
    };
    const onUserScroll = () => { targetIndexRef.current = null; };
    const observer = new ResizeObserver(onResize);
    observer.observe(viewport);
    viewport.addEventListener("scroll", onScroll, { passive: true });
    viewport.addEventListener("scrollend", settle);
    viewport.addEventListener("wheel", onUserScroll, { passive: true });
    measure();

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(resizeFrame);
      clearTimeout(settleTimer);
      viewport.removeEventListener("scroll", onScroll);
      viewport.removeEventListener("scrollend", settle);
      viewport.removeEventListener("wheel", onUserScroll);
    };
  }, [visibleItems.length, dir]);

  if (!visibleItems.length) return null;

  return (
    <section className={`topic-strip ${styles.strip}`} aria-label={ariaLabel} dir={dir}>
      <div className="topic-strip__topline">
        <span className="topic-strip__label">{label}</span>
        <div className={`topic-strip__controls ${styles.controls}`} aria-label={controlsLabel}>
          <button type="button" className="topic-strip__control" disabled={!canScrollPrev}
            onClick={() => nudge("prev")} aria-label={previousLabel}>
            <span aria-hidden="true">{dir === "rtl" ? ">" : "<"}</span>
          </button>
          <button type="button" className="topic-strip__control" disabled={!canScrollNext}
            onClick={() => nudge("next")} aria-label={nextLabel}>
            <span aria-hidden="true">{dir === "rtl" ? "<" : ">"}</span>
          </button>
        </div>
      </div>

      <div ref={viewportRef} className={`topic-strip__marquee ${styles.viewport}`} dir={dir}
        style={{ "--topic-visible-count": visibleCount } as CSSProperties}
        onKeyDown={(event) => {
          if (event.altKey || event.ctrlKey || event.metaKey) return;
          if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            event.preventDefault();
            const forward = event.key === (dir === "rtl" ? "ArrowLeft" : "ArrowRight");
            const focusedLink = (event.target as HTMLElement).closest<HTMLAnchorElement>("a[data-topic-index]");
            if (focusedLink) {
              const index = Number(focusedLink.dataset.topicIndex);
              const next = Math.max(0, Math.min(visibleItems.length - 1, index + (forward ? 1 : -1)));
              viewportRef.current?.querySelectorAll<HTMLAnchorElement>("a")[next]?.focus({ preventScroll: true });
            } else {
              nudge(forward ? "next" : "prev");
            }
          } else if (event.key === "Home" || event.key === "End") {
            event.preventDefault();
            const index = event.key === "Home" ? 0 : visibleItems.length - 1;
            scrollToIndex(index);
            viewportRef.current?.querySelectorAll<HTMLAnchorElement>("a")[index]?.focus({ preventScroll: true });
          }
        }}
        onTouchStart={(event) => {
          targetIndexRef.current = null;
          const touch = event.touches[0];
          if (touch) touchStartRef.current = { x: touch.clientX, y: touch.clientY };
        }}
        onTouchMove={(event) => {
          const touch = event.touches[0];
          if (touch && Math.abs(touch.clientX - touchStartRef.current.x) > 8 &&
            Math.abs(touch.clientX - touchStartRef.current.x) > Math.abs(touch.clientY - touchStartRef.current.y)) {
            suppressClickUntilRef.current = performance.now() + 300;
          }
        }}
        onClickCapture={(event) => {
          if (suppressClickUntilRef.current > performance.now()) event.preventDefault();
        }}>
        <div className={`topic-strip__track ${styles.track}`}>
          {visibleItems.map((item, index) => (
            <a key={`${item.id}-${index}`} href={item.href} data-topic-index={index}
              className={`topic-strip__item ${styles.card}`}
              onFocus={() => {
                const viewport = viewportRef.current;
                if (!viewport) return;
                const first = Math.round(logicalPosition(viewport) / itemSpan(viewport));
                if (index < first) scrollToIndex(index, false);
                else if (index >= first + visibleCountRef.current) {
                  scrollToIndex(index - visibleCountRef.current + 1, false);
                }
              }}>
              <span className={`topic-strip__item-kicker ${styles.name}`}>{item.label}</span>
              <span className={`topic-strip__item-text ${styles.link}`}>{item.headline?.trim() || item.label}</span>
              {item.detail?.trim() ? <span className="topic-strip__item-story">{item.detail}</span> : null}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
