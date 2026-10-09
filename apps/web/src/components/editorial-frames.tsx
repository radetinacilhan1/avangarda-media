"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { MagazineStory } from "@/components/editorial-magazine";
import type { Lang } from "@/lib/i18n";
import styles from "./editorial-frames.module.css";

export type FrameStory = MagazineStory & { href: string };

const copy: Record<Lang, { heading: string; kicker: string; pause: string; resume: string; select: string; read: string }> = {
  sr: { heading: "Kadrovi Avangarde", kicker: "Priče u kadru", pause: "Pauziraj smenjivanje kadrova", resume: "Nastavi smenjivanje kadrova", select: "Prikaži kadar", read: "Pročitaj priču" },
  en: { heading: "Avangarda Frames", kicker: "Stories in focus", pause: "Pause the frame sequence", resume: "Resume the frame sequence", select: "Show frame", read: "Read the story" },
  tr: { heading: "Avangarda Kareleri", kicker: "Kadrajda hikâyeler", pause: "Kare geçişlerini duraklat", resume: "Kare geçişlerini sürdür", select: "Kareyi göster", read: "Hikâyeyi oku" },
  fr: { heading: "Les cadres d’Avangarda", kicker: "Les récits en images", pause: "Mettre le défilement en pause", resume: "Reprendre le défilement", select: "Afficher le cadre", read: "Lire le récit" },
  de: { heading: "Avangarda in Bildern", kicker: "Geschichten im Bild", pause: "Bildfolge pausieren", resume: "Bildfolge fortsetzen", select: "Bild anzeigen", read: "Geschichte lesen" },
  es: { heading: "Encuadres de Avangarda", kicker: "Historias en imágenes", pause: "Pausar la secuencia de imágenes", resume: "Reanudar la secuencia de imágenes", select: "Mostrar imagen", read: "Leer la historia" },
  el: { heading: "Καρέ της Avangarda", kicker: "Ιστορίες σε εικόνες", pause: "Παύση εναλλαγής εικόνων", resume: "Συνέχιση εναλλαγής εικόνων", select: "Προβολή εικόνας", read: "Διαβάστε την ιστορία" },
  ar: { heading: "لقطات أفانغاردا", kicker: "قصص في الصورة", pause: "إيقاف تبديل اللقطات مؤقتًا", resume: "استئناف تبديل اللقطات", select: "عرض اللقطة", read: "اقرأ القصة" }
};

/** A contact sheet of the already supplied homepage photographs and article links. */
export function EditorialFrames({ stories, lang }: { stories: FrameStory[]; lang: Lang }) {
  const ref = useRef<HTMLElement>(null);
  const [desktop, setDesktop] = useState(false);
  const [reduced, setReduced] = useState(true);
  const [visible, setVisible] = useState(false);
  const [foreground, setForeground] = useState(false);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [active, setActive] = useState(0);
  const frames = stories.filter(story => story.title?.trim() && story.imageUrl && story.href).slice(0, 3);
  const labels = copy[lang];
  const selected = frames.length ? active % frames.length : 0;
  const playing = desktop && visible && foreground && !paused && !reduced && !hovered && !focused && frames.length > 1;

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
    if (!desktop || !frames.length || !ref.current || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.12 });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [desktop, frames.length]);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => setActive(value => (value + 1) % frames.length), 9000);
    return () => window.clearInterval(timer);
  }, [playing, frames.length]);

  // Mount no photograph markup on mobile or the single-column layout.
  if (!desktop || !frames.length) return null;

  return <section
    ref={ref}
    className={`panel ${styles.frames}`}
    dir={lang === "ar" ? "rtl" : "ltr"}
    aria-label={labels.heading}
    data-playing={playing}
    data-reduced={reduced}
    data-active-id={frames[selected].id}
    onPointerEnter={() => setHovered(true)}
    onPointerLeave={() => setHovered(false)}
    onFocusCapture={() => setFocused(true)}
    onBlurCapture={event => {
      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false);
    }}
  >
    <header className={styles.header}>
      <div className={styles.heading}>
        <span className={styles.kicker}>{labels.kicker}</span>
        <h2>{labels.heading}</h2>
      </div>
      {!reduced && frames.length > 1 ? <button
        type="button"
        className={styles.control}
        onClick={() => setPaused(value => !value)}
        aria-label={paused ? labels.resume : labels.pause}
        aria-pressed={paused}
      ><span aria-hidden="true">{paused ? "▶" : "Ⅱ"}</span></button> : null}
    </header>

    <div className={styles.contactSheet}>
      {frames.map((story, index) => <button
        key={story.id}
        type="button"
        className={styles.frame}
        style={{ "--frame-index": index } as CSSProperties}
        data-active={selected === index}
        aria-pressed={selected === index}
        aria-label={`${labels.select}: ${story.title}`}
        onClick={() => { setActive(index); setPaused(true); }}
      >
        <span className={styles.photograph}>
          <img src={story.imageUrl} alt="" loading="lazy" decoding="async" />
          <span className={styles.number} aria-hidden="true" dir="ltr">{String(index + 1).padStart(2, "0")}</span>
        </span>
      </button>)}
    </div>

    <div className={styles.captions}>
      {frames.map((story, index) => <div key={story.id} className={styles.caption} data-active={selected === index} aria-hidden={selected !== index}>
        <a className={styles.title} href={story.href} tabIndex={selected === index ? undefined : -1}>{story.title}</a>
        <a className={styles.read} href={story.href} tabIndex={selected === index ? undefined : -1}>
          <span>{labels.read}</span><span aria-hidden="true">↗</span>
        </a>
      </div>)}
    </div>
  </section>;
}
