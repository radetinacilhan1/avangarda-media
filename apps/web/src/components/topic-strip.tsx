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

const TOPIC_STRIP_AUTO_SPEED = 0.013;
const TOPIC_STRIP_MANUAL_DURATION = 520;
const TOPIC_STRIP_WHEEL_PAUSE = 180;

function easeInOutCubic(progress: number) {
  return progress < 0.5
    ? 4 * progress * progress * progress
    : 1 - Math.pow(-2 * progress + 2, 3) / 2;
}

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
  const scrollPositionRef = useRef(0);
  const canAutoScrollRef = useRef(false);
  const pauseUntilRef = useRef(0);
  const manualFrameRef = useRef<number | null>(null);
  const programmaticScrollRef = useRef(false);
  const isTouchingRef = useRef(false);
  const isTouchDraggingRef = useRef(false);
  const touchStartXRef = useRef(0);
  const touchStartYRef = useRef(0);
  const suppressClickUntilRef = useRef(0);
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

  function pauseAutoScroll(duration = 0) {
    pauseUntilRef.current = performance.now() + duration;
  }

  function stopManualAnimation() {
    if (manualFrameRef.current !== null) {
      window.cancelAnimationFrame(manualFrameRef.current);
      manualFrameRef.current = null;
    }
  }

  function setScrollPosition(viewport: HTMLDivElement, next: number, markProgrammatic = true) {
    programmaticScrollRef.current = markProgrammatic;
    scrollPositionRef.current = next;
    viewport.scrollLeft = next;
  }

  function normalizeLoopPosition(viewport: HTMLDivElement) {
    const loopWidth = loopWidthRef.current;
    if (!loopWidth) return;

    let next = scrollPositionRef.current;

    if (Math.abs(viewport.scrollLeft - next) > 1) {
      next = viewport.scrollLeft;
    }

    if (next < loopWidth) {
      next += loopWidth;
    } else if (next >= loopWidth * 2) {
      next -= loopWidth;
    }

    if (Math.abs(viewport.scrollLeft - next) > 0.5 || Math.abs(scrollPositionRef.current - next) > 0.01) {
      setScrollPosition(viewport, next);
    } else {
      scrollPositionRef.current = next;
    }
  }

  function prepareViewportForOffset(viewport: HTMLDivElement, offset: number) {
    const loopWidth = loopWidthRef.current;
    if (!loopWidth) return;

    let next = Math.abs(viewport.scrollLeft - scrollPositionRef.current) > 1
      ? viewport.scrollLeft
      : scrollPositionRef.current;

    if (offset > 0 && next + offset >= loopWidth * 2) {
      next -= loopWidth;
    } else if (offset < 0 && next + offset < loopWidth) {
      next += loopWidth;
    }

    if (Math.abs(viewport.scrollLeft - next) > 0.5 || Math.abs(scrollPositionRef.current - next) > 0.01) {
      setScrollPosition(viewport, next);
    } else {
      scrollPositionRef.current = next;
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
      const canNavigate = visibleItems.length > 1 && loopWidth > 0;

      loopWidthRef.current = canNavigate ? loopWidth : 0;
      canAutoScrollRef.current = canNavigate;
      setCanScrollPrev(canNavigate);
      setCanScrollNext(canNavigate);

      if (!canNavigate) {
        setScrollPosition(viewport, 0);
        return;
      }

      if (viewport.scrollLeft === 0) {
        setScrollPosition(viewport, loopWidth);
      } else {
        scrollPositionRef.current = viewport.scrollLeft;
        normalizeLoopPosition(viewport);
      }
    };

    const scheduleUpdate = () => {
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(updateMetrics);
    };

    const handleTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) return;

      isTouchingRef.current = true;
      isTouchDraggingRef.current = false;
      touchStartXRef.current = touch.clientX;
      touchStartYRef.current = touch.clientY;
      stopManualAnimation();
      pauseAutoScroll(0);
    };

    const handleTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) return;

      const deltaX = touch.clientX - touchStartXRef.current;
      const deltaY = touch.clientY - touchStartYRef.current;

      if (!isTouchDraggingRef.current) {
        if (Math.abs(deltaX) < 4 || Math.abs(deltaX) < Math.abs(deltaY) * 0.7) {
          return;
        }

        isTouchDraggingRef.current = true;
      }

      event.preventDefault();
      stopManualAnimation();
      pauseAutoScroll(0);
      setScrollPosition(viewport, viewport.scrollLeft - deltaX, false);
      touchStartXRef.current = touch.clientX;
      touchStartYRef.current = touch.clientY;
    };

    const handleTouchEnd = () => {
      const didDrag = isTouchDraggingRef.current;
      isTouchingRef.current = false;
      isTouchDraggingRef.current = false;

      if (didDrag) {
        scrollPositionRef.current = viewport.scrollLeft;
        normalizeLoopPosition(viewport);
        suppressClickUntilRef.current = performance.now() + 240;
      }

      pauseAutoScroll(0);
    };

    const handleWheel = () => {
      pauseAutoScroll(TOPIC_STRIP_WHEEL_PAUSE);
    };

    const handleScroll = () => {
      if (programmaticScrollRef.current) {
        programmaticScrollRef.current = false;
        scrollPositionRef.current = viewport.scrollLeft;
        return;
      }

      scrollPositionRef.current = viewport.scrollLeft;

      if (isTouchingRef.current || isTouchDraggingRef.current) {
        return;
      }

      if (canAutoScrollRef.current) {
        normalizeLoopPosition(viewport);
      }

      scrollPositionRef.current = viewport.scrollLeft;
    };

    scheduleUpdate();
    viewport.addEventListener("scroll", handleScroll, { passive: true });
    viewport.addEventListener("touchstart", handleTouchStart, { passive: true });
    viewport.addEventListener("touchmove", handleTouchMove, { passive: false });
    viewport.addEventListener("touchend", handleTouchEnd, { passive: true });
    viewport.addEventListener("touchcancel", handleTouchEnd, { passive: true });
    viewport.addEventListener("wheel", handleWheel, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    resizeObserver?.observe(viewport);
    resizeObserver?.observe(track);

    return () => {
      stopManualAnimation();
      window.cancelAnimationFrame(frameId);
      viewport.removeEventListener("scroll", handleScroll);
      viewport.removeEventListener("touchstart", handleTouchStart);
      viewport.removeEventListener("touchmove", handleTouchMove);
      viewport.removeEventListener("touchend", handleTouchEnd);
      viewport.removeEventListener("touchcancel", handleTouchEnd);
      viewport.removeEventListener("wheel", handleWheel);
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
      const delta = Math.min(time - previousTime, 24);
      previousTime = time;

      if (
        canAutoScrollRef.current &&
        time >= pauseUntilRef.current &&
        !isTouchingRef.current &&
        manualFrameRef.current === null
      ) {
        setScrollPosition(viewport, scrollPositionRef.current + delta * TOPIC_STRIP_AUTO_SPEED);
        normalizeLoopPosition(viewport);
      }

      frameId = window.requestAnimationFrame(tick);
    };

    frameId = window.requestAnimationFrame(tick);
    return () => {
      window.cancelAnimationFrame(frameId);
      stopManualAnimation();
    };
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
    const amount = Math.max(itemSpan, Math.min(viewport.clientWidth * 0.42, itemSpan * 2));
    const offset = direction === "next" ? amount : amount * -1;

    stopManualAnimation();
    pauseAutoScroll(0);
    normalizeLoopPosition(viewport);
    prepareViewportForOffset(viewport, offset);

    const start = Math.abs(viewport.scrollLeft - scrollPositionRef.current) > 1
      ? viewport.scrollLeft
      : scrollPositionRef.current;
    scrollPositionRef.current = start;
    const target = start + offset;
    let animationStart = 0;

    const animate = (time: number) => {
      if (!animationStart) animationStart = time;

      const progress = Math.min(1, (time - animationStart) / TOPIC_STRIP_MANUAL_DURATION);
      const eased = easeInOutCubic(progress);

      setScrollPosition(viewport, start + offset * eased);

      if (progress < 1) {
        manualFrameRef.current = window.requestAnimationFrame(animate);
        return;
      }

      setScrollPosition(viewport, target);
      normalizeLoopPosition(viewport);
      manualFrameRef.current = null;
      pauseAutoScroll(0);
    };

    manualFrameRef.current = window.requestAnimationFrame(animate);
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

      <div
        ref={viewportRef}
        className="topic-strip__marquee"
        onClickCapture={(event) => {
          if (suppressClickUntilRef.current > performance.now()) {
            event.preventDefault();
          }
        }}
      >
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
