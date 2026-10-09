"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { Lang } from "@/lib/i18n";
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
  lang?: Lang;
  dir?: "ltr" | "rtl";
  ariaLabel?: string;
  controlsLabel?: string;
  previousLabel?: string;
  nextLabel?: string;
};

const CARD_MIN_WIDTH = 168;
const CARD_GAP = 12;
export const TOPIC_AUTOPLAY_INTERVAL = 6000;
export const TOPIC_MANUAL_COOLDOWN = 10000;

export const TOPIC_PLAYBACK_LABELS: Record<Lang, { pause: string; resume: string; shortPause: string; shortResume: string }> = {
  sr: { pause: "Pauziraj teme", resume: "Nastavi teme", shortPause: "Pauza", shortResume: "Nastavi" },
  en: { pause: "Pause topics", resume: "Resume topics", shortPause: "Pause", shortResume: "Resume" },
  tr: { pause: "Konuları duraklat", resume: "Konuları sürdür", shortPause: "Duraklat", shortResume: "Sürdür" },
  fr: { pause: "Mettre les thèmes en pause", resume: "Reprendre les thèmes", shortPause: "Pause", shortResume: "Reprendre" },
  de: { pause: "Themen pausieren", resume: "Themen fortsetzen", shortPause: "Pause", shortResume: "Weiter" },
  es: { pause: "Pausar temas", resume: "Reanudar temas", shortPause: "Pausa", shortResume: "Reanudar" },
  el: { pause: "Παύση θεμάτων", resume: "Συνέχιση θεμάτων", shortPause: "Παύση", shortResume: "Συνέχεια" },
  ar: { pause: "إيقاف الموضوعات مؤقتًا", resume: "استئناف الموضوعات", shortPause: "إيقاف", shortResume: "متابعة" }
};

export function topicAutoplayDelay(now: number, lastManualInteraction: number | null) {
  return Math.max(TOPIC_AUTOPLAY_INTERVAL,
    lastManualInteraction === null ? 0 : lastManualInteraction + TOPIC_MANUAL_COOLDOWN - now);
}

export function topicAutoplayAllowed(state: {
  canNavigate: boolean; userPaused: boolean; reducedMotion: boolean; inView: boolean;
  pageVisible: boolean; hovered: boolean; focused: boolean; touching: boolean;
}) {
  return state.canNavigate && !state.userPaused && !state.reducedMotion && state.inView
    && state.pageVisible && !state.hovered && !state.focused && !state.touching;
}

export function nextTopicAutoplayIndex(index: number, itemCount: number) {
  return itemCount > 1 ? Math.min(itemCount, Math.max(0, index) + 1) : 0;
}

