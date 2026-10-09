"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { getPortfolioTimelineProgress } from "@/lib/portfolio-timeline-progress";

export function PortfolioTimeline({ children }: { children: ReactNode }) {
  const listRef = useRef<HTMLOListElement>(null);
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const measure = () => {
      frame = 0;
      const bounds = list.getBoundingClientRect();
      const dot = list.querySelector<HTMLElement>(".portfolio-timeline__dot")?.getBoundingClientRect();
      const rtl = getComputedStyle(list).direction === "rtl";
      const x = dot?.width ? dot.left + dot.width / 2 - bounds.left : rtl ? bounds.width - 2 : 2;
      list.style.setProperty("--timeline-track-x", `${x}px`);
      list.style.setProperty("--timeline-progress", String(motion.matches ? 1 : getPortfolioTimelineProgress(bounds.top, bounds.height, window.innerHeight)));
    };
    const schedule = () => { if (!frame) frame = window.requestAnimationFrame(measure); };
    const observer = new ResizeObserver(schedule);
    observer.observe(list);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("hashchange", schedule);
    window.addEventListener("pageshow", schedule);
    motion.addEventListener("change", schedule);
    measure();
    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("hashchange", schedule);
      window.removeEventListener("pageshow", schedule);
      motion.removeEventListener("change", schedule);
    };
  }, []);

  return <ol ref={listRef} className="portfolio-timeline portfolio-timeline--progress">{children}</ol>;
}
