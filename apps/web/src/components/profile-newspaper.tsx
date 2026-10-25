"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import type { Lang } from "@/lib/i18n";
import styles from "./profile-newspaper.module.css";

/** The server supplies every word and link; motion only enhances the readable sheet. */
export function NewspaperSheet({ children, className = "", lang }: { children: ReactNode; className?: string; lang: Lang }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const sheet = ref.current;
    if (!sheet) return;
    const header = document.querySelector<HTMLElement>(".site-header");
    const measure = () => sheet.style.setProperty("--profile-header-offset", `${Math.ceil(header?.getBoundingClientRect().height || 0)}px`);
    const resize = new ResizeObserver(measure);
    if (header) resize.observe(header);
    measure();
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const animations = new Set<Animation>();
    let observer: IntersectionObserver | undefined;
    if (!motion.matches) {
      let seen = true;
      try { seen = sessionStorage.getItem("avangarda-paper-opened") === "1"; sessionStorage.setItem("avangarda-paper-opened", "1"); } catch { /* Storage is optional. */ }
      if (!seen) {
        const animation = sheet.animate([
          { transform: "perspective(1800px) rotateX(2deg) translateY(14px)" },
          { transform: "perspective(1800px) rotateX(0deg) translateY(0)" },
        ], { duration: 650, easing: "cubic-bezier(.2,.7,.2,1)" });
        animations.add(animation);
        animation.onfinish = () => animations.delete(animation);
      }
      observer = new IntersectionObserver((entries) => {
        // A preference change can happen after an observer callback is queued.
        if (motion.matches) return;
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          observer?.unobserve(entry.target);
          const animation = entry.target.animate([{ transform: "translateY(10px)" }, { transform: "translateY(0)" }], { duration: 420, easing: "ease-out" });
          animations.add(animation);
          animation.onfinish = () => animations.delete(animation);
        });
      }, { threshold: 0.08 });
      sheet.querySelectorAll("[data-paper-reveal]").forEach((section) => observer?.observe(section));
    }
    const cancelMotion = () => { if (motion.matches) { observer?.disconnect(); animations.forEach((animation) => animation.cancel()); animations.clear(); } };
    const pauseHidden = () => animations.forEach((animation) => document.hidden ? animation.pause() : animation.play());
    motion.addEventListener("change", cancelMotion);
    document.addEventListener("visibilitychange", pauseHidden);
    return () => { resize.disconnect(); observer?.disconnect(); animations.forEach((animation) => animation.cancel()); motion.removeEventListener("change", cancelMotion); document.removeEventListener("visibilitychange", pauseHidden); };
  }, []);
  return <div ref={ref} className={`${styles.sheet} ${className}`} lang={lang} dir={lang === "ar" ? "rtl" : "ltr"}>{children}</div>;
}

export function ProfileMasthead({ name, role, portraitUrl, label, children }: { name: string; role?: string; portraitUrl?: string; label: string; children?: ReactNode }) {
  const length = Array.from(name).length;
  const size = Math.min(22, Math.max(7.5, 158 / Math.max(length, 1)));
  return (
    <header className={styles.masthead}>
      <div className={styles.editionBar}><span>AVANGARDA</span><span className={styles.editionLabel}>{label}</span></div>
      <h1 className={`${styles.name} ${length > 27 ? styles.nameLong : ""}`} style={{ "--name-size": `${size}cqi` } as CSSProperties}>{name}</h1>
      {(portraitUrl || role || children) ? <div className={styles.opening} data-portrait={Boolean(portraitUrl)}>
        {portraitUrl ? <img src={portraitUrl} alt={name} className={styles.portrait} fetchPriority="high" decoding="async" /> : null}
        <div className={styles.openingCopy}>
          {role ? <p className={styles.role}>{role}</p> : null}
          {children}
        </div>
      </div> : null}
    </header>
  );
}

export type EditorialWork = { id: string; title: string; kind: string; href: string; image?: string; imageAlt?: string; description?: string; external?: boolean };

/** Third-party video loads only after the visitor chooses to watch. */
export function NewspaperFilm({ title, description, embedUrl, image, watchHref, watchLabel, archiveHref, archiveLabel, details }: {
  title: string; description?: string; embedUrl?: string | null; image?: string | null; watchHref?: string | null; watchLabel: string;
  archiveHref: string; archiveLabel: string; details: Array<{ label: string; value: string }>;
}) {
  const [playing, setPlaying] = useState(false);
  const playerRef = useRef<HTMLIFrameElement>(null);
  useEffect(() => {
    // Keep keyboard users at the player when its activation button is replaced.
    if (playing) playerRef.current?.focus();
  }, [playing]);
  return <article className={styles.film}>
    {embedUrl ? <div className={styles.filmStage}>{playing ? <iframe ref={playerRef} src={embedUrl} title={title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen /> : <button type="button" onClick={() => setPlaying(true)} aria-label={`${watchLabel}: ${title}`}>{image ? <img src={image} alt="" loading="lazy" decoding="async" /> : null}<span><span aria-hidden="true">▶</span> {watchLabel}</span></button>}</div> : image ? <img className={styles.filmPoster} src={image} alt="" loading="lazy" decoding="async" /> : null}
    <div className={styles.filmCopy}><h3>{title}</h3>{description ? <p>{description}</p> : null}
      {details.length ? <dl>{details.map((detail) => <div key={detail.label}><dt>{detail.label}</dt><dd>{detail.value}</dd></div>)}</dl> : null}
      <div className={styles.actions}>{watchHref ? <a href={watchHref} target="_blank" rel="noopener noreferrer">{watchLabel} ↗</a> : null}<a href={archiveHref}>{archiveLabel} ↗</a></div>
    </div>
  </article>;
}

/** A native scroll area keeps links, touch and keyboard available without autoplay. */
export function EditorialSelection({ items, label, previous, next, lang }: { items: EditorialWork[]; label: string; previous: string; next: string; lang: Lang }) {
  const railRef = useRef<HTMLDivElement>(null);
  if (!items.length) return null;
  const move = (direction: number) => {
    const rail = railRef.current;
    if (!rail) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    rail.scrollBy({ left: direction * (lang === "ar" ? -1 : 1) * rail.clientWidth * 0.85, behavior: reduced ? "auto" : "smooth" });
  };
  return <section className={styles.railSection} aria-label={label}>
    <div className={styles.railHeading}><h2>{label}</h2>{items.length > 2 ? <div className={styles.railControls}>
      <button type="button" className={styles.railButton} aria-label={previous} onClick={() => move(-1)}><span aria-hidden="true">{lang === "ar" ? "→" : "←"}</span></button>
      <button type="button" className={styles.railButton} aria-label={next} onClick={() => move(1)}><span aria-hidden="true">{lang === "ar" ? "←" : "→"}</span></button>
    </div> : null}</div>
    <div className={styles.rail} ref={railRef} tabIndex={0} aria-label={label}>
      {items.map((item) => <a key={item.id} href={item.href} className={styles.railItem} {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
        {item.image ? <img src={item.image} alt={item.imageAlt || ""} className={styles.railImage} loading="lazy" decoding="async" /> : null}
        <span className={styles.railKind}>{item.kind}</span><h3 className={styles.railTitle}>{item.title}</h3>
        {item.description ? <p className={styles.railDescription}>{item.description}</p> : null}
      </a>)}
    </div>
  </section>;
}