export function TopicStrip({
  label,
  items,
  lang = "sr",
  dir = "ltr",
  ariaLabel = "Theme navigation",
  controlsLabel = "Topic navigation controls",
  previousLabel = "Previous topics",
  nextLabel = "Next topics"
}: TopicStripProps) {
  const visibleItems = items.filter((item) => item.label.trim() && item.href.trim());
  const sectionRef = useRef<HTMLElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const visibleCountRef = useRef(1);
  const currentIndexRef = useRef(0);
  const targetIndexRef = useRef<number | null>(null);
  const lastManualRef = useRef<number | null>(null);
  const autoplayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resetFrameRef = useRef(0);
  const touchingRef = useRef(false);
  const suppressClickUntilRef = useRef(0);
  const touchStartRef = useRef({ x: 0, y: 0 });
  const didDragRef = useRef(false);
  const [visibleCount, setVisibleCount] = useState(1);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);
  const [inView, setInView] = useState(false);
  const [pageVisible, setPageVisible] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [touching, setTouching] = useState(false);
  const [interactionEpoch, setInteractionEpoch] = useState(0);
  const canNavigate = visibleItems.length > visibleCount;
  const playbackCopy = TOPIC_PLAYBACK_LABELS[lang];
  // Only the visible prefix is copied. The semantic keyboard list stays unique.
  const copies = canNavigate ? visibleItems.slice(0, visibleCount) : [];
  const mayAutoplay = topicAutoplayAllowed({ canNavigate, userPaused, reducedMotion,
    inView, pageVisible, hovered, focused, touching });

  function markInteraction() {
    lastManualRef.current = performance.now();
    if (autoplayTimerRef.current !== null) clearTimeout(autoplayTimerRef.current);
    setInteractionEpoch(value => value + 1);
  }

  function logicalPosition(viewport: HTMLDivElement) {
    return Math.max(0, Math.min(viewport.scrollWidth - viewport.clientWidth,
      dir === "rtl" ? -viewport.scrollLeft : viewport.scrollLeft));
  }

  function itemSpan(viewport: HTMLDivElement) {
    // Layout widths can be fractional at browser zoom. clientWidth rounds them
    // and accumulates error across the complete strip, especially in RTL.
    const card = viewport.querySelector<HTMLAnchorElement>('a[data-copy="false"]');
    return card ? card.getBoundingClientRect().width + CARD_GAP
      : (viewport.getBoundingClientRect().width + CARD_GAP) / visibleCountRef.current;
  }

  function scrollToIndex(index: number, smooth = true) {
    const viewport = viewportRef.current;
    if (!viewport) return;
    // The prefix extends the native scroll range by exactly one visible group.
    const lastIndex = visibleItems.length > visibleCountRef.current ? visibleItems.length : 0;
    const nextIndex = Math.max(0, Math.min(lastIndex, index));
    targetIndexRef.current = nextIndex;
    viewport.scrollTo({ left: (dir === "rtl" ? -1 : 1) * nextIndex * itemSpan(viewport),
      behavior: smooth && !window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "smooth" : "auto" });
  }

  function rebasePrefix() {
    const viewport = viewportRef.current;
    if (!viewport || touchingRef.current) return;
    const prefixOffset = visibleItems.length * itemSpan(viewport);
    if (logicalPosition(viewport) < prefixOffset - 1) return;
    // At this exact offset the copied prefix and the source group are identical.
    // Disable snap for one frame to make rebasing immediate in every direction.
    viewport.dataset.resetting = "true";
    viewport.scrollTo({ left: 0, behavior: "auto" });
    currentIndexRef.current = 0;
    targetIndexRef.current = null;
    window.cancelAnimationFrame(resetFrameRef.current);
    resetFrameRef.current = window.requestAnimationFrame(() => {
      delete viewport.dataset.resetting;
    });
  }

  function freezePendingScroll() {
    const viewport = viewportRef.current;
    if (!viewport || targetIndexRef.current === null) return;
    // Stop an in-flight native smooth transition at its exact current offset.
    // Snap stays off while the pointer/focus/touch interaction is active, so the
    // card under a stationary pointer is not moved to another snap point.
    viewport.dataset.resetting = "true";
    viewport.scrollTo({ left: viewport.scrollLeft, behavior: "auto" });
    targetIndexRef.current = null;
    window.cancelAnimationFrame(resetFrameRef.current);
    resetFrameRef.current = window.requestAnimationFrame(() => {
      delete viewport.dataset.resetting;
    });
  }

  function nudge(direction: "prev" | "next") {
    const viewport = viewportRef.current;
    if (!viewport) return;
    markInteraction();
    const currentIndex = targetIndexRef.current ?? Math.round(logicalPosition(viewport) / itemSpan(viewport));
    scrollToIndex(currentIndex + (direction === "next" ? 1 : -1));
  }

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => { if (media.matches) freezePendingScroll(); setReducedMotion(media.matches); };
    const updateVisibility = () => {
      if (document.visibilityState !== "visible") freezePendingScroll();
      setPageVisible(document.visibilityState === "visible");
    };
    const observer = new IntersectionObserver(entries => {
      const visible = entries.some(entry => entry.isIntersecting && entry.intersectionRatio >= 0.1);
      if (!visible) freezePendingScroll();
      setInView(visible);
    }, { threshold: [0, 0.1] });
    observer.observe(section);
    media.addEventListener("change", updateMotion);
    document.addEventListener("visibilitychange", updateVisibility);
    updateMotion();
    updateVisibility();
    return () => {
      observer.disconnect();
      media.removeEventListener("change", updateMotion);
      document.removeEventListener("visibilitychange", updateVisibility);
    };
  }, [visibleItems.length]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    let resizeFrame = 0;
    let settleTimer: ReturnType<typeof setTimeout> | undefined;

    const updateControls = () => setCanScrollPrev(logicalPosition(viewport) > 1);
    const settle = () => {
      if (touchingRef.current) return;
      rebasePrefix();
      currentIndexRef.current = Math.round(logicalPosition(viewport) / itemSpan(viewport));
      targetIndexRef.current = null;
      updateControls();
    };
    const measure = () => {
      const previousIndex = Math.min(visibleItems.length - 1, currentIndexRef.current);
      const count = Math.max(1, Math.min(visibleItems.length,
        Math.floor((viewport.clientWidth + CARD_GAP) / (CARD_MIN_WIDTH + CARD_GAP))));
      visibleCountRef.current = count;
      setVisibleCount(count);
      viewport.style.setProperty("--topic-visible-count", String(count));
      // Wait for the new prefix to render before restoring the old logical card.
      if (count !== visibleCount) return;
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
    const onWheel = () => { targetIndexRef.current = null; markInteraction(); };
    const observer = new ResizeObserver(onResize);
    observer.observe(viewport);
    viewport.addEventListener("scroll", onScroll, { passive: true });
    viewport.addEventListener("scrollend", settle);
    viewport.addEventListener("wheel", onWheel, { passive: true });
    measure();
    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(resizeFrame);
      window.cancelAnimationFrame(resetFrameRef.current);
      delete viewport.dataset.resetting;
      clearTimeout(settleTimer);
      viewport.removeEventListener("scroll", onScroll);
      viewport.removeEventListener("scrollend", settle);
      viewport.removeEventListener("wheel", onWheel);
    };
  }, [visibleItems.length, dir, visibleCount]);

  useEffect(() => {
    if (!mayAutoplay) return;
    autoplayTimerRef.current = setTimeout(() => {
      const viewport = viewportRef.current;
      if (!viewport || document.visibilityState !== "visible" || touchingRef.current) return;
      rebasePrefix();
      const index = Math.round(logicalPosition(viewport) / itemSpan(viewport));
      scrollToIndex(nextTopicAutoplayIndex(index, visibleItems.length));
      // One timeout per discrete transition; no continuous animation-frame loop.
      setInteractionEpoch(value => value + 1);
    }, topicAutoplayDelay(performance.now(), lastManualRef.current));
    return () => {
      if (autoplayTimerRef.current !== null) clearTimeout(autoplayTimerRef.current);
      autoplayTimerRef.current = null;
    };
  }, [mayAutoplay, interactionEpoch, visibleItems.length, dir, visibleCount]);

  if (!visibleItems.length) return null;

  function focusSource(index: number) {
    viewportRef.current?.querySelector<HTMLAnchorElement>(`a[data-topic-index="${index}"][data-copy="false"]`)?.focus({ preventScroll: true });
  }

  function finishTouch() {
    touchingRef.current = false;
    setTouching(false);
    if (didDragRef.current) suppressClickUntilRef.current = performance.now() + 300;
    markInteraction();
    rebasePrefix();
  }

  function renderCard(item: TopicStripItem, index: number, copy: boolean) {
    return <a key={`${copy ? "copy" : "source"}-${item.id}-${index}`} href={item.href}
      data-topic-index={index} data-copy={String(copy)} aria-hidden={copy ? true : undefined}
      tabIndex={copy ? -1 : undefined} className={`topic-strip__item ${styles.card}`}
      onFocus={copy ? undefined : () => {
        const viewport = viewportRef.current;
        if (!viewport) return;
        markInteraction();
        const first = Math.round(logicalPosition(viewport) / itemSpan(viewport));
        if (index < first) scrollToIndex(index, false);
        else if (index >= first + visibleCountRef.current) scrollToIndex(index - visibleCountRef.current + 1, false);
      }}>
      <span className={`topic-strip__item-kicker ${styles.name}`}>{item.label}</span>
      <span className={`topic-strip__item-text ${styles.link}`}>{item.headline?.trim() || item.label}</span>
      {item.detail?.trim() ? <span className="topic-strip__item-story">{item.detail}</span> : null}
    </a>;
  }

  return (
    <section ref={sectionRef} className={`topic-strip ${styles.strip}`} aria-label={ariaLabel} dir={dir}
      data-autoplay={mayAutoplay ? "running" : "paused"}
      onPointerEnter={event => { if (event.pointerType !== "touch") { setHovered(true); freezePendingScroll(); rebasePrefix(); } }}
      onPointerLeave={event => { if (event.pointerType !== "touch") setHovered(false); }}
      onFocusCapture={() => { setFocused(true); freezePendingScroll(); rebasePrefix(); }}
      onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false); }}>
      <div className="topic-strip__topline">
        <span className="topic-strip__label">{label}</span>
        <div className={`topic-strip__controls ${styles.controls}`} aria-label={controlsLabel}>
          {canNavigate && !reducedMotion ? <button type="button"
            className={`topic-strip__control ${styles.playback}`} aria-pressed={userPaused}
            aria-label={userPaused ? playbackCopy.resume : playbackCopy.pause}
            title={userPaused ? playbackCopy.resume : playbackCopy.pause}
            onClick={() => { markInteraction(); setUserPaused(value => !value); }}>
            <span aria-hidden="true">{userPaused ? "▶" : "Ⅱ"}</span>
            <span>{userPaused ? playbackCopy.shortResume : playbackCopy.shortPause}</span>
          </button> : null}
          <button type="button" className="topic-strip__control" disabled={!canScrollPrev}
            onClick={() => nudge("prev")} aria-label={previousLabel}>
            <span aria-hidden="true">{dir === "rtl" ? ">" : "<"}</span>
          </button>
          <button type="button" className="topic-strip__control" disabled={!canNavigate}
            onClick={() => nudge("next")} aria-label={nextLabel}>
            <span aria-hidden="true">{dir === "rtl" ? "<" : ">"}</span>
          </button>
        </div>
      </div>
      <div ref={viewportRef} className={`topic-strip__marquee ${styles.viewport}`} dir={dir}
        data-interacting={hovered || focused || touching ? "true" : undefined}
        style={{ "--topic-visible-count": visibleCount } as CSSProperties}
        onKeyDown={event => {
          if (event.altKey || event.ctrlKey || event.metaKey) return;
          if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
            event.preventDefault();
            markInteraction();
            if (event.key === "Home" || event.key === "End") {
              focusSource(event.key === "Home" ? 0 : visibleItems.length - 1);
            } else {
              const forward = event.key === (dir === "rtl" ? "ArrowLeft" : "ArrowRight");
              const source = (event.target as HTMLElement).closest<HTMLAnchorElement>('a[data-copy="false"]');
              if (source) focusSource(Math.max(0, Math.min(visibleItems.length - 1,
                Number(source.dataset.topicIndex) + (forward ? 1 : -1))));
              else nudge(forward ? "next" : "prev");
            }
          }
        }}
        onTouchStart={event => {
          freezePendingScroll();
          touchingRef.current = true;
          setTouching(true);
          didDragRef.current = false;
          targetIndexRef.current = null;
          markInteraction();
          const touch = event.touches[0];
          if (touch) touchStartRef.current = { x: touch.clientX, y: touch.clientY };
        }}
        onTouchMove={event => {
          const touch = event.touches[0];
          if (touch && Math.abs(touch.clientX - touchStartRef.current.x) > 8 &&
            Math.abs(touch.clientX - touchStartRef.current.x) > Math.abs(touch.clientY - touchStartRef.current.y)) {
            didDragRef.current = true;
            suppressClickUntilRef.current = performance.now() + 300;
          }
        }}
        onTouchEnd={finishTouch} onTouchCancel={finishTouch}
        onClickCapture={event => { if (suppressClickUntilRef.current > performance.now()) event.preventDefault(); }}>
        <div className={`topic-strip__track ${styles.track}`}>
          {visibleItems.map((item, index) => renderCard(item, index, false))}
          {copies.map((item, index) => renderCard(item, index, true))}
        </div>
      </div>
    </section>
  );
}
