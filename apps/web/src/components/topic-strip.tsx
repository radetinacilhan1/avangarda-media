"use client";

import { useEffect, useRef, useState } from "react";

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
  ariaLabel?: string;
  controlsLabel?: string;
  previousLabel?: string;
  nextLabel?: string;
};

const TOPIC_STRIP_AUTO_SPEED = 0.028;
const TOPIC_STRIP_RESUME_DELAY = 2600;

export function TopicStrip({
  label,
  items,
  ariaLabel = "Theme navigation",
  controlsLabel = "Topic navigation controls",
  previousLabel = "Previous topics",
  nextLabel = "Next topics"
}: TopicStripProps) {
  const visibleItems = items.filter((item) => item.label.trim() && item.href.trim());
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const loopWidthRef = useRef(0);
  const canAutoScrollRef = useRef(false);
  const resumeAtRef = useRef(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const renderedItems =
    visibleItems.length > 1
      ? Array.from({ length: 3 }, (_, groupIndex) =>
          visibleItems.map((item, itemIndex) => ({
            item,
            key: `${groupIndex}-${item.id}-${itemIndex}`,
            isDuplicate: groupIndex !== 1
          }))
        ).flat()
      : visibleItems.map((item, itemIndex) => ({
          item,
          key: `0-${item.id}-${itemIndex}`,
          isDuplicate: false
        }));

  function pauseAutoScroll(duration = TOPIC_STRIP_RESUME_DELAY) {
    resumeAtRef.current = performance.now() + duration;
  }

  function normalizeLoopPosition(viewport: HTMLDivElement) {
    const loopWidth = loopWidthRef.current;
    if (!loopWidth) return;

    if (viewport.scrollLeft < loopWidth) {
      viewport.scrollLeft += loopWidth;
    } else if (viewport.scrollLeft >= loopWidth * 2) {
      viewport.scrollLeft -= loopWidth;
    }
  }

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    let frameId = 0;
    const track = viewport.querySelector<HTMLElement>(".topic-strip__track");
    if (!track) return;

    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => {
            scheduleUpdate();
          })
        : null;

    const updateMetrics = () => {
      const copyCount = visibleItems.length > 1 ? 3 : 1;
      const loopWidth = track.scrollWidth / copyCount;
      const canNavigate = visibleItems.length > 1 && loopWidth > viewport.clientWidth + 4;

      loopWidthRef.current = canNavigate ? loopWidth : 0;
      canAutoScrollRef.current = canNavigate;
      setCanScrollPrev(canNavigate);
      setCanScrollNext(canNavigate);

      if (!canNavigate) {
        viewport.scrollLeft = 0;
        return;
      }

      if (viewport.scrollLeft === 0) {
        viewport.scrollLeft = loopWidth;
      } else {
        normalizeLoopPosition(viewport);
      }
    };

    const scheduleUpdate = () => {
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(updateMetrics);
    };

    const pauseForInteraction = () => {
      pauseAutoScroll();
    };

    const handleScroll = () => {
      if (canAutoScrollRef.current) {
        normalizeLoopPosition(viewport);
      }
    };

    scheduleUpdate();
    viewport.addEventListener("scroll", handleScroll, { passive: true });
    viewport.addEventListener("pointerdown", pauseForInteraction, { passive: true });
    viewport.addEventListener("touchstart", pauseForInteraction, { passive: true });
    viewport.addEventListener("wheel", pauseForInteraction, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    resizeObserver?.observe(viewport);
    resizeObserver?.observe(track);

    return () => {
      window.cancelAnimationFrame(frameId);
      viewport.removeEventListener("scroll", handleScroll);
      viewport.removeEventListener("pointerdown", pauseForInteraction);
      viewport.removeEventListener("touchstart", pauseForInteraction);
      viewport.removeEventListener("wheel", pauseForInteraction);
      window.removeEventListener("resize", scheduleUpdate);
      resizeObserver?.disconnect();
    };
  }, [visibleItems.length]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || visibleItems.length < 2) return;

    let frameId = 0;
    let previousTime = 0;

    const tick = (time: number) => {
      if (!previousTime) previousTime = time;
      const delta = time - previousTime;
      previousTime = time;

      if (canAutoScrollRef.current && time >= resumeAtRef.current) {
        viewport.scrollLeft += delta * TOPIC_STRIP_AUTO_SPEED;
        normalizeLoopPosition(viewport);
      }

      frameId = window.requestAnimationFrame(tick);
    };

    frameId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frameId);
  }, [visibleItems.length]);

  if (!visibleItems.length) {
    return null;
  }

  function nudge(direction: "prev" | "next") {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const firstItem = viewport.querySelector<HTMLElement>(".topic-strip__item");
    const track = viewport.querySelector<HTMLElement>(".topic-strip__track");
    const itemWidth = firstItem?.offsetWidth ?? 164;
    const trackStyles = track ? window.getComputedStyle(track) : null;
    const gap = Number.parseFloat(trackStyles?.columnGap || trackStyles?.gap || "12") || 12;
    const itemSpan = itemWidth + gap;
    const visibleCount = Math.max(1, Math.floor((viewport.clientWidth + gap) / itemSpan));
    const amount = Math.max(itemSpan, itemSpan * visibleCount);
    const offset = direction === "next" ? amount : amount * -1;

    pauseAutoScroll();
    normalizeLoopPosition(viewport);
    viewport.scrollBy({ left: offset, behavior: "smooth" });
  }

  return (
    <section className="topic-strip" aria-label={ariaLabel}>
      <div className="topic-strip__topline">
        <span className="topic-strip__label">{label}</span>

        <div className="topic-strip__controls" aria-label={controlsLabel}>
          <button
            type="button"
            className="topic-strip__control"
            disabled={!canScrollPrev}
            onClick={() => nudge("prev")}
            aria-label={previousLabel}
          >
            <span aria-hidden="true">&lt;</span>
          </button>
          <button
            type="button"
            className="topic-strip__control"
            disabled={!canScrollNext}
            onClick={() => nudge("next")}
            aria-label={nextLabel}
          >
            <span aria-hidden="true">&gt;</span>
          </button>
        </div>
      </div>

      <div ref={viewportRef} className="topic-strip__marquee">
        <div className="topic-strip__track">
          {renderedItems.map(({ item, key, isDuplicate }) => (
            <a
              key={key}
              href={item.href}
              className="topic-strip__item"
              aria-hidden={isDuplicate}
              tabIndex={isDuplicate ? -1 : undefined}
            >
              <span className="topic-strip__item-kicker">{item.label}</span>
              <span className="topic-strip__item-text">{item.headline?.trim() || item.label}</span>
              {item.detail?.trim() ? (
                <span className="topic-strip__item-story">{item.detail}</span>
              ) : null}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
