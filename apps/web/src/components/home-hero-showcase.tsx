"use client";

import { ArticleFacts } from "@/components/article-facts";
import { ChevronIcon } from "@/components/chevron-icon";
import type { Lang } from "@/lib/i18n";
import styles from "./home-hero-showcase.module.css";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";

type HeroSlide = {
  id: number;
  href: string;
  title: string;
  subtitle?: string;
  sectionLabel: string;
  badges?: { key: string; label: string }[];
  publishedLabel: string;
  publishedAt?: string;
  styleLabel: string;
  focusLabel: string;
  imageUrl?: string;
  videoUrl?: string | null;
  isPlaceholder?: boolean;
};

type HomeHeroShowcaseProps = {
  slides: HeroSlide[];
  dir?: "ltr" | "rtl";
  lang?: Lang;
  labels: {
    heroEyebrow: string;
    heroPrimary: string;
    heroSecondary: string;
    archive: string;
    heroFocus: string;
    heroDate: string;
    heroStyle: string;
    next: string;
    previous: string;
    volumeUp: string;
    volumeDown: string;
    mute: string;
    unmute: string;
    audioControls: string;
    storyTabs: string;
  };
  archiveHref: string;
  searchHref: string;
};

const ROTATE_MS = 45000;

export const HERO_PLAYBACK_LABELS: Record<Lang, { pause: string; resume: string }> = {
  sr: { pause: "Pauziraj naslovne priče", resume: "Nastavi naslovne priče" },
  en: { pause: "Pause headline stories", resume: "Resume headline stories" },
  tr: { pause: "Manşetleri duraklat", resume: "Manşetleri sürdür" },
  fr: { pause: "Mettre les titres en pause", resume: "Reprendre les titres" },
  de: { pause: "Titelgeschichten pausieren", resume: "Titelgeschichten fortsetzen" },
  es: { pause: "Pausar las historias de portada", resume: "Reanudar las historias de portada" },
  el: { pause: "Παύση κύριων ιστοριών", resume: "Συνέχιση κύριων ιστοριών" },
  ar: { pause: "إيقاف القصص الرئيسية مؤقتًا", resume: "استئناف القصص الرئيسية" }
};

function sendYouTubeCommand(iframe: HTMLIFrameElement | null, func: string, args: unknown[] = []) {
  if (!iframe?.contentWindow) return;

  iframe.contentWindow.postMessage(
    JSON.stringify({
      event: "command",
      func,
      args
    }),
    "*"
  );
}

function requestYouTubeListener(iframe: HTMLIFrameElement | null) {
  if (!iframe?.contentWindow) return;

  iframe.contentWindow.postMessage(
    JSON.stringify({
      event: "listening",
      id: iframe.id || "avangarda-hero-player",
      channel: "widget"
    }),
    "*"
  );
}

function applyYouTubeAudioState(
  iframe: HTMLIFrameElement | null,
  muted: boolean,
  volume: number,
  withPlayback = false
) {
  const run = () => {
    if (muted || volume <= 0) {
      sendYouTubeCommand(iframe, "mute");
      sendYouTubeCommand(iframe, "setVolume", [0]);
    } else {
      sendYouTubeCommand(iframe, "unMute");
      sendYouTubeCommand(iframe, "setVolume", [volume]);
    }

    if (withPlayback) {
      sendYouTubeCommand(iframe, "playVideo");
    }
  };

  run();
  window.setTimeout(run, 180);
  window.setTimeout(run, 420);
}

