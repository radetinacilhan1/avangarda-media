"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type HeroSlide = {
  id: number;
  href: string;
  title: string;
  subtitle?: string;
  sectionLabel: string;
  badges?: { key: string; label: string }[];
  publishedLabel: string;
  styleLabel: string;
  focusLabel: string;
  imageUrl?: string;
  videoUrl?: string | null;
};

type HomeHeroShowcaseProps = {
  slides: HeroSlide[];
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

export function HomeHeroShowcase({ slides, labels, archiveHref, searchHref }: HomeHeroShowcaseProps) {
  const [index, setIndex] = useState(0);
  const [volume, setVolume] = useState(40);
  const [muted, setMuted] = useState(true);
  const [audioOpen, setAudioOpen] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const activeSlide = slides[index] ?? slides[0];
  const hasVideo = Boolean(activeSlide?.videoUrl);

  function syncAudio(nextMuted: boolean, nextVolume: number) {
    setMuted(nextMuted);
    setVolume(nextVolume);

    if (hasVideo && playerReady) {
      applyYouTubeAudioState(iframeRef.current, nextMuted, nextVolume);
    }
  }

  useEffect(() => {
    if (slides.length <= 1) return;

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, ROTATE_MS);

    return () => window.clearInterval(timer);
  }, [slides.length]);

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

  return (
    <article className="panel panel--hero panel--hero-showcase">
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
            <span className="eyebrow hero-showcase__eyebrow">{labels.heroEyebrow}</span>

            <div className="hero-showcase__controls">
              <button
                type="button"
                className="hero-control"
                aria-label={labels.previous}
                onClick={() => setIndex((index - 1 + slides.length) % slides.length)}
              >
                <span className="hero-control__label">{labels.previous}</span>
                <span className="hero-control__icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" focusable="false">
                    <path d="M14.5 6.5L8.5 12L14.5 17.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </button>
              <button
                type="button"
                className="hero-control hero-control--accent"
                aria-label={labels.next}
                onClick={() => setIndex((index + 1) % slides.length)}
              >
                <span className="hero-control__label">{labels.next}</span>
                <span className="hero-control__icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" focusable="false">
                    <path d="M9.5 6.5L15.5 12L9.5 17.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </button>
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
            <div className="hero-showcase__copy">
              <div className="hero-kicker-row">
                <span className="hero-kicker">{activeSlide.sectionLabel}</span>
                {activeSlide.badges?.length ? (
                  <div className="story-status-badges story-status-badges--hero">
                    {activeSlide.badges.map((badge) => (
                      <span
                        key={`${activeSlide.id}-${badge.key}`}
                        className={`story-status-badge story-status-badge--${badge.key}`}
                      >
                        {badge.label}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
              <h1 className="hero-title">{activeSlide.title}</h1>
              <p className="hero-copy">{activeSlide.subtitle || labels.heroSecondary}</p>

              <div className="hero-actions">
                <a className="button-primary" href={activeSlide.href}>
                  {labels.heroPrimary}
                </a>
                <a className="button-secondary" href={searchHref}>
                  {labels.heroSecondary}
                </a>
              </div>

              <div className="hero-meta-strip">
                <div className="hero-meta-chip">
                  <span className="hero-meta-chip__label">{labels.heroFocus}</span>
                  <strong>{activeSlide.focusLabel}</strong>
                </div>
                <div className="hero-meta-chip">
                  <span className="hero-meta-chip__label">{labels.heroDate}</span>
                  <strong>{activeSlide.publishedLabel}</strong>
                </div>
                <div className="hero-meta-chip">
                  <span className="hero-meta-chip__label">{labels.heroStyle}</span>
                  <strong>{activeSlide.styleLabel}</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="hero-showcase__footer">
            <div className="hero-progress-wrap">
              <div className="hero-progress" role="tablist" aria-label={labels.storyTabs}>
                {slides.map((slide, slideIndex) => (
                  <button
                    key={slide.id}
                    type="button"
                    role="tab"
                    aria-selected={slideIndex === index}
                    aria-label={slide.title}
                    className={slideIndex === index ? "hero-progress__segment hero-progress__segment--active" : "hero-progress__segment"}
                    style={{ width: progressWidth }}
                    onClick={() => setIndex(slideIndex)}
                  />
                ))}
              </div>
              <div className="hero-progress-caption">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <span>{String(slides.length).padStart(2, "0")}</span>
              </div>
            </div>

          </div>

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
        </div>
      </div>
    </article>
  );
}
