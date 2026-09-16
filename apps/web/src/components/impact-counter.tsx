"use client";

import { useEffect, useRef, useState } from "react";
import { canAnimateCounter, counterFrame, COUNTER_DURATION, markCounterSeen } from "@/lib/visible-counter";

export function ImpactCounter({ id, value, locale }: { id: string; value: number | null; locale: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [frame, setFrame] = useState<{ target: number; value: number } | null>(null);
  const valid = typeof value === "number" && Number.isFinite(value) && value >= 0;
  const format = (n: number) => new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(n);
  const final = valid ? format(value) : "—";

  useEffect(() => {
    // A changed CMS value cancels the previous run. Discard its last frame even
    // when this counter was already seen, so A -> B -> A cannot revive it.
    setFrame(null);
    const element = ref.current;
    if (!element || !valid || !window.IntersectionObserver) return;
    let storage: Storage;
    try { storage = window.sessionStorage; } catch { return; }
    if (!canAnimateCounter(storage, id)) return;
    let raf = 0;
    let started = false;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finish = () => { cancelAnimationFrame(raf); setFrame(null); };
    const motionChange = () => { if (reduced.matches) finish(); };
    reduced.addEventListener("change", motionChange);
    const observer = new IntersectionObserver(entries => {
      if (started || !entries.some(entry => entry.isIntersecting)) return;
      started = true;
      observer.disconnect();
      markCounterSeen(storage, id);
      if (reduced.matches || value === 0) return;
      const start = performance.now();
      setFrame({ target: value, value: 0 });
      const tick = (now: number) => {
        if (now - start >= COUNTER_DURATION) { finish(); return; }
        setFrame({ target: value, value: counterFrame(value, now - start) });
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, { threshold: 0.25 });
    observer.observe(element);
    return () => { observer.disconnect(); cancelAnimationFrame(raf); reduced.removeEventListener("change", motionChange); };
  }, [id, value, valid]);

  return <span className="impact-counter" ref={ref} data-counter-id={id}>
    <span className="sr-only">{final}</span>
    <strong aria-hidden="true" className="impact-counter__reserve">{final}</strong>
    <strong aria-hidden="true" className="impact-counter__value">{frame?.target === value ? format(frame.value) : final}</strong>
  </span>;
}