export function HomeHeroShowcase({
  slides,
  dir = "ltr",
  lang = "sr",
  labels,
  archiveHref,
  searchHref
}: HomeHeroShowcaseProps) {
  const [index, setIndex] = useState(0);
  const [volume, setVolume] = useState(40);
  const [muted, setMuted] = useState(true);
  const [audioOpen, setAudioOpen] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const [manuallyPaused, setManuallyPaused] = useState(false);
  const [visible, setVisible] = useState(false);
  const [foreground, setForeground] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const showcaseRef = useRef<HTMLElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const activeSlide = slides[index] ?? slides[0];
  const hasVideo = Boolean(activeSlide?.videoUrl);
  const isRtl = dir === "rtl";
  const navigationControls: Array<{
    key: "previous" | "next";
    label: string;
    accent: boolean;
    iconDirection: "left" | "right";
    onClick: () => void;
  }> = [
    {
      key: "previous",
      label: labels.previous,
      accent: false,
      iconDirection: isRtl ? "right" : "left",
      onClick: () => setIndex((current) => (current - 1 + slides.length) % slides.length)
    },
    {
      key: "next",
      label: labels.next,
      accent: true,
      iconDirection: isRtl ? "left" : "right",
      onClick: () => setIndex((current) => (current + 1) % slides.length)
    }
  ];
  const renderedNavigationControls = isRtl ? [...navigationControls].reverse() : navigationControls;

  function syncAudio(nextMuted: boolean, nextVolume: number) {
    setMuted(nextMuted);
    setVolume(nextVolume);

    if (hasVideo && playerReady) {
      applyYouTubeAudioState(iframeRef.current, nextMuted, nextVolume);
    }
  }

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setReducedMotion(media.matches);
    const updateVisibility = () => setForeground(document.visibilityState === "visible");
    updateMotion();
    updateVisibility();
    media.addEventListener("change", updateMotion);
    document.addEventListener("visibilitychange", updateVisibility);
    const observer = new IntersectionObserver(([entry]) => {
      setVisible(entry.isIntersecting);
    }, { threshold: 0.08 });
    if (showcaseRef.current) observer.observe(showcaseRef.current);
    return () => {
      observer.disconnect();
      media.removeEventListener("change", updateMotion);
      document.removeEventListener("visibilitychange", updateVisibility);
    };
  }, []);

  useEffect(() => {
    if (slides.length <= 1 || !visible || !foreground || reducedMotion || manuallyPaused || hovered || focused) return;
    const timer = window.setTimeout(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, ROTATE_MS);
    return () => window.clearTimeout(timer);
  }, [slides.length, index, visible, foreground, reducedMotion, manuallyPaused, hovered, focused]);

  useEffect(() => {
    if (index >= slides.length) setIndex(0);
  }, [index, slides.length]);

  useEffect(() => {
    setMuted(true);
    setVolume(40);
    setAudioOpen(false);
    setPlayerReady(false);
  }, [index]);

  useEffect(() => {
    function handleYouTubeMessage(event: MessageEvent) {
      if (typeof event.data !== "string") return;
      if (!event.origin.includes("youtube")) return;

      try {
        const payload = JSON.parse(event.data);
        if (payload?.event === "onReady") {
          setPlayerReady(true);
        }
      } catch {
        // Ignore unrelated iframe messages.
      }
    }

    window.addEventListener("message", handleYouTubeMessage);
    return () => window.removeEventListener("message", handleYouTubeMessage);
  }, []);

  useEffect(() => {
    if (!hasVideo || !playerReady) return;

    const timer = window.setTimeout(() => {
      applyYouTubeAudioState(iframeRef.current, true, volume, true);
    }, 360);

    return () => window.clearTimeout(timer);
  }, [hasVideo, playerReady, volume, index]);

  useEffect(() => {
    if (!hasVideo || !playerReady) return;

    const timer = window.setTimeout(() => {
      applyYouTubeAudioState(iframeRef.current, muted, volume);
    }, 100);

    return () => window.clearTimeout(timer);
  }, [hasVideo, playerReady, muted, volume]);

  const progressWidth = useMemo(() => `${100 / Math.max(slides.length, 1)}%`, [slides.length]);

  if (!activeSlide) {
    return null;
  }

  const isPlaceholder = activeSlide.isPlaceholder === true;
  const playbackCopy = HERO_PLAYBACK_LABELS[lang];

  function handleStoryKey(event: KeyboardEvent<HTMLButtonElement>, slideIndex: number) {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    let nextIndex: number;
    if (event.key === "ArrowRight") nextIndex = (slideIndex + (isRtl ? -1 : 1) + slides.length) % slides.length;
    else if (event.key === "ArrowLeft") nextIndex = (slideIndex + (isRtl ? 1 : -1) + slides.length) % slides.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = slides.length - 1;
    else return;
    event.preventDefault();
    setIndex(nextIndex);
    document.getElementById(`home-hero-tab-${slides[nextIndex].id}`)?.focus();
  }

  function renderCopy(slide: HeroSlide, measure = false) {
    const placeholder = slide.isPlaceholder === true;
    return <div
      key={measure ? `measure-${slide.id}` : "active"}
      className={`hero-showcase__copy ${styles.copy}${measure ? ` ${styles.measure}` : ""}`}
      aria-hidden={measure ? true : undefined}
      id={measure ? undefined : "home-hero-story"}
      role={measure || placeholder ? undefined : "tabpanel"}
      aria-labelledby={measure || placeholder ? undefined : `home-hero-tab-${slide.id}`}
    >
      {slide.sectionLabel || slide.badges?.length ? <div className="hero-kicker-row">
        {slide.sectionLabel ? <span className="hero-kicker">{slide.sectionLabel}</span> : null}
        {slide.badges?.length ? <div className="story-status-badges story-status-badges--hero">
          {slide.badges.map((badge) => <span key={`${slide.id}-${badge.key}`} className={`story-status-badge story-status-badge--${badge.key}`}>{badge.label}</span>)}
        </div> : null}
      </div> : null}
      {measure ? <div className="hero-title">{slide.title}</div> : <h1 className="hero-title">{slide.title}</h1>}
      <p className="hero-copy">{slide.subtitle || labels.heroSecondary}</p>
      {!placeholder ? <div className={styles.compactMeta}>
        <time dateTime={slide.publishedAt}>{slide.publishedLabel}</time>
        {slide.styleLabel ? <><span aria-hidden="true">·</span><span>{slide.styleLabel}</span></> : null}
      </div> : null}
      <div className="hero-actions">
        {measure ? <><span className="button-primary">{labels.heroPrimary}</span><span className="button-secondary">{labels.heroSecondary}</span></> : <>
          <a className="button-primary" href={slide.href}>{labels.heroPrimary}</a>
          <a className="button-secondary" href={searchHref}>{labels.heroSecondary}</a>
        </>}
      </div>
      {!placeholder ? <ArticleFacts focus={slide.focusLabel} date={slide.publishedLabel} dateTime={slide.publishedAt} style={slide.styleLabel} labels={{ focus: labels.heroFocus, date: labels.heroDate, style: labels.heroStyle }} /> : null}
    </div>;
  }

  return (
    <article
      className={`panel panel--hero panel--hero-showcase ${styles.showcase}`}
      ref={showcaseRef}
      data-autoplay-paused={manuallyPaused || !visible || !foreground || reducedMotion || hovered || focused}
      onPointerEnter={(event) => { if (event.pointerType === "mouse") setHovered(true); }}
      onPointerLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false); }}
    >
      <div className="hero-showcase__frame">
        {activeSlide.videoUrl ? (
          <div className="hero-video-wrap">
            <iframe
              key={activeSlide.id}
              id={`hero-player-${activeSlide.id}`}
              ref={iframeRef}
              className="hero-video"
              src={activeSlide.videoUrl}
              title={activeSlide.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              onLoad={() => {
                requestYouTubeListener(iframeRef.current);
                window.setTimeout(() => requestYouTubeListener(iframeRef.current), 240);
                window.setTimeout(() => requestYouTubeListener(iframeRef.current), 620);
              }}
            />
          </div>
        ) : activeSlide.imageUrl ? (
          <img className="hero-image" src={activeSlide.imageUrl} alt={activeSlide.title} />
        ) : null}

        <div className="hero-content">
          <div className="hero-showcase__topline">
            {labels.heroEyebrow ? <span className="eyebrow hero-showcase__eyebrow">{labels.heroEyebrow}</span> : null}

            <div className="hero-showcase__controls">
              {!isPlaceholder ? renderedNavigationControls.map((control) => (
                <button
                  key={control.key}
                  type="button"
                  className={control.accent ? "hero-control hero-control--accent" : "hero-control"}
                  aria-label={control.label}
                  onClick={control.onClick}
                >
                  <span className="hero-control__label">{control.label}</span>
                  <span className="hero-control__icon" aria-hidden="true">
                    <ChevronIcon direction={control.iconDirection} />
                  </span>
                </button>
              )) : null}
              <a className="hero-archive-link" href={archiveHref} aria-label={labels.archive}>
                <span className="hero-archive-link__label">{labels.archive}</span>
                <span className="hero-archive-link__icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" focusable="false">
                    <path d="M5.5 5.5h5v5h-5Zm8 0h5v5h-5Zm-8 8h5v5h-5Zm8 0h5v5h-5Z" fill="currentColor" />
                  </svg>
                </span>
              </a>
            </div>
          </div>

          <div className="hero-showcase__body">
            <div className={styles.copyStack}>
              {/* Noninteractive, text-only replicas reserve the tallest story at
                  the current width and text size. They load no duplicate media. */}
              {slides.map((slide) => renderCopy(slide, true))}
              {renderCopy(activeSlide)}
            </div>
          </div>

          {!isPlaceholder ? <div className="hero-showcase__footer">
            <div className="hero-progress-wrap">
              <div className="hero-progress" role="tablist" aria-label={labels.storyTabs}>
                {slides.map((slide, slideIndex) => (
                  <button
                    key={slide.id}
                    type="button"
                    role="tab"
                    id={`home-hero-tab-${slide.id}`}
                    aria-controls="home-hero-story"
                    tabIndex={slideIndex === index ? 0 : -1}
                    aria-selected={slideIndex === index}
                    aria-label={slide.title}
                    className={slideIndex === index ? "hero-progress__segment hero-progress__segment--active" : "hero-progress__segment"}
                    style={{ width: progressWidth }}
                    onClick={() => setIndex(slideIndex)}
                    onKeyDown={(event) => handleStoryKey(event, slideIndex)}
                  />
                ))}
              </div>
              <div className="hero-progress-caption">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <span>{String(slides.length).padStart(2, "0")}</span>
              </div>
            </div>
            {slides.length > 1 ? <button
              type="button"
              className={styles.playback}
              aria-label={manuallyPaused ? playbackCopy.resume : playbackCopy.pause}
              aria-pressed={manuallyPaused}
              onClick={() => setManuallyPaused((paused) => !paused)}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                {manuallyPaused ? <path d="m9 5 10 7-10 7Z" fill="currentColor" /> : <path d="M7 5h4v14H7Zm6 0h4v14h-4Z" fill="currentColor" />}
              </svg>
            </button> : null}
          {hasVideo ? (
            <div className="hero-audio-dock">
              <button
                type="button"
                className="hero-audio-toggle"
                aria-label={labels.audioControls}
                aria-expanded={audioOpen}
                onClick={() => setAudioOpen((open) => !open)}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M14.5 4.5a1 1 0 0 1 1.7.7v13.6a1 1 0 0 1-1.7.7l-4.3-4.2H7a2 2 0 0 1-2-2V10.2a2 2 0 0 1 2-2h3.2l4.3-4.2ZM18.4 8.4a1 1 0 0 1 1.4 0 5 5 0 0 1 0 7.2 1 1 0 0 1-1.4-1.4 3 3 0 0 0 0-4.4 1 1 0 0 1 0-1.4Z" fill="currentColor"/>
                </svg>
              </button>

              <div className={audioOpen ? "hero-audio-panel hero-audio-panel--open" : "hero-audio-panel"}>
                <button
                  type="button"
                  className="hero-control hero-control--dock"
                  onClick={() => {
                    const nextVolume = Math.max(0, volume - 10);
                    syncAudio(nextVolume === 0, nextVolume);
                  }}
                >
                  {labels.volumeDown}
                </button>
                <button
                  type="button"
                  className="hero-control hero-control--dock"
                  onClick={() => {
                    const nextMuted = !muted;
                    syncAudio(nextMuted, volume);
                  }}
                >
                  {muted ? labels.unmute : labels.mute}
                </button>
                <button
                  type="button"
                  className="hero-control hero-control--dock"
                  onClick={() => {
                    const nextVolume = Math.min(100, volume + 10);
                    syncAudio(false, nextVolume);
                  }}
                >
                  {labels.volumeUp}
                </button>
              </div>
            </div>
          ) : null}
          </div> : null}
        </div>
      </div>
    </article>
  );
}
