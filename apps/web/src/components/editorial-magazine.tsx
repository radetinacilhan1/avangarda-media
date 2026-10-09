"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { Lang } from "@/lib/i18n";
import { withLang } from "@/lib/i18n";
import styles from "./editorial-magazine.module.css";

export type MagazineStory = { id: number; title: string; imageUrl: string };

const copy: Record<Lang, { magazine: string; pause: string; resume: string; stories: string }> = {
  sr: { magazine: "Magazin", pause: "Pauziraj animaciju magazina", resume: "Nastavi animaciju magazina", stories: "Istraži priče" },
  en: { magazine: "Magazine", pause: "Pause the magazine animation", resume: "Resume the magazine animation", stories: "Explore stories" },
  tr: { magazine: "Dergi", pause: "Dergi animasyonunu duraklat", resume: "Dergi animasyonunu sürdür", stories: "Hikâyeleri keşfet" },
  fr: { magazine: "Magazine", pause: "Mettre l’animation du magazine en pause", resume: "Reprendre l’animation du magazine", stories: "Explorer les récits" },
  de: { magazine: "Magazin", pause: "Magazinanimation pausieren", resume: "Magazinanimation fortsetzen", stories: "Geschichten entdecken" },
  es: { magazine: "Revista", pause: "Pausar la animación de la revista", resume: "Reanudar la animación de la revista", stories: "Explorar historias" },
  el: { magazine: "Περιοδικό", pause: "Παύση κίνησης του περιοδικού", resume: "Συνέχιση κίνησης του περιοδικού", stories: "Εξερεύνηση ιστοριών" },
  ar: { magazine: "مجلة", pause: "إيقاف حركة المجلة مؤقتًا", resume: "استئناف حركة المجلة", stories: "اكتشف القصص" }
};

/** A desktop composition using the article images already supplied to the page. */
export function EditorialMagazine({ stories, lang }: { stories: MagazineStory[]; lang: Lang }) {
  const ref = useRef<HTMLElement>(null);
  const [desktop, setDesktop] = useState(false);
  const [reduced, setReduced] = useState(true);
  const [visible, setVisible] = useState(false);
  const [foreground, setForeground] = useState(false);
  const [paused, setPaused] = useState(false);
  const pages = stories.filter(story => story.imageUrl && story.title).slice(0, 3);
  const labels = copy[lang];

  useEffect(() => {
    const wide = window.matchMedia("(min-width: 1101px)");
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      setDesktop(wide.matches);
      setReduced(motion.matches);
      setForeground(document.visibilityState === "visible");
    };
    update();
    wide.addEventListener("change", update);
    motion.addEventListener("change", update);
    document.addEventListener("visibilitychange", update);
    return () => {
      wide.removeEventListener("change", update);
      motion.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  useEffect(() => {
    setVisible(false);
    if (!desktop || !ref.current || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.12 });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [desktop]);

  // No magazine markup or image downloads on single-column/mobile viewports.
  if (!desktop || !pages.length) return null;
  const playing = visible && foreground && !paused && !reduced;

  return <section ref={ref} className={`panel ${styles.magazine}`} data-playing={playing} data-reduced={reduced} aria-label={`Avangarda ${labels.magazine}`}>
    <header className={styles.header}>
      <div><span className={styles.kicker}>{labels.magazine}</span><h2>Avangarda</h2></div>
      {!reduced ? <button type="button" className={styles.control} onClick={() => setPaused(value => !value)} aria-label={paused ? labels.resume : labels.pause} aria-pressed={paused}>
        <span aria-hidden="true">{paused ? "▶" : "Ⅱ"}</span>
      </button> : null}
    </header>
    <div className={styles.stage} aria-hidden="true" dir="ltr">
      <div className={styles.shadow} />
      <div className={styles.underlay}><span>HUMAN RIGHTS<br />RAW AND REAL</span><div className={styles.rules} /><strong>A</strong></div>
      {pages.map((story, index) => <div key={story.id} className={styles.leaf} style={{ "--leaf": index } as CSSProperties}>
        <div className={styles.front}>
          <span className={styles.masthead}>Avangarda</span>
          <span className={styles.issue}>{String(index + 1).padStart(2, "0")} / HUMAN RIGHTS</span>
          <img src={story.imageUrl} alt="" loading="lazy" decoding="async" />
          <strong className={styles.headline} dir={lang === "ar" ? "rtl" : "ltr"}>{story.title}</strong>
          <span className={styles.folio}>RAW AND REAL · {String(index + 1).padStart(2, "0")}</span>
        </div>
        <div className={styles.back}><span className={styles.masthead}>Avangarda</span><div className={styles.rules} /><strong className={styles.initial}>A</strong><span>HUMAN RIGHTS<br />RAW AND REAL</span></div>
      </div>)}
      <div className={styles.spine} />
    </div>
    <a className={styles.archive} href={withLang("/archive", lang)}>{labels.stories}<span aria-hidden="true">↗</span></a>
  </section>;
}
