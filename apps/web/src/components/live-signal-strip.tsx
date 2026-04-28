type LiveSignalItem = {
  id: number | string;
  href: string;
  label: string;
  text: string;
  tone?: "breaking" | "featured" | "trending" | null;
};

type LiveSignalStripProps = {
  label: string;
  items: LiveSignalItem[];
  ariaLabel?: string;
};

export function LiveSignalStrip({ label, items, ariaLabel = "Editorial signals" }: LiveSignalStripProps) {
  const visibleItems = items.filter((item) => item.text.trim() && item.href.trim());

  if (!visibleItems.length) {
    return null;
  }

  return (
    <section className="live-strip" aria-label={ariaLabel}>
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
                  <span className="live-strip__item-text">{item.text}</span>
                </a>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
