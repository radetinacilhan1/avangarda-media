"use client";

import { useEffect, useMemo, useRef } from "react";

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
  const loopedItems = useMemo(
    () => (visibleItems.length > 1 ? [...visibleItems, ...visibleItems] : visibleItems),
    [visibleItems]
  );

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || visibleItems.length < 2) return;

    let frameId = 0;
    let previousTime = 0;
    const step = 0.03;

    const animate = (time: number) => {
      if (!previousTime) previousTime = time;
      const delta = time - previousTime;
      previousTime = time;

      const loopWidth = viewport.scrollWidth / 2;
      viewport.scrollLeft += delta * step;

      if (viewport.scrollLeft >= loopWidth) {
        viewport.scrollLeft -= loopWidth;
      }

      frameId = window.requestAnimationFrame(animate);
    };

    frameId = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(frameId);
  }, [visibleItems]);

  if (!visibleItems.length) {
    return null;
  }

  function nudge(direction: "prev" | "next") {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const amount = direction === "next" ? 220 : -220;
    viewport.scrollBy({ left: amount, behavior: "smooth" });
  }

  return (
    <section className="topic-strip" aria-label={ariaLabel}>
      <div className="topic-strip__topline">
        <span className="topic-strip__label">{label}</span>

        <div className="topic-strip__controls" aria-label={controlsLabel}>
          <button
            type="button"
            className="topic-strip__control"
            onClick={() => nudge("prev")}
            aria-label={previousLabel}
          >
            <span aria-hidden="true">&lt;</span>
          </button>
          <button
            type="button"
            className="topic-strip__control"
            onClick={() => nudge("next")}
            aria-label={nextLabel}
          >
            <span aria-hidden="true">&gt;</span>
          </button>
        </div>
      </div>

      <div ref={viewportRef} className="topic-strip__marquee">
        <div className="topic-strip__track">
          {loopedItems.map((item, index) => (
            <a
              key={`${item.id}-${index}`}
              href={item.href}
              className="topic-strip__item"
              aria-hidden={visibleItems.length > 1 && index >= visibleItems.length}
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
