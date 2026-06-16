"use client";

import { useEffect, useState } from "react";

const INTRO_SESSION_KEY = "avangarda-intro-seen";
const INTRO_VISIBLE_MS = 1380;
const INTRO_EXIT_MS = 360;
const INTRO_REDUCED_VISIBLE_MS = 640;
const INTRO_REDUCED_EXIT_MS = 180;

export function SiteIntro() {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [motionResolved, setMotionResolved] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return undefined;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPreference = () => setPrefersReducedMotion(mediaQuery.matches);
    syncPreference();
    setMotionResolved(true);

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", syncPreference);
      return () => mediaQuery.removeEventListener("change", syncPreference);
    }

    mediaQuery.addListener(syncPreference);
    return () => mediaQuery.removeListener(syncPreference);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    if (!motionResolved) return undefined;

    let shouldShowIntro = true;

    try {
      const introState = window.sessionStorage.getItem(INTRO_SESSION_KEY);
      shouldShowIntro = introState !== "true";
      if (shouldShowIntro) {
        window.sessionStorage.setItem(INTRO_SESSION_KEY, "pending");
      }
    } catch {
      shouldShowIntro = true;
    }

    if (!shouldShowIntro) return undefined;

    setIsVisible(true);

    const visibleDuration = prefersReducedMotion ? INTRO_REDUCED_VISIBLE_MS : INTRO_VISIBLE_MS;
    const exitDuration = prefersReducedMotion ? INTRO_REDUCED_EXIT_MS : INTRO_EXIT_MS;

    const exitTimer = window.setTimeout(() => {
      setIsExiting(true);
    }, visibleDuration);

    const cleanupTimer = window.setTimeout(() => {
      try {
        window.sessionStorage.setItem(INTRO_SESSION_KEY, "true");
      } catch {}
      setIsVisible(false);
      setIsExiting(false);
    }, visibleDuration + exitDuration);

    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(cleanupTimer);
    };
  }, [motionResolved, prefersReducedMotion]);

  if (!isVisible) return null;

  return (
    <div
      className={`site-intro${isExiting ? " site-intro--exit" : ""}${prefersReducedMotion ? " site-intro--reduced" : ""}`}
      aria-hidden="true"
    >
      <div className="site-intro__core">
        <span className="site-intro__signal" />
        <div className="site-intro__brand">
          <span className="site-intro__title" data-text="Avangarda">
            Avangarda
          </span>
          <span className="site-intro__slogan">HUMAN RIGHTS RAW AND REAL</span>
        </div>
        <div className="site-intro__progress" aria-hidden="true">
          <span className="site-intro__progress-line" />
        </div>
      </div>
    </div>
  );
}
