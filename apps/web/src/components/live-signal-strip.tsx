"use client";

import { useState } from "react";
import styles from "./live-signal-strip.module.css";

type LiveSignalItem = {
  id: number | string;
  href: string;
  label: string;
  text: string;
  imageUrl?: string;
  tone?: "breaking" | "featured" | "trending" | null;
};

type LiveSignalStripProps = {
  label: string;
  items: LiveSignalItem[];
  ariaLabel?: string;
};

export function LiveSignalStrip({ label, items, ariaLabel = "Editorial signals" }: LiveSignalStripProps) {
  // Both repeated groups drop a failed URL together, keeping their widths equal.
  const [failedImages, setFailedImages] = useState<Set<string>>(() => new Set());
  const visibleItems = items.filter((item) => item.text.trim() && item.href.trim());

  if (!visibleItems.length) {
    return null;
  }

  return (
    <section className={`live-strip ${styles.strip}`} aria-label={ariaLabel}>
      <span className="live-strip__label">{label}</span>

      <div className="live-strip__marquee">
        <div className="live-strip__track">
          {[0, 1].map((group) => (
            <div key={group} className="live-strip__group" aria-hidden={group === 1}>
              {visibleItems.map((item) => (
                <a
                  key={`${group}-${item.id}`}
                  href={item.href}
                  className={item.tone ? `live-strip__item live-strip__item--${item.tone}` : "live-strip__item"}
                >
                  <span className="live-strip__item-label">{item.label}</span>
                  <span className={styles.story}>
                    {item.imageUrl && !failedImages.has(item.imageUrl) && (
                      <span className={styles.thumbnail} aria-hidden="true">
                        <img
                          className={styles.image}
                          src={item.imageUrl}
                          alt=""
                          width={28}
                          height={28}
                          loading="lazy"
                          decoding="async"
                          draggable={false}
                          onError={() => setFailedImages((failed) => new Set(failed).add(item.imageUrl!))}
                        />
                      </span>
                    )}
                    <span className="live-strip__item-text">{item.text}</span>
                  </span>
                </a>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
