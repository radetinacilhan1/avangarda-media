"use client";

import { useEffect, useRef, useState } from "react";
import type { HomepageGalleryPreview } from "@/lib/galleries";
import { withLang, type Lang } from "@/lib/i18n";
import styles from "./desktop-gallery-preview.module.css";

const copy: Record<Lang, { heading: string; open: string; previous: string; next: string; pause: string; resume: string }> = {
  sr: { heading: "Galerije", open: "Otvori galeriju", previous: "Prethodna galerija", next: "Sledeća galerija", pause: "Pauziraj smenjivanje galerija", resume: "Nastavi smenjivanje galerija" },
  en: { heading: "Galleries", open: "Open gallery", previous: "Previous gallery", next: "Next gallery", pause: "Pause gallery rotation", resume: "Resume gallery rotation" },
  tr: { heading: "Galeriler", open: "Galeriyi aç", previous: "Önceki galeri", next: "Sonraki galeri", pause: "Galeri geçişlerini duraklat", resume: "Galeri geçişlerini sürdür" },
  fr: { heading: "Galeries", open: "Ouvrir la galerie", previous: "Galerie précédente", next: "Galerie suivante", pause: "Mettre les galeries en pause", resume: "Reprendre les galeries" },
  de: { heading: "Galerien", open: "Galerie öffnen", previous: "Vorherige Galerie", next: "Nächste Galerie", pause: "Galeriewechsel pausieren", resume: "Galeriewechsel fortsetzen" },
  es: { heading: "Galerías", open: "Abrir galería", previous: "Galería anterior", next: "Galería siguiente", pause: "Pausar las galerías", resume: "Reanudar las galerías" },
  el: { heading: "Συλλογές φωτογραφιών", open: "Άνοιγμα συλλογής", previous: "Προηγούμενη συλλογή", next: "Επόμενη συλλογή", pause: "Παύση εναλλαγής συλλογών", resume: "Συνέχιση εναλλαγής συλλογών" },
  ar: { heading: "معارض الصور", open: "افتح المعرض", previous: "المعرض السابق", next: "المعرض التالي", pause: "إيقاف تبديل المعارض مؤقتًا", resume: "استئناف تبديل المعارض" },
};

/** The desktop sidebar breakpoint also governs mounting, photographs and timers. */
export function DesktopGalleryPreview({ galleries, lang }: { galleries: HomepageGalleryPreview[]; lang: Lang }) {
  const ref = useRef<HTMLElement>(null);
  const [desktop, setDesktop] = useState(false);
  const [reduced, setReduced] = useState(true);
  const [visible, setVisible] = useState(false);
  const [foreground, setForeground] = useState(false);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [active, setActive] = useState(0);
  const items = galleries.filter(item => item.title?.trim() && item.slug && item.imageUrl);
  const index = items.length ? active % items.length : 0;
  const labels = copy[lang];
  const playing = desktop && visible && foreground && !paused && !reduced && !hovered && !focused && items.length > 1;

  useEffect(() => {
    const wide = window.matchMedia("(min-width: 1101px)");
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      setDesktop(wide.matches); setReduced(motion.matches); setForeground(document.visibilityState === "visible");
      if (!wide.matches) { setHovered(false); setFocused(false); }
    };
    update();
    wide.addEventListener("change", update);
    motion.addEventListener("change", update);
    document.addEventListener("visibilitychange", update);
    return () => { wide.removeEventListener("change", update); motion.removeEventListener("change", update); document.removeEventListener("visibilitychange", update); };
  }, []);

  useEffect(() => {
    setVisible(false);
    if (!desktop || !items.length || !ref.current || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.12 });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [desktop, items.length]);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => setActive(value => (value + 1) % items.length), 6000);
    return () => window.clearInterval(timer);
  }, [playing, items.length]);

  if (!desktop || !items.length) return null;
  const selected = items[index];
  const choose = (step: number) => { setActive(value => (value + step + items.length) % items.length); setPaused(true); };

  return <section ref={ref} className={`panel ${styles.gallery}`} dir={lang === "ar" ? "rtl" : "ltr"}
    aria-label={labels.heading} data-gallery-preview data-playing={playing} data-active-id={selected.id}
    onPointerEnter={() => setHovered(true)} onPointerLeave={() => setHovered(false)}
    onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false); }}>
    <header className={styles.header}><h2>{labels.heading}</h2>
      {items.length > 1 && !reduced ? <button type="button" className={styles.pause} onClick={() => setPaused(value => !value)} aria-label={paused ? labels.resume : labels.pause} aria-pressed={paused}><span aria-hidden="true">{paused ? "▶" : "Ⅱ"}</span></button> : null}
    </header>
    <a className={styles.photograph} href={withLang(`/galerije/${selected.slug}`, lang)} aria-label={`${labels.open}: ${selected.title}`}>
      <img key={selected.id} src={selected.imageUrl} alt={selected.title} loading="lazy" decoding="async" width="640" height="480" />
    </a>
    <div className={styles.captions} aria-live={playing ? "off" : "polite"} aria-atomic="true">
      {items.map((item, itemIndex) => <div key={item.id} className={styles.caption} data-active={itemIndex === index} aria-hidden={itemIndex !== index}>
        <a className={styles.title} href={withLang(`/galerije/${item.slug}`, lang)} tabIndex={itemIndex === index ? undefined : -1}>{item.title}</a>
        <a className={styles.open} href={withLang(`/galerije/${item.slug}`, lang)} tabIndex={itemIndex === index ? undefined : -1}>{labels.open}<span aria-hidden="true">↗</span></a>
      </div>)}
    </div>
    {items.length > 1 ? <div className={styles.controls}>
      <button type="button" className={styles.previous} onClick={() => choose(-1)} aria-label={labels.previous}><span aria-hidden="true">{lang === "ar" ? "→" : "←"}</span></button>
      <bdi dir="ltr">{index + 1} / {items.length}</bdi>
      <button type="button" className={styles.next} onClick={() => choose(1)} aria-label={labels.next}><span aria-hidden="true">{lang === "ar" ? "←" : "→"}</span></button>
    </div> : null}
  </section>;
}
