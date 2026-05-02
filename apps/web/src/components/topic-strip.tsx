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
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    let frameId = 0;
    const track = viewport.querySelector<HTMLElement>(".topic-strip__track");
    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => {
            scheduleUpdate();
          })
        : null;

    const updateControls = () => {
      const maxScrollLeft = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
      const tolerance = 4;

      setCanScrollPrev(viewport.scrollLeft > tolerance);
      setCanScrollNext(maxScrollLeft > tolerance && viewport.scrollLeft < maxScrollLeft - tolerance);
    };

    const scheduleUpdate = () => {
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(updateControls);
    };

    scheduleUpdate();
    viewport.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    resizeObserver?.observe(viewport);

    if (track) {
      resizeObserver?.observe(track);
    }

    return () => {
      window.cancelAnimationFrame(frameId);
      viewport.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      resizeObserver?.disconnect();
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
    const visibleCount = Math.max(1, Math.floor((viewport.clientWidth + gap) / itemSpan));
    const amount = Math.max(itemSpan, itemSpan * visibleCount);
    const offset = direction === "next" ? amount : amount * -1;

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
          {visibleItems.map((item) => (
            <a
              key={item.id}
              href={item.href}
              className="topic-strip__item"
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
