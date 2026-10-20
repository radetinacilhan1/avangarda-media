"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { desktopHeaderFits } from "./site-header-sizing";
import styles from "./site-header.module.css";

/** Measure complete controls, rather than guessing a breakpoint from language. */
export function SiteHeaderLayout({ children }: { children: ReactNode }) {
  const innerRef = useRef<HTMLDivElement>(null);
  const [compact, setCompact] = useState(true);

  useEffect(() => {
    const inner = innerRef.current;
    if (!inner) return;
    const nav = inner.querySelector<HTMLElement>("[data-desktop-nav]");
    const search = inner.querySelector<HTMLElement>(".header-search");
    const button = search?.querySelector<HTMLElement>("button");
    if (!nav || !search || !button) return;
    let frame = 0;
    let disposed = false;
    const measure = () => {
      if (disposed || !window.matchMedia("(min-width: 769px)").matches) return;
      const innerStyle = getComputedStyle(inner);
      const navStyle = getComputedStyle(nav);
      const searchStyle = getComputedStyle(search);
      const bottomline = inner.querySelector<HTMLElement>(".site-header__bottomline");
      const columnGap = parseFloat(innerStyle.columnGap) || 0;
      // Both modes use the same brand track. Never infer the inline budget
      // from the compact bottomline, which occupies a different grid area.
      const brandColumn = parseFloat(innerStyle.gridTemplateColumns) || 248;
      const inlineExtras = (style: CSSStyleDeclaration) =>
        (parseFloat(style.paddingInlineStart) || 0) + (parseFloat(style.paddingInlineEnd) || 0)
        + (parseFloat(style.borderInlineStartWidth) || 0) + (parseFloat(style.borderInlineEndWidth) || 0);
      const navItems = Array.from(nav.children) as HTMLElement[];
      const navigation = navItems.reduce((sum, item) => sum + item.getBoundingClientRect().width, 0)
        + Math.max(0, navItems.length - 1) * (parseFloat(navStyle.columnGap) || 0)
        + inlineExtras(navStyle);
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      const searchMinimum = 9 * rem + button.getBoundingClientRect().width + (parseFloat(searchStyle.columnGap) || 0)
        + inlineExtras(searchStyle);
      inner.style.setProperty("--header-search-min", `${searchMinimum}px`);
      const controlGap = bottomline ? parseFloat(getComputedStyle(bottomline).columnGap) || 14 : 14;
      const available = inner.clientWidth - (parseFloat(innerStyle.paddingInlineStart) || 0)
        - (parseFloat(innerStyle.paddingInlineEnd) || 0) - brandColumn - columnGap;
      setCompact((wasCompact) => !desktopHeaderFits({ available, navigation, search: searchMinimum, gap: controlGap, wasCompact }));
    };
    const schedule = () => {
      if (disposed) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    const observer = new ResizeObserver(schedule);
    [inner, nav, button, ...Array.from(nav.children)].forEach((element) => observer.observe(element));
    window.addEventListener("resize", schedule);
    document.fonts?.addEventListener("loadingdone", schedule);
    document.fonts?.ready.then(schedule);
    measure();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", schedule);
      document.fonts?.removeEventListener("loadingdone", schedule);
    };
  }, [children]);

  return <div ref={innerRef} className={`site-header__inner ${styles.inner}`} data-header-compact={compact ? "true" : "false"}>{children}</div>;
}
